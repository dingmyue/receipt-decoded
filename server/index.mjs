import { createServer } from "node:http";
import { isIP } from "node:net";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { HttpError } from "./errors.mjs";
import { prepareImageInputs, analyzeImages } from "./receipt-analyzer.mjs";
import { createUsageGuard } from "./usage-guard.mjs";
import { renderPage } from "./public-pages.mjs";
import { lookupProduct } from "./product-lookup.mjs";
import { validateProductLookupRequest, validateProductLookupResult } from "../shared/product-lookup-contract.mjs";

const positive = (value, fallback, name, max = Number.MAX_SAFE_INTEGER) => {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value); if (!Number.isSafeInteger(n) || n < 1 || n > max) throw new Error(`${name} must be a positive integer within its supported range.`);
  return n;
};
export function loadConfig(env = process.env) {
  const hops = Number(env.TRUST_PROXY_HOPS ?? "0");
  if (!Number.isInteger(hops) || hops < 0 || hops > 2) throw new Error("TRUST_PROXY_HOPS must be 0, 1, or 2.");
  const config = {
    port: positive(env.PORT, 8787, "PORT", 65535), openAiApiKey: env.OPENAI_API_KEY?.trim() || undefined,
    receiptModel: env.OPENAI_RECEIPT_MODEL?.trim() || "gpt-4.1-mini",
    maxRequestBytes: positive(env.MAX_REQUEST_BYTES, 8 * 1024 * 1024, "MAX_REQUEST_BYTES", 12 * 1024 * 1024),
    rateLimitWindowMs: positive(env.RATE_LIMIT_WINDOW_MS, 60_000, "RATE_LIMIT_WINDOW_MS"),
    rateLimitMaxRequests: positive(env.RATE_LIMIT_MAX_REQUESTS, 6, "RATE_LIMIT_MAX_REQUESTS"),
    maxConcurrentRequests: positive(env.MAX_CONCURRENT_REQUESTS, 2, "MAX_CONCURRENT_REQUESTS", 8),
    analysisTimeoutMs: positive(env.ANALYSIS_TIMEOUT_MS, 90_000, "ANALYSIS_TIMEOUT_MS", 120_000),
    dailyRequestLimit: positive(env.DAILY_ANALYSIS_LIMIT, 100, "DAILY_ANALYSIS_LIMIT"),
    dailyBudgetCents: positive(env.DAILY_AI_BUDGET_CENTS, 500, "DAILY_AI_BUDGET_CENTS"),
    monthlyBudgetCents: positive(env.MONTHLY_AI_BUDGET_CENTS, 2000, "MONTHLY_AI_BUDGET_CENTS"),
    maxScanBudgetCents: positive(env.MAX_SCAN_BUDGET_CENTS, 10, "MAX_SCAN_BUDGET_CENTS"),
    usageStatePath: env.USAGE_STATE_PATH === ":memory:" ? null : (env.USAGE_STATE_PATH?.trim() || "server-data/usage.json"),
    trustProxyHops: hops
  };
  config.productLookupModel = env.OPENAI_PRODUCT_LOOKUP_MODEL?.trim() || "gpt-4.1-mini";
  if (!/^(?:gpt-4\.1|gpt-4\.1-mini)(?:-2025-04-14)?$/.test(config.productLookupModel)) throw new Error("OPENAI_PRODUCT_LOOKUP_MODEL must be a supported GPT-4.1 or GPT-4.1 mini model (including its 2025-04-14 snapshot).");
  config.productLookupTimeoutMs = positive(env.PRODUCT_LOOKUP_TIMEOUT_MS, 20_000, "PRODUCT_LOOKUP_TIMEOUT_MS", 30_000);
  config.productLookupMaxRequestBytes = 4096;
  config.productLookupMaxResponseBytes = 256 * 1024;
  config.productLookupMaxSearchCalls = positive(env.PRODUCT_LOOKUP_MAX_SEARCH_CALLS, 3, "PRODUCT_LOOKUP_MAX_SEARCH_CALLS", 3);
  const mini = config.productLookupModel.includes("mini");
  // Conservative ceiling: 128k search context per call + bounded normalization, two outputs and tool fees.
  const minimumReservation = Math.ceil(((128_000 * config.productLookupMaxSearchCalls + 100_000) * (mini ? 0.4 : 2) + 2000 * (mini ? 1.6 : 8)) / 10_000 + config.productLookupMaxSearchCalls);
  config.productLookupBudgetCents = positive(env.PRODUCT_LOOKUP_BUDGET_CENTS, mini ? 25 : 110, "PRODUCT_LOOKUP_BUDGET_CENTS");
  if (config.productLookupBudgetCents < minimumReservation) throw new Error("PRODUCT_LOOKUP_BUDGET_CENTS is below the conservative model/tool reservation.");
  config.productLookupProtection = {
    rateLimitWindowMs: positive(env.PRODUCT_LOOKUP_RATE_WINDOW_MS, 60_000, "PRODUCT_LOOKUP_RATE_WINDOW_MS"),
    rateLimitMaxRequests: positive(env.PRODUCT_LOOKUP_RATE_MAX, 6, "PRODUCT_LOOKUP_RATE_MAX"),
    maxConcurrentRequests: positive(env.PRODUCT_LOOKUP_MAX_CONCURRENT, 2, "PRODUCT_LOOKUP_MAX_CONCURRENT", 8),
    dailyRequestLimit: positive(env.PRODUCT_LOOKUP_DAILY_LIMIT, 100, "PRODUCT_LOOKUP_DAILY_LIMIT"),
    dailyBudgetCents: positive(env.PRODUCT_LOOKUP_DAILY_BUDGET_CENTS, 500, "PRODUCT_LOOKUP_DAILY_BUDGET_CENTS"),
    monthlyBudgetCents: positive(env.PRODUCT_LOOKUP_MONTHLY_BUDGET_CENTS, 2000, "PRODUCT_LOOKUP_MONTHLY_BUDGET_CENTS"),
    maxScanBudgetCents: config.productLookupBudgetCents,
    usageStatePath: env.PRODUCT_LOOKUP_USAGE_STATE_PATH === ":memory:" || (!env.PRODUCT_LOOKUP_USAGE_STATE_PATH && config.usageStatePath === null) ? null : env.PRODUCT_LOOKUP_USAGE_STATE_PATH?.trim() || "server-data/product-lookup-usage.json",
  };
  if (config.usageStatePath && config.productLookupProtection.usageStatePath && resolve(config.usageStatePath) === resolve(config.productLookupProtection.usageStatePath)) throw new Error("Product lookup and receipt analysis must use separate accounting files.");
  if (env.NODE_ENV === "production" && !config.openAiApiKey) throw new Error("OPENAI_API_KEY is required for production analysis.");
  return config;
}

export function createRateLimiter(config, now = Date.now) {
  const buckets = new Map();
  return (key) => {
    const time = now(); for (const [k, b] of buckets) if (b.resetAt <= time) buckets.delete(k);
    let b = buckets.get(key);
    if (!b) {
      if (buckets.size >= 10_000) return { allowed: false, retryAfterSeconds: Math.ceil(config.rateLimitWindowMs / 1000) };
      b = { count: 0, resetAt: time + config.rateLimitWindowMs }; buckets.set(key, b);
    }
    b.count++;
    return { allowed: b.count <= config.rateLimitMaxRequests, retryAfterSeconds: Math.max(1, Math.ceil((b.resetAt - time) / 1000)) };
  };
}
export function clientAddress(request, hops) {
  const forwarded = String(request.headers["x-forwarded-for"] ?? "").split(",").map((s) => s.trim());
  if (hops > 0 && forwarded.length >= hops && isIP(forwarded.at(-hops))) return forwarded.at(-hops);
  return request.socket.remoteAddress || "unknown";
}
function readBody(request, max, product = false) {
  return new Promise((yes, no) => {
    const chunks = []; let size = 0;
    const clean = () => { request.off("data", data); request.off("end", end); request.off("error", error); request.off("aborted", error); };
    const data = (chunk) => { size += chunk.length; if (size > max) { clean(); no(new HttpError(413, "REQUEST_TOO_LARGE", product ? "Product lookup input is too large." : "This photo is too large. Choose a smaller receipt photo.")); } else chunks.push(chunk); };
    const end = () => { clean(); yes(Buffer.concat(chunks)); };
    const error = () => { clean(); no(new HttpError(400, "INVALID_REQUEST", product ? "Product lookup input was interrupted." : "The photo upload was interrupted. Please try again.")); };
    request.on("data", data); request.once("end", end); request.once("error", error); request.once("aborted", error);
  });
}
function json(response, status, value, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers }); response.end(JSON.stringify(value));
}
export function createRequestListener(config = loadConfig(), hooks = {}) {
  const rateLimit = hooks.rateLimit ?? createRateLimiter(config);
  const guard = hooks.guard ?? createUsageGuard(config);
  const analyzer = hooks.analyze ?? ((images, signal) => analyzeImages(images, config, signal));
  const productRateLimit = hooks.productRateLimit ?? createRateLimiter(config.productLookupProtection);
  const productGuard = hooks.productGuard ?? createUsageGuard(config.productLookupProtection);
  const productLookup = hooks.productLookup ?? ((input, signal) => lookupProduct(input, config, signal));
  return (request, response) => {
    const controller = new AbortController();
    response.once("close", () => { if (!response.writableEnded) controller.abort(); });
    const handle = async () => {
      const requestPath = new URL(request.url || "/", "http://localhost").pathname;
      const prefix = config.routePrefix ?? "";
      if (prefix && !requestPath.startsWith(`${prefix}/`)) throw new HttpError(404, "NOT_FOUND", "Endpoint not found.");
      const path = prefix ? requestPath.slice(prefix.length) : requestPath;
      if (path === "/api/product/lookup") {
        if (request.method !== "POST") { response.setHeader("Allow", "POST"); throw new HttpError(405, "METHOD_NOT_ALLOWED", "Use POST for this endpoint."); }
        const limit = productRateLimit(clientAddress(request, config.trustProxyHops));
        if (!limit.allowed) { response.setHeader("Retry-After", String(limit.retryAfterSeconds)); throw new HttpError(429, "RATE_LIMITED", "Please wait a minute before looking up more products."); }
        if (Number(request.headers["content-length"] ?? 0) > config.productLookupMaxRequestBytes) throw new HttpError(413, "REQUEST_TOO_LARGE", "Product lookup input is too large.");
        if (!/^application\/json(?:;|$)/i.test(request.headers["content-type"] ?? "")) throw new HttpError(415, "INVALID_REQUEST", "Provide product-identification fields as JSON.");
        let input;
        try { input = validateProductLookupRequest(JSON.parse((await readBody(request, config.productLookupMaxRequestBytes, true)).toString("utf8"))); }
        catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "INVALID_REQUEST", "Provide only valid product-identification fields."); }
        if (!config.openAiApiKey && !hooks.productLookup) throw new HttpError(503, "SERVICE_UNAVAILABLE", "Product lookup is temporarily unavailable.");
        let release; const started = Date.now();
        try {
          release = productGuard.enter(); await productGuard.reserve();
          const { result, usage } = await productLookup(input, controller.signal);
          const validated = validateProductLookupResult(result);
          await productGuard.record(usage ?? {});
          if (!controller.signal.aborted) json(response, 200, validated);
          if (!hooks.productLookup) console.info(JSON.stringify({ event: "product_lookup_complete", durationMs: Date.now() - started, status: validated.status,
            inputTokens: usage?.inputTokens ?? 0, outputTokens: usage?.outputTokens ?? 0, searchCalls: usage?.searchCalls ?? 0 }));
        } catch (error) {
          if (!hooks.productLookup) console.info(JSON.stringify({ event: "product_lookup_failed", durationMs: Date.now() - started, code: error instanceof HttpError ? error.code : "INVALID_LOOKUP" }));
          if (error instanceof HttpError) throw new HttpError(error.status, error.code, ["DAILY_LIMIT", "MONTHLY_LIMIT", "SERVER_BUSY"].includes(error.code) ? "Product lookup has reached its service limit. Please try again later." : error.message);
          throw new HttpError(502, "INVALID_LOOKUP", "This product lookup couldn't be verified. Please try again.");
        } finally { release?.(); }
        return;
      }
      if (path === "/health") {
        if (request.method !== "GET") { response.setHeader("Allow", "GET"); throw new HttpError(405, "METHOD_NOT_ALLOWED", "Use GET for this endpoint."); }
        request.resume(); json(response, 200, { ok: true, analysisAvailable: Boolean(config.openAiApiKey) }); return;
      }
      const page = { "/privacy": "privacy", "/support": "support", "/terms": "terms" }[path];
      if (page && request.method === "GET") {
        request.resume(); response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'" }); response.end(renderPage(page, prefix)); return;
      }
      if (path !== "/api/receipt/analyze") throw new HttpError(404, "NOT_FOUND", "Endpoint not found.");
      if (request.method !== "POST") { response.setHeader("Allow", "POST"); throw new HttpError(405, "METHOD_NOT_ALLOWED", "Use POST for this endpoint."); }
      const limit = rateLimit(clientAddress(request, config.trustProxyHops));
      if (!limit.allowed) { response.setHeader("Retry-After", String(limit.retryAfterSeconds)); throw new HttpError(429, "RATE_LIMITED", "You've checked several receipts recently. Please wait a minute and try again."); }
      if (Number(request.headers["content-length"] ?? 0) > config.maxRequestBytes) throw new HttpError(413, "REQUEST_TOO_LARGE", "This photo is too large. Choose a smaller receipt photo.");
      const type = request.headers["content-type"] ?? "";
      if (!type.startsWith("multipart/form-data;")) throw new HttpError(415, "INVALID_UPLOAD", "Please upload one receipt photo.");
      const release = guard.enter();
      try {
        const bytes = await readBody(request, config.maxRequestBytes);
        let form;
        try { form = await new Request("http://localhost", { method: "POST", headers: { "Content-Type": type }, body: bytes }).formData(); }
        catch { throw new HttpError(400, "INVALID_UPLOAD", "The photo upload couldn't be read. Please try again."); }
        if (form.get("consentToAi") !== "true") throw new HttpError(400, "CONSENT_REQUIRED", "Please agree to AI processing before checking this receipt.");
        if ([...form.keys()].some((k) => !["image", "consentToAi"].includes(k)) || form.getAll("image").length !== 1 || form.getAll("consentToAi").length !== 1) throw new HttpError(400, "INVALID_UPLOAD", "Please upload exactly one receipt photo.");
        const image = form.get("image");
        if (!image || typeof image === "string" || image.size === 0) throw new HttpError(400, "INVALID_UPLOAD", "Choose a receipt photo first.");
        const images = await prepareImageInputs(Buffer.from(await image.arrayBuffer()), image.type);
        if (!config.openAiApiKey && !hooks.analyze) throw new HttpError(503, "SERVICE_UNAVAILABLE", "Receipt checks are temporarily unavailable. Please try again later.");
        await guard.reserve();
        const started = Date.now(); const { result, usage } = await analyzer(images, controller.signal);
        await guard.record(usage ?? {});
        if (controller.signal.aborted) return;
        json(response, 200, result);
        if (!hooks.analyze) console.info(JSON.stringify({ event: "analysis_complete", durationMs: Date.now() - started, ...usage }));
      } finally { release(); }
    };
    void handle().catch((error) => {
      if (response.destroyed) return;
      if (response.headersSent) { response.destroy(); return; }
      const known = error instanceof HttpError;
      if (!known) console.error("Unexpected receipt backend error.");
      request.resume(); json(response, known ? error.status : 500, { error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "This receipt couldn't be checked. Please try again." } }, { Connection: "close" });
    });
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const config = loadConfig(); const server = createServer(createRequestListener(config));
    server.requestTimeout = 30_000; server.headersTimeout = 15_000;
    server.on("error", () => { console.error("Receipt backend could not start. Check PORT and whether it is in use."); process.exitCode = 1; });
    server.listen(config.port, "0.0.0.0", () => console.log(`Receipt Decoded backend listening on port ${config.port}.`));
    for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 10_000).unref(); });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
