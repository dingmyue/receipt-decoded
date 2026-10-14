// Presentation only: user review never changes the receipt analysis or billing math.
function stableGroupIds(groups) {
  const ids = groups.map(group => group.id);
  if (ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
    throw new Error('Receipt review requires unique, stable group IDs.');
  }
  return ids;
}

export function createReceiptReviewState(groups = []) {
  return { groupIds: stableGroupIds(groups), reviewedIds: [] };
}

export function receiptReviewReducer(state, action) {
  if (action.type === 'reset') return createReceiptReviewState(action.groups);
  if (action.type !== 'set-reviewed' || !state.groupIds.includes(action.id)) return state;
  const reviewedIds = state.reviewedIds.filter(id => id !== action.id);
  if (action.reviewed) reviewedIds.push(action.id);
  return { ...state, reviewedIds };
}

export function formatReviewPrice(cents, currency) {
  if (cents === null) return 'Price unclear';
  if (!currency) return (cents / 100).toFixed(2);
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100); }
  catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
}

function presentGroup(group, result) {
  const lines = result.lineItems.filter(line => group.relatedLineItemIds.includes(line.id));
  const products = lines.filter(line => line.lineType === 'product');
  // Product prices exclude linked fees/discounts. Conflicting or missing values stay unclear.
  const prices = group.units?.map(unit => unit.productCents) ?? products.map(line => line.unitAmountCents);
  const unitCents = prices.length && prices.every(price => Number.isSafeInteger(price) && price >= 0 && price === prices[0]) ? prices[0] : null;
  const name = group.productName.trim() || group.originalDescription.trim();
  let printed = group.originalDescription.trim();
  if (group.productCode && !printed.toLowerCase().includes(group.productCode.toLowerCase())) printed = `${group.productCode} ${printed}`;
  const comparable = text => text.toLowerCase().replace(/[\s\p{P}]+/gu, '');
  if (comparable(name) === comparable(printed)) printed = null;
  const price = formatReviewPrice(unitCents, result.receipt.currency);
  const count = group.recordedQuantity;
  return {
    id: group.id, name, printed, unitCents, count,
    amount: `${price}${unitCents === null ? '' : ' each'} · ${count === null ? 'Quantity unclear' : `${count} on receipt`}`,
    reviewedAmount: `${price} · ${count === null ? 'Quantity unclear' : `×${count}`}`,
    lines, explanation: group.explanation,
    hasDetails: lines.length > 0 || !!group.explanation.trim(),
  };
}

export function presentReceiptResults(result, reviewedIds = []) {
  stableGroupIds(result.duplicateGroups); // The API contract also rejects missing/duplicate IDs.
  const unreadable = result.analysis.status === 'unreadable';
  const groups = unreadable ? [] : result.duplicateGroups.map(group => presentGroup(group, result));
  const checked = new Set(reviewedIds);
  const active = groups.filter(group => !checked.has(group.id));
  const reviewed = groups.filter(group => checked.has(group.id));
  const incomplete = result.analysis.status === 'partial'
    || groups.some(group => group.unitCents === null || group.count === null || !result.receipt.currency)
    || result.duplicateGroups.some(group => group.units === null);
  const kind = unreadable ? 'unreadable' : !groups.length ? 'empty' : !active.length ? 'reviewed' : 'review';
  const title = unreadable ? "We couldn't read this receipt"
    : !groups.length ? incomplete ? 'No repeated items identified' : 'No repeated items found'
    : !active.length ? 'All items reviewed'
    : `${active.length} ${active.length === 1 ? 'item' : 'items'} to review`;
  const body = unreadable ? 'Include the whole receipt and keep prices in focus.'
    : !groups.length ? incomplete ? 'Some details may be incomplete. Review the original receipt or try a clearer photo.' : 'No repeated products were identified on this receipt. You can still check the original photo.'
    : !active.length ? "You've checked all repeated items on this receipt."
    : 'Check off items that look correct.';
  return {
    kind, title, body, active, reviewed, reviewCount: active.length, reviewedCount: reviewed.length,
    incomplete, warnings: result.analysis.warnings,
    notice: incomplete ? 'Some receipt details may be incomplete' : 'Receipt notes',
    showNotice: incomplete || result.analysis.warnings.length > 0,
  };
}
