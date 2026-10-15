import type { ProductLookupRequest, ProductLookupResult } from '../lib/types';
export function validateProductLookupRequest(value: unknown): ProductLookupRequest;
export function validateProductLookupResult(value: unknown): ProductLookupResult;
export function safeProductUrl(value: unknown): { url: string; domain: string } | null;
