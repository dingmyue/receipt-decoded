import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductLookupSession } from './product-lookup-session.mjs';
import { presentReceiptResults, createReceiptReviewState, receiptReviewReducer } from './results-presentation.mjs';
import { resultsReviewFixtures } from '../tests/results-review-fixtures.mjs';
const request = { merchantName: 'Costco', productCode: '1', originalDescription: 'Test product', interpretedName: null };
const none = { status: 'not_found' };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
test('idle session does no work; first expansion loads immediately and coalesces concurrent requests', async () => {
 const wait = deferred(); let calls = 0; const session = createProductLookupSession(async () => { calls++; return wait.promise; });
 assert.deepEqual(session.snapshot(), {}); assert.equal(calls, 0);
 const first = session.ensure('group-1', request); assert.equal(session.snapshot()['group-1'].status, 'loading');
 assert.equal(session.ensure('group-1', request), first); await Promise.resolve(); assert.equal(calls, 1);
 wait.resolve(none); await first; assert.deepEqual(session.snapshot()['group-1'], none);
 await session.ensure('group-1', request); assert.equal(calls, 1);
});
test('cards maintain separate states and cache matches plus no-match results across reopen/navigation', async () => {
 const waits = [deferred(), deferred()]; let calls = 0; const session = createProductLookupSession(() => waits[calls++].promise);
 const first = session.ensure('a', request), second = session.ensure('b', request); await Promise.resolve();
 waits[1].resolve(none); await second; assert.equal(session.snapshot().a.status, 'loading'); assert.equal(session.snapshot().b.status, 'not_found');
 const match = { status: 'possible', product: { name: 'A very long supported product name '.repeat(6), brand: null, size: null }, source: { title: 'Costco', url: 'https://costco.com/product', domain: 'costco.com' }, matchReason: 'Name-level evidence' };
 waits[0].resolve(match); await first;
 // This store belongs to the provider, not the Results screen or card.
 const afterReturn = session; await afterReturn.ensure('a', request); await afterReturn.ensure('b', request); assert.equal(calls, 2); assert.deepEqual(session.snapshot().a, match);
});
test('checking and undo preserve analysis, count, presentation and pending lookup', async () => {
 const result = structuredClone(resultsReviewFixtures.complete), original = structuredClone(result); let review = createReceiptReviewState(result.duplicateGroups);
 const wait = deferred(); const session = createProductLookupSession(() => wait.promise), id = result.duplicateGroups[0].id;
 const lookup = session.ensure(id, request); review = receiptReviewReducer(review, { type: 'set-reviewed', id, reviewed: true }); assert.equal(presentReceiptResults(result, review.reviewedIds).reviewCount, 2);
 assert.equal(session.snapshot()[id].status, 'loading'); wait.resolve(none); await lookup;
 review = receiptReviewReducer(review, { type: 'set-reviewed', id, reviewed: false }); assert.equal(presentReceiptResults(result, review.reviewedIds).reviewCount, 3); assert.equal(session.snapshot()[id].status, 'not_found'); assert.deepEqual(result, original);
});
test('failed lookup is cached until manual retry; only one retry can be pending', async () => {
 let calls = 0; const session = createProductLookupSession(async () => { if (++calls === 1) throw Error('network'); return none; });
 await session.ensure('a', request); assert.equal(session.snapshot().a.status, 'error');
 await session.ensure('a', request); assert.equal(calls, 1);
 const retry = session.ensure('a', request, true); assert.equal(session.ensure('a', request, true), retry); await retry; assert.equal(calls, 2); assert.equal(session.snapshot().a.status, 'not_found');
});
test('new scan aborts/reset all states and ignores old responses even with reused group IDs', async () => {
 const waits = [deferred(), deferred()]; const signals = []; let calls = 0;
 const session = createProductLookupSession((_request, signal) => { signals.push(signal); return waits[calls++].promise; });
 const old = session.ensure('group-1', request); await Promise.resolve(); session.reset(); assert.equal(signals[0].aborted, true); assert.deepEqual(session.snapshot(), {});
 const current = session.ensure('group-1', request); await Promise.resolve(); waits[0].resolve(none); await old; assert.equal(session.snapshot()['group-1'].status, 'loading');
 assert.equal(session.ensure('group-1', request), current); waits[1].resolve(none); await current; assert.equal(calls, 2); assert.equal(session.snapshot()['group-1'].status, 'not_found');
});
test('background/revocation abort pending work without invalidating cached completed results', async () => {
 const wait = deferred(); let calls = 0; const session = createProductLookupSession(async () => ++calls === 1 ? none : wait.promise);
 await session.ensure('cached', request); const pending = session.ensure('pending', request); await Promise.resolve(); session.cancelPending(); assert.equal(session.snapshot().cached.status, 'not_found'); assert.equal(session.snapshot().pending.status, 'error');
 wait.resolve(none); await pending; assert.equal(session.snapshot().pending.status, 'error'); session.reset(); assert.deepEqual(session.snapshot(), {});
});
test('session uses only React Native-compatible AbortSignal methods', async () => {
 const session = createProductLookupSession(async (_request, signal) => {
  assert.equal(signal.aborted, false); return none;
 });
 const original = AbortSignal.prototype.throwIfAborted;
 try { AbortSignal.prototype.throwIfAborted = undefined; await session.ensure('native', request); assert.equal(session.snapshot().native.status, 'not_found'); }
 finally { AbortSignal.prototype.throwIfAborted = original; }
});
