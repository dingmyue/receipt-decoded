// Local marketing fixture server. No credential is read and no provider is called.
import { createServer } from 'node:http';
import { createRequestListener, loadConfig } from '../server/index.mjs';
import { resultsReviewFixtures } from '../tests/results-review-fixtures.mjs';
import { validateReceiptAnalysis } from '../shared/receipt-contract.mjs';
const sample = structuredClone(resultsReviewFixtures.complete);
sample.receipt.merchantName = 'Sample Market';
sample.receipt.currency = 'USD';
validateReceiptAnalysis(sample);
let checks = 0;
const config = loadConfig({ PORT: '8790', USAGE_STATE_PATH: ':memory:', RATE_LIMIT_MAX_REQUESTS: '30' });
const handler = createRequestListener(config, { analyze: async () => {
  checks++;
  return { result: structuredClone(sample), usage: { inputTokens: 0, outputTokens: 0 } };
} });
const server = createServer((request, response) => {
  if (request.url === '/__capture/status') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ synthetic: true, checks, providerCalls: 0, duplicateGroups: sample.duplicateGroups.length })); return;
  }
  handler(request, response);
});
server.listen(8790, '127.0.0.1', () => console.log('Synthetic marketing backend on localhost:8790. No API key or provider calls.'));
process.on('SIGINT', () => server.close(() => process.exit(0)));
