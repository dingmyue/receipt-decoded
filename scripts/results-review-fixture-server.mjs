// Local UI verification only. No credentials, provider calls, or production changes.
import { createServer } from 'node:http';
import { createRequestListener, loadConfig } from '../server/index.mjs';
import { resultsReviewFixtures } from '../tests/results-review-fixtures.mjs';
import { uiResultsFixtures } from '../tests/ui-results-fixtures.mjs';
const fixtures = { ...resultsReviewFixtures, unreadable: uiResultsFixtures.unreadable };
let scenario = 'complete', checks = 0;
const config = loadConfig({ PORT: '8791', USAGE_STATE_PATH: ':memory:', RATE_LIMIT_MAX_REQUESTS: '100' });
const handler = createRequestListener(config, { analyze: async () => {
  checks++;
  return { result: structuredClone(fixtures[scenario]), usage: { inputTokens: 0, outputTokens: 0 } };
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
    response.end(JSON.stringify({ scenario, checks, providerCalls: 0 })); return;
  }
  handler(request, response);
});
server.listen(8791, '127.0.0.1', () => console.log('Local synthetic Results UI server on port 8791; provider calls disabled.'));
process.on('SIGINT', () => server.close(() => process.exit(0)));
