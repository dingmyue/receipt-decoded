// Local UI verification only. No credentials, provider calls, or production changes.
import { createServer } from 'node:http';
import { createRequestListener, loadConfig } from '../server/index.mjs';
import { resultsReviewFixtures } from '../tests/results-review-fixtures.mjs';
import { uiResultsFixtures } from '../tests/ui-results-fixtures.mjs';
import { HttpError } from '../server/errors.mjs';
import { validateProductLookupResult } from '../shared/product-lookup-contract.mjs';
const fixtures = { ...resultsReviewFixtures, unreadable: uiResultsFixtures.unreadable };
let scenario = 'complete', checks = 0;
let lookupScenario = 'matched', lookupDelayMs = 1200, lookupCalls = {};
const config = loadConfig({ PORT: '8791', USAGE_STATE_PATH: ':memory:', RATE_LIMIT_MAX_REQUESTS: '100', PRODUCT_LOOKUP_RATE_MAX: '100', PRODUCT_LOOKUP_DAILY_BUDGET_CENTS: '100000', PRODUCT_LOOKUP_MONTHLY_BUDGET_CENTS: '100000' });
const handler = createRequestListener(config, { analyze: async () => {
  checks++;
  return { result: structuredClone(fixtures[scenario]), usage: { inputTokens: 0, outputTokens: 0 } };
}, productLookup: async input => {
  const key = input.productCode ?? input.originalDescription; lookupCalls[key] = (lookupCalls[key] ?? 0) + 1;
  const selected = lookupScenario;
  await new Promise(resolve => setTimeout(resolve, lookupDelayMs));
  if (selected === 'error') throw new HttpError(503, 'SERVICE_UNAVAILABLE', 'Mock lookup failure.');
  if (selected === 'not_found') return { result: { status: 'not_found' } };
  const result = { status: selected === 'possible' || selected === 'long' ? 'possible' : 'matched',
    product: { name: selected === 'long' ? 'Muffin Mix with Chocolate Chips, Whole Grains, Vanilla and Naturally Flavored Baking Ingredients in a Family Variety Pack' : input.interpretedName ?? input.originalDescription,
      brand: selected === 'long' ? null : 'Fixture brand', size: selected === 'long' ? null : '500g' },
    source: { title: 'Costco product page (synthetic UI fixture)', url: 'https://www.costco.com/', domain: 'costco.com' }, matchReason: 'Matched using retailer item number.' };
  return { result: validateProductLookupResult(result) };
} });
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:8791');
  if (url.pathname === '/__test/scenario' && request.method === 'POST') {
    const next = url.searchParams.get('name');
    if (!Object.hasOwn(fixtures, next)) { response.writeHead(400); response.end('Unknown fixture'); return; }
    scenario = next;
    response.end(scenario); return;
  }
  if (url.pathname === '/__test/status') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ scenario, checks, lookupScenario, lookupCalls, providerCalls: 0 })); return;
  }
  if (url.pathname === '/__test/lookup' && request.method === 'POST') {
    const next = url.searchParams.get('name');
    if (!['matched', 'possible', 'not_found', 'error', 'long'].includes(next)) { response.writeHead(400); response.end('Unknown lookup fixture'); return; }
    lookupScenario = next;
    const delay = Number(url.searchParams.get('delay') ?? 1200);
    lookupDelayMs = Number.isInteger(delay) && delay >= 0 && delay <= 5000 ? delay : 1200;
    if (url.searchParams.get('reset') === 'true') lookupCalls = {};
    response.end(lookupScenario); return;
  }
  handler(request, response);
});
server.listen(8791, '127.0.0.1', () => console.log('Local synthetic Results UI server on port 8791; provider calls disabled.'));
process.on('SIGINT', () => server.close(() => process.exit(0)));
