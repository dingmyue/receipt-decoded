import { summarizeGroups } from './receipt-math.mjs';

// Keep uncertainty precedence independent of screen layout and quantity controls.
export function presentReceiptResults(result, quantities = {}) {
  const groups = result.duplicateGroups;
  const summary = summarizeGroups(groups, quantities);
  const allExpected = groups.length > 0 && summary.expected === groups.length;
  const unreadable = result.analysis.status === 'unreadable';
  const currencyUnclear = groups.length > 0 && !allExpected && !result.receipt.currency;
  const uncertain = result.analysis.status === 'partial' || summary.unknownAmounts > 0 || currencyUnclear;
  const assumption = summary.unresolved > 0 ? 'Assumes one of each unchecked item was bought.' : 'Based on your quantities.';
  const base = {
    summary, allExpected, showMetadata: !unreadable, showItems: !unreadable,
    showRetry: unreadable || uncertain,
    showDetails: result.analysis.warnings.length > 0 || uncertain,
    amountCents: null, amountLabel: null, amountQualifier: null,
  };
  if (unreadable) return { ...base, kind: 'unreadable', tone: 'amber', title: "We couldn't read this receipt", body: 'Include the whole receipt and keep prices in focus.' };
  if (uncertain) {
    const amountCents = !currencyUnclear && !allExpected && summary.amountCents > 0 ? summary.amountCents : null;
    return {
      ...base, kind: 'uncertain', tone: 'amber', title: 'Some charges are unclear',
      body: allExpected ? 'Repeated quantities match, but other charges need review.' : groups.length > 0 ? `Check the repeated item${groups.length === 1 ? '' : 's'} below or try a clearer photo.` : 'Try a clearer photo or review the original receipt.',
      amountCents, amountLabel: amountCents === null ? null : 'Readable potential extra',
      amountQualifier: amountCents === null ? null : `${assumption} Other amounts couldn't be verified.`,
    };
  }
  if (allExpected) return { ...base, kind: 'expected', tone: 'green', title: 'Repeated charges match your quantities', body: "This doesn't guarantee the receipt is error-free." };
  if (groups.length > 0) return { ...base, kind: 'flagged', tone: 'amber', title: `Check ${groups.length} repeated item${groups.length === 1 ? '' : 's'}`, body: null, amountCents: summary.amountCents, amountLabel: 'Potential extra charge', amountQualifier: assumption };
  return { ...base, kind: 'clean', tone: 'green', title: 'No obvious duplicates', body: 'AI can miss charges. Check anything that looks unusual.' };
}
