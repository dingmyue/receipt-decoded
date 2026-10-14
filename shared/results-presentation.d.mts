import type { ReceiptAnalysis } from '../lib/types';
import type { summarizeGroups } from './receipt-math.mjs';
export function presentReceiptResults(result: ReceiptAnalysis, quantities?: Record<string, number | null>): {
  summary: ReturnType<typeof summarizeGroups>; allExpected: boolean;
  kind: 'unreadable' | 'uncertain' | 'expected' | 'flagged' | 'clean';
  tone: 'amber' | 'green'; title: string; body: string | null;
  amountCents: number | null; amountLabel: string | null; amountQualifier: string | null;
  showMetadata: boolean; showItems: boolean; showRetry: boolean; showDetails: boolean;
};
