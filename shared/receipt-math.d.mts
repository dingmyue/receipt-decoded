import type { ChargeUnit, DuplicateGroup } from "../lib/types";
export function potentialExtraCents(units: ChargeUnit[] | null, purchasedQuantity?: number): number | null;
export function summarizeGroups(groups: DuplicateGroup[], quantities: Record<string, number | null>): {
  amountCents: number | null; unknownAmounts: number; unresolved: number; possibleErrors: number; expected: number;
};
