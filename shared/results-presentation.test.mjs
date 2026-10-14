import test from 'node:test';
import assert from 'node:assert/strict';
import { createReceiptReviewState, formatReviewPrice, presentReceiptResults, receiptReviewReducer } from './results-presentation.mjs';
import { resultsReviewFixtures as fixtures } from '../tests/results-review-fixtures.mjs';
import { uiResultsFixtures as legacy } from '../tests/ui-results-fixtures.mjs';
const groups = fixtures.complete.duplicateGroups;
const initial = () => createReceiptReviewState(groups);
const check = (state, id, reviewed = true) => receiptReviewReducer(state, { type: 'set-reviewed', id, reviewed });

test('initial count counts distinct groups, with no reviewed items or money claims', () => {
  const view = presentReceiptResults(fixtures.complete, initial().reviewedIds);
  assert.equal(view.title, '3 items to review');
  assert.equal(view.body, 'Check off items that look correct.');
  assert.equal(view.reviewCount, 3);
  assert.equal(view.reviewedCount, 0);
  assert.equal(view.active[0].amount, '2.49 each · 2 on receipt');
  assert.equal(view.active[1].amount, '6.99 each · 3 on receipt');
  assert.equal(view.active[2].amount, '1.99 each · 2 on receipt');
  assert.equal('amountCents' in view, false);
});
test('checking moves only the selected item into Reviewed and uses singular copy', () => {
  const state = check(initial(), groups[0].id);
  const view = presentReceiptResults(fixtures.complete, state.reviewedIds);
  assert.equal(view.title, '2 items to review');
  assert.deepEqual(view.active.map(item => item.id), groups.slice(1).map(group => group.id));
  assert.deepEqual(view.reviewed.map(item => item.id), [groups[0].id]);
  assert.equal(presentReceiptResults(fixtures.complete, check(state, groups[1].id).reviewedIds).title, '1 item to review');
  assert.deepEqual(initial().reviewedIds, []);
});
test('all reviewed has calm completion copy and undo restores stable original order', () => {
  const all = groups.reduce((state, group) => check(state, group.id), initial());
  const done = presentReceiptResults(fixtures.complete, all.reviewedIds);
  assert.equal(done.title, 'All items reviewed');
  assert.equal(done.body, "You've checked all repeated items on this receipt.");
  assert.equal(done.active.length, 0);
  assert.equal(done.reviewedCount, 3);
  const undoLast = check(all, groups[2].id, false);
  const undoFirst = check(undoLast, groups[0].id, false);
  const undone = presentReceiptResults(fixtures.complete, undoFirst.reviewedIds);
  assert.deepEqual(undone.active.map(item => item.id), [groups[0].id, groups[2].id]);
  assert.equal(undone.reviewCount, 2);
});
test('review state is idempotent, ignores stale IDs, and resets for any new analysis including reused IDs', () => {
  const checked = check(initial(), groups[0].id);
  assert.deepEqual(check(checked, groups[0].id), checked);
  assert.equal(check(checked, 'not-a-group'), checked);
  const reset = receiptReviewReducer(checked, { type: 'reset', groups: structuredClone(groups) });
  assert.deepEqual(reset.reviewedIds, []);
  assert.equal(presentReceiptResults(fixtures.complete, reset.reviewedIds).reviewCount, 3);
  assert.deepEqual(receiptReviewReducer(checked, { type: 'reset' }), { groupIds: [], reviewedIds: [] });
});
test('stable IDs preserve selection across group reorder and reject missing or duplicate identities', () => {
  const changedOrder = structuredClone(fixtures.complete); changedOrder.duplicateGroups.reverse();
  const view = presentReceiptResults(changedOrder, [groups[0].id, 'stale']);
  assert.equal(view.reviewed[0].id, groups[0].id);
  assert.equal(view.reviewCount, 2);
  assert.throws(() => createReceiptReviewState([{ id: '' }]));
  assert.throws(() => createReceiptReviewState([groups[0], groups[0]]));
  changedOrder.duplicateGroups[0].id = changedOrder.duplicateGroups[1].id;
  assert.throws(() => presentReceiptResults(changedOrder));
});
test('empty complete and partial analyses use distinct neutral headlines', () => {
  const complete = presentReceiptResults(fixtures.empty);
  assert.equal(complete.title, 'No repeated items found');
  assert.equal(complete.showNotice, false);
  const partial = presentReceiptResults(fixtures.emptyPartial);
  assert.equal(partial.title, 'No repeated items identified');
  assert.match(partial.body, /Some details may be incomplete/);
  assert.equal(partial.showNotice, true);
});
test('partial status and every backend warning remain available even after all items are reviewed', () => {
  for (const reviewedIds of [[], groups.map(group => group.id)]) {
    const view = presentReceiptResults(fixtures.partial, reviewedIds);
    assert.equal(view.incomplete, true);
    assert.equal(view.notice, 'Some receipt details may be incomplete');
    assert.deepEqual(view.warnings, fixtures.partial.analysis.warnings);
  }
  const view = presentReceiptResults(legacy.unknown);
  assert.deepEqual(view.warnings, legacy.unknown.analysis.warnings);
});
test('missing or mixed unit prices never guess; consistent product prices exclude fees and discounts', () => {
  assert.equal(presentReceiptResults(fixtures.missingPrice).active[0].amount, 'Price unclear · 2 on receipt');
  const varied = structuredClone(fixtures.complete);
  varied.duplicateGroups[0].units[0].productCents = 200;
  assert.equal(presentReceiptResults(varied).active[0].unitCents, null);
  const fallback = structuredClone(fixtures.complete);
  fallback.duplicateGroups[0].units = null;
  assert.equal(presentReceiptResults(fallback).active[0].unitCents, 249);
  assert.equal(presentReceiptResults(legacy.known).active[0].unitCents, 1789);
  assert.equal(presentReceiptResults(fixtures.complete).active[1].unitCents, 699);
});
test('unknown count and currency stay honest; printed names and codes add useful context', () => {
  const fixture = structuredClone(fixtures.complete);
  fixture.duplicateGroups[0].recordedQuantity = null;
  const item = presentReceiptResults(fixture).active[0];
  assert.equal(item.amount, '2.49 each · Quantity unclear');
  assert.equal(item.printed, '62418 Muffin Mix 500g');
  assert.equal(formatReviewPrice(249, null), '2.49');
  assert.equal(formatReviewPrice(249, 'USD'), '$2.49');
  assert.equal(formatReviewPrice(249, 'GBP'), '£2.49');
  assert.equal(formatReviewPrice(null, 'USD'), 'Price unclear');
  fixture.duplicateGroups[0].originalDescription = 'Muffin Mix 500g';
  assert.equal(presentReceiptResults(fixture).active[0].printed, '62418 Muffin Mix 500g');
  fixture.duplicateGroups[0].productCode = null;
  assert.equal(presentReceiptResults(fixture).active[0].printed, null);
});
test('unreadable preserves the existing recovery copy and warnings instead of a misleading empty result', () => {
  const view = presentReceiptResults(legacy.unreadable);
  assert.equal(view.kind, 'unreadable');
  assert.equal(view.title, "We couldn't read this receipt");
  assert.equal(view.body, 'Include the whole receipt and keep prices in focus.');
  assert.deepEqual(view.warnings, legacy.unreadable.analysis.warnings);
  assert.equal(view.showNotice, true);
});
test('presentation and review actions never mutate the API response', () => {
  const original = structuredClone(fixtures.partial);
  const state = check(initial(), groups[0].id);
  presentReceiptResults(fixtures.partial, state.reviewedIds);
  assert.deepEqual(fixtures.partial, original);
});
