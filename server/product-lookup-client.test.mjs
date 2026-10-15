// Exercise the real TypeScript client with Expo adapters mocked. No live paid calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { validateReceiptAnalysis } from '../shared/receipt-contract.mjs';
import { validateProductLookupRequest, validateProductLookupResult } from '../shared/product-lookup-contract.mjs';
const compiled = ts.transpileModule(readFileSync(new URL('../lib/ai-client.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const request = { merchantName: 'Costco', productCode: '2022263', originalDescription: 'CHIFORESTVTY', interpretedName: 'Chi Forest Sparkling Water' };
const result = { status: 'possible', product: { name: 'Chi Forest Sparkling Water', brand: null, size: null }, source: { title: 'Costco', url: 'https://costco.com/water', domain: 'costco.com' }, matchReason: 'Name-level evidence' };
function client(fetchImpl, { base = 'https://receipt-service.com/receipt-decoded/', dev = false, hostUri, quickTimeout = false } = {}) {
 const exports = {};
 runInNewContext(compiled, { exports, URL, FormData, AbortController, __DEV__: dev, process: { env: { EXPO_PUBLIC_AI_BASE_URL: base } }, setTimeout: (fn, ms) => setTimeout(fn, quickTimeout ? 5 : ms), clearTimeout,
  require(name) {
   if (name === 'expo-constants') return { __esModule: true, default: { expoConfig: { hostUri } } };
   if (name === 'expo-file-system') return { File: class { constructor() { assert.fail('Lookup must not access the receipt photo'); } } };
   if (name === 'expo/fetch') return { fetch: fetchImpl };
   if (name === '../shared/receipt-contract.mjs') return { validateReceiptAnalysis };
   if (name === '../shared/product-lookup-contract.mjs') return { validateProductLookupRequest, validateProductLookupResult };
   throw Error(`Unexpected import ${name}`);
  },
 }); return exports;
}
test('client sends only bounded product fields with namespaced backend URL and validates returned result', async () => {
 let calls = 0;
 const api = client(async (url, init) => { calls++; assert.equal(url, 'https://receipt-service.com/receipt-decoded/api/product/lookup'); assert.equal(init.method, 'POST'); assert.deepEqual(JSON.parse(init.body), request); assert.equal(init.headers['Content-Type'], 'application/json'); assert.ok(init.signal); return Response.json(result); });
 assert.deepEqual(JSON.parse(JSON.stringify(await api.lookupProduct(request, new AbortController().signal))), result); assert.equal(calls, 1);
 await assert.rejects(api.lookupProduct({ ...request, photo: 'x' }, new AbortController().signal), error => error.code === 'INVALID_REQUEST'); assert.equal(calls, 1);
});
test('client preserves secure backend configuration and development LAN-host conventions', async () => {
 let calls = 0;
 await assert.rejects(client(() => { calls++; }, { base: 'http://public-service.com' }).lookupProduct(request, new AbortController().signal), error => error.code === 'SERVICE_UNAVAILABLE'); assert.equal(calls, 0);
 await client(async url => { assert.equal(url, 'http://192.168.1.100:8791/api/product/lookup'); return Response.json({ status: 'not_found' }); }, { base: 'http://localhost:8791', dev: true, hostUri: '192.168.1.100:8084' }).lookupProduct(request, new AbortController().signal);
});
test('client handles typed service/rate errors and rejects fabricated, unsafe or oversized results', async () => {
 for (const [response, code] of [[Response.json({ error: { code: 'RATE_LIMITED', message: 'Wait' } }, { status: 429 }), 'RATE_LIMITED'], [Response.json({ ...result, source: { ...result.source, url: 'javascript:alert(1)' } }), 'INVALID_LOOKUP'], [Response.json({ status: 'not_found', product: { name: 'Fabricated' } }), 'INVALID_LOOKUP'], [new Response('bad json'), 'INVALID_LOOKUP'], [new Response('x'.repeat(17000)), 'INVALID_LOOKUP']]) {
  await assert.rejects(client(async () => response).lookupProduct(request, new AbortController().signal), error => error.code === code);
 }
 await assert.rejects(client(async () => { throw Error('network'); }).lookupProduct(request, new AbortController().signal), error => error.code === 'NETWORK_ERROR');
});
test('client timeout and caller cancellation are distinct and never automatically retry', async () => {
 let calls = 0;
 const api = client(async (_url, init) => { calls++; return new Promise((resolve, reject) => { if (init.signal.aborted) reject(Error('aborted')); else init.signal.addEventListener('abort', () => reject(Error('aborted')), { once: true }); }); }, { quickTimeout: true });
 await assert.rejects(api.lookupProduct(request, new AbortController().signal), error => error.code === 'LOOKUP_TIMEOUT'); assert.equal(calls, 1);
 const controller = new AbortController(); controller.abort(); await assert.rejects(api.lookupProduct(request, controller.signal), error => error.code === 'CANCELED'); assert.equal(calls, 2);
});
