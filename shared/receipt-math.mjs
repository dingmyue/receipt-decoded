// Cents only. Retain the most expensive purchased units for a conservative estimate.
export function potentialExtraCents(units, purchasedQuantity = 1) {
  if (!units || !Number.isInteger(purchasedQuantity) || purchasedQuantity < 1) return null;
  const extra = Math.max(0, units.length - purchasedQuantity);
  return [...units].sort((a, b) => a.totalCents - b.totalCents)
    .slice(0, extra).reduce((sum, unit) => sum + unit.totalCents, 0);
}

export function summarizeGroups(groups, quantities) {
  let amountCents = 0, unknownAmounts = 0, unresolved = 0, possibleErrors = 0, expected = 0;
  for (const group of groups) {
    const quantity = quantities[group.id] ?? null;
    if (quantity !== null && group.recordedQuantity !== null && quantity >= group.recordedQuantity) {
      expected++; continue;
    }
    if (quantity === null) unresolved++; else possibleErrors++;
    const amount = potentialExtraCents(group.units, quantity ?? 1);
    if (amount === null) unknownAmounts++; else amountCents += amount;
  }
  return { amountCents: unknownAmounts && amountCents === 0 ? null : amountCents,
    unknownAmounts, unresolved, possibleErrors, expected };
}
