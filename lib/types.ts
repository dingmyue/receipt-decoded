export type HealthResponse = { ok: true; analysisAvailable?: boolean };
export type ApiErrorResponse = { error: { code: string; message: string } };
export type ReceiptPhoto = { uri: string; mimeType: "image/jpeg"; width: number; height: number; size: number };
export type ReceiptLineItem = {
  id: string; originalDescription: string; interpretedName: string | null;
  productCode: string | null; quantity: number | null; amountCents: number | null;
  unitAmountCents: number | null;
  lineType: "product" | "fee" | "discount" | "tax" | "reversal" | "summary" | "payment" | "unknown";
  relatedLineItemId: string | null;
};
export type ChargeUnit = { productCents: number; feeCents: number; discountCents: number; totalCents: number };
export type DuplicateGroup = {
  id: string; productName: string; originalDescription: string; productCode: string | null;
  relatedLineItemIds: string[]; recordedQuantity: number | null;
  potentialExtraCents: number | null; explanation: string; units: ChargeUnit[] | null;
  verificationStatus: "unverified";
};
export type ReceiptAnalysis = {
  receipt: { merchantName: string | null; purchaseDate: string | null; currency: string | null; totalCents: number | null };
  lineItems: ReceiptLineItem[]; duplicateGroups: DuplicateGroup[];
  analysis: { status: "complete" | "partial" | "unreadable"; warnings: string[] };
};
