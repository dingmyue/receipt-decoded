import type { ProductLookupRequest, ProductLookupResult, ProductLookupState } from '../lib/types';
export function createProductLookupSession(
  lookup: (request: ProductLookupRequest, signal: AbortSignal) => Promise<ProductLookupResult>,
  onChange?: (states: Record<string, ProductLookupState>) => void,
): { snapshot: () => Record<string, ProductLookupState>; ensure: (id: string, request: ProductLookupRequest, retry?: boolean) => Promise<ProductLookupState>; reset: () => void; cancelPending: () => void };
