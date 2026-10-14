import type { DuplicateGroup, ReceiptAnalysis, ReceiptLineItem } from '../lib/types';
export type ReceiptReviewState = { groupIds: string[]; reviewedIds: string[] };
export type ReceiptReviewAction = { type: 'reset'; groups?: DuplicateGroup[] } | { type: 'set-reviewed'; id: string; reviewed: boolean };
export type ReviewItem = {
  id: string; name: string; printed: string | null; unitCents: number | null; count: number | null;
  amount: string; reviewedAmount: string; lines: ReceiptLineItem[]; explanation: string; hasDetails: boolean;
};
export function createReceiptReviewState(groups?: DuplicateGroup[]): ReceiptReviewState;
export function receiptReviewReducer(state: ReceiptReviewState, action: ReceiptReviewAction): ReceiptReviewState;
export function formatReviewPrice(cents: number | null, currency: string | null): string;
export function presentReceiptResults(result: ReceiptAnalysis, reviewedIds?: readonly string[]): {
  kind: 'unreadable' | 'empty' | 'reviewed' | 'review'; title: string; body: string;
  active: ReviewItem[]; reviewed: ReviewItem[]; reviewCount: number; reviewedCount: number;
  incomplete: boolean; warnings: string[]; notice: string; showNotice: boolean;
};
