import test from 'node:test';
import assert from 'node:assert/strict';
import { presentReceiptResults } from './results-presentation.mjs';
import { uiResultsFixtures as fixtures } from '../tests/ui-results-fixtures.mjs';

test('unknown amount uses one uncertain status without a monetary placeholder or assumption caption', () => {
  const result = presentReceiptResults(fixtures.unknown);
  assert.equal(result.kind, 'uncertain');
  assert.equal(result.tone, 'amber');
  assert.equal(result.amountCents, null);
  assert.equal(result.amountLabel, null);
  assert.equal(result.amountQualifier, null);
  assert.equal(result.showItems, true);
  assert.equal(result.showRetry, true);
  assert.equal(result.showDetails, true);
});
test('quantity answers cannot turn a partial check into a clean or zero-amount result', () => {
  const id = fixtures.partialKnown.duplicateGroups[0].id;
  const result = presentReceiptResults(fixtures.partialKnown, { [id]: 2 });
  assert.equal(result.allExpected, true);
  assert.equal(result.kind, 'uncertain');
  assert.equal(result.tone, 'amber');
  assert.equal(result.amountCents, null);
  assert.match(result.body, /other charges need review/);
});
test('known partial and mixed receipts retain a readable subtotal without claiming a complete total', () => {
  for (const fixture of [fixtures.partialKnown, fixtures.mixed]) {
    const result = presentReceiptResults(fixture);
    assert.equal(result.kind, 'uncertain');
    assert.equal(result.amountCents, 1909);
    assert.equal(result.amountLabel, 'Readable potential extra');
  }
});
test('a missing currency suppresses the monetary headline even when arithmetic is supported', () => {
  const fixture = structuredClone(fixtures.known);
  fixture.receipt.currency = null;
  const result = presentReceiptResults(fixture);
  assert.equal(result.summary.amountCents, 1909);
  assert.equal(result.kind, 'uncertain');
  assert.equal(result.amountCents, null);
});
test('unknown amounts remain uncertain even when extraction reports complete', () => {
  assert.equal(presentReceiptResults(fixtures.unknownComplete).kind, 'uncertain');
});
test('unreadable and empty partial receipts offer recovery without fabricated money or product rows', () => {
  const unreadable = presentReceiptResults(fixtures.unreadable);
  assert.equal(unreadable.kind, 'unreadable');
  assert.equal(unreadable.showMetadata, false);
  assert.equal(unreadable.showItems, false);
  assert.equal(unreadable.showDetails, true);
  assert.equal(unreadable.showRetry, true);
  assert.equal(unreadable.amountCents, null);
  const empty = presentReceiptResults(fixtures.partialEmpty);
  assert.equal(empty.kind, 'uncertain');
  assert.equal(empty.showRetry, true);
  assert.equal(empty.amountCents, null);
});
test('complete checks retain conditional estimates and qualified clean/expected outcomes', () => {
  const flagged = presentReceiptResults(fixtures.known);
  assert.equal(flagged.kind, 'flagged');
  assert.equal(flagged.amountCents, 1909);
  const id = fixtures.known.duplicateGroups[0].id;
  const expected = presentReceiptResults(fixtures.known, { [id]: 2 });
  assert.equal(expected.kind, 'expected');
  assert.equal(expected.amountCents, null);
  assert.equal(expected.tone, 'green');
  const clean = presentReceiptResults(fixtures.clean);
  assert.equal(clean.kind, 'clean');
  assert.equal(clean.amountCents, null);
  assert.equal(clean.showRetry, false);
});
