import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { HttpError } from "./errors.mjs";
const dailyFields = ["requests", "reservedCents", "successes", "inputTokens", "outputTokens"];
const nonnegative = (n) => Number.isSafeInteger(n) && n >= 0;
const validDay = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export function createUsageGuard(config, now = Date.now) {
  let concurrent = 0, state = null, queue = Promise.resolve();
  const day = () => new Date(now()).toISOString().slice(0, 10);
  const serial = (work) => { const next = queue.then(work); queue = next.catch(() => {}); return next; };
  const persist = async () => {
    if (!config.usageStatePath) return;
    await mkdir(dirname(config.usageStatePath), { recursive: true, mode: 0o700 });
    const temp = `${config.usageStatePath}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(state), { mode: 0o600 });
    await rename(temp, config.usageStatePath);
  };
  const initialize = async () => {
    const today = day(), month = today.slice(0, 7);
    if (!state) {
      try { if (config.usageStatePath) state = JSON.parse(await readFile(config.usageStatePath, "utf8")); }
      catch (e) { if (e.code !== "ENOENT") throw e; }
      if (state && (!validDay(state.day) || !dailyFields.every((key) => nonnegative(state[key])))) throw new Error("Invalid accounting state.");
      if (state && state.schemaVersion === undefined) {
        // A legacy daily file cannot prove what was spent on earlier days this month.
        // Preserve its counters and conservatively close this month, never reset spend.
        state = { ...state, schemaVersion: 2, month: state.day.slice(0, 7), monthlyRequests: state.requests, monthlyReservedCents: state.day.slice(0, 7) === month ? Math.max(state.reservedCents, config.monthlyBudgetCents) : state.reservedCents };
        await persist();
      } else if (state && (state.schemaVersion !== 2 || !/^\d{4}-\d{2}$/.test(state.month) || state.month !== state.day.slice(0, 7) || !nonnegative(state.monthlyRequests) || !nonnegative(state.monthlyReservedCents) || state.monthlyRequests < state.requests || state.monthlyReservedCents < state.reservedCents)) throw new Error("Invalid monthly accounting state.");
    }
    if (state && (state.month > month || state.day > today)) throw new Error("Accounting clock moved backwards.");
    if (!state || state.month !== month) state = { schemaVersion: 2, month, monthlyRequests: 0, monthlyReservedCents: 0, day: today, requests: 0, reservedCents: 0, successes: 0, inputTokens: 0, outputTokens: 0 };
    else if (state.day !== today) { state.day = today; for (const key of dailyFields) state[key] = 0; }
  };
  return {
    enter() {
      if (concurrent >= config.maxConcurrentRequests) throw new HttpError(503, "SERVER_BUSY", "Other receipts are being checked. Please try again shortly.");
      concurrent++; let released = false;
      return () => { if (!released) { concurrent--; released = true; } };
    },
    reserve: () => serial(async () => {
      try {
        await initialize();
        if (state.monthlyReservedCents + config.maxScanBudgetCents > config.monthlyBudgetCents) throw new HttpError(503, "MONTHLY_LIMIT", "Receipt checks have reached this month's service limit. Please try again next month.");
        if (state.requests >= config.dailyRequestLimit || state.reservedCents + config.maxScanBudgetCents > config.dailyBudgetCents) throw new HttpError(503, "DAILY_LIMIT", "Receipt checks have reached today's service limit. Please try again later.");
        state.requests++; state.reservedCents += config.maxScanBudgetCents;
        state.monthlyRequests++; state.monthlyReservedCents += config.maxScanBudgetCents;
        await persist(); // Reserve durably BEFORE a paid call; failed calls still count.
      } catch (error) { if (error instanceof HttpError) throw error; state = null; throw new HttpError(503, "SERVICE_UNAVAILABLE", "Receipt checks are temporarily unavailable. Please try again later."); }
    }),
    record: (usage) => serial(async () => {
      if (!state || state.day !== day()) return;
      const tokens = (n) => Number.isSafeInteger(n) && n >= 0 && n <= 1_000_000 ? n : 0;
      state.successes++; state.inputTokens += tokens(usage.inputTokens); state.outputTokens += tokens(usage.outputTokens);
      await persist().catch(() => {}); // Reservation was already persisted.
    })
  };
}
