import Constants from "expo-constants";
import { File } from "expo-file-system";
import { fetch } from "expo/fetch";
import { validateReceiptAnalysis } from "../shared/receipt-contract.mjs";
import { validateProductLookupRequest, validateProductLookupResult } from "../shared/product-lookup-contract.mjs";
import type { ProductLookupRequest, ProductLookupResult, ReceiptAnalysis, ReceiptPhoto } from "./types";

export class ReceiptError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
function getBaseUrl() {
  const raw = process.env.EXPO_PUBLIC_AI_BASE_URL?.trim();
  if (!raw) throw new ReceiptError("SERVICE_UNAVAILABLE", "Receipt checks aren't available right now. Please try again later.");
  let url: URL;
  try { url = new URL(raw); } catch { throw new ReceiptError("SERVICE_UNAVAILABLE", "Receipt checks aren't available right now."); }
  if (__DEV__ && ["localhost", "127.0.0.1"].includes(url.hostname)) {
    const host = Constants.expoConfig?.hostUri?.split(":")[0];
    if (host) url.hostname = host;
  }
  if (url.protocol !== "https:" && !(__DEV__ && url.protocol === "http:")) throw new ReceiptError("SERVICE_UNAVAILABLE", "A secure receipt service is not available right now.");
  return url.toString().replace(/\/+$/, "");
}
export async function analyzeReceipt(photo: ReceiptPhoto, consent: boolean, signal: AbortSignal): Promise<ReceiptAnalysis> {
  if (!consent) throw new ReceiptError("CONSENT_REQUIRED", "Please agree to AI processing before checking this receipt.");
  const form = new FormData();
  form.append("image", new File(photo.uri), "receipt.jpg");
  form.append("consentToAi", "true");
  const timeout = new AbortController(); const timer = setTimeout(() => timeout.abort(), 110_000);
  if (signal.aborted) timeout.abort();
  const abort = () => timeout.abort(); signal.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(`${getBaseUrl()}/api/receipt/analyze`, { method: "POST", body: form, signal: timeout.signal });
    const text = await response.text();
    if (text.length > 1024 * 1024) throw new ReceiptError("INVALID_ANALYSIS", "This result couldn't be verified. Please try another photo.");
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new ReceiptError("INVALID_ANALYSIS", "This result couldn't be read. Please try again."); }
    if (!response.ok) {
      const error = body as { error?: { code?: string; message?: string } };
      throw new ReceiptError(error.error?.code ?? "SERVICE_UNAVAILABLE", typeof error.error?.message === "string" ? error.error.message.slice(0, 300) : "This receipt couldn't be checked. Please try again.");
    }
    try { return validateReceiptAnalysis(body); } catch { throw new ReceiptError("INVALID_ANALYSIS", "This result couldn't be verified. Please try another clear photo."); }
  } catch (error) {
    if (signal.aborted) throw new ReceiptError("CANCELED", "Receipt check canceled.");
    if (error instanceof ReceiptError) throw error;
    if (timeout.signal.aborted) throw new ReceiptError("ANALYSIS_TIMEOUT", "This check took too long. Please try again.");
    throw new ReceiptError("NETWORK_ERROR", "We couldn't reach the receipt service. Check your connection and try again.");
  } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
}

export async function lookupProduct(request: ProductLookupRequest, signal: AbortSignal): Promise<ProductLookupResult> {
  let input: ProductLookupRequest;
  try { input = validateProductLookupRequest(request); } catch { throw new ReceiptError("INVALID_REQUEST", "This receipt description can't be looked up."); }
  const timeout = new AbortController(), timer = setTimeout(() => timeout.abort(), 35_000);
  const abort = () => timeout.abort();
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(`${getBaseUrl()}/api/product/lookup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: timeout.signal });
    const text = await response.text();
    if (text.length > 16_384) throw new ReceiptError("INVALID_LOOKUP", "This product lookup couldn't be verified.");
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new ReceiptError("INVALID_LOOKUP", "This product lookup couldn't be read."); }
    if (!response.ok) {
      const error = body as { error?: { code?: string; message?: string } };
      throw new ReceiptError(error?.error?.code ?? "SERVICE_UNAVAILABLE", typeof error?.error?.message === "string" ? error.error.message.slice(0, 300) : "Product lookup is temporarily unavailable.");
    }
    try { return validateProductLookupResult(body); } catch { throw new ReceiptError("INVALID_LOOKUP", "This product lookup couldn't be verified."); }
  } catch (error) {
    if (signal.aborted) throw new ReceiptError("CANCELED", "Product lookup canceled.");
    if (error instanceof ReceiptError) throw error;
    if (timeout.signal.aborted) throw new ReceiptError("LOOKUP_TIMEOUT", "Product lookup took too long.");
    throw new ReceiptError("NETWORK_ERROR", "We couldn't reach the product lookup service.");
  } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
}
