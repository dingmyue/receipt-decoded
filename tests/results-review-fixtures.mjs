// Approved UX examples, used only by automated tests and the local screenshot server.
import { normalizeReceipt } from '../server/receipt-analyzer.mjs';
import { validateReceiptAnalysis } from '../shared/receipt-contract.mjs';
import { line, rawReceipt } from './receipt-data.mjs';
const examples = [
  ['muffin', '62418', 'Muffin Mix 500g', 249, 2],
  ['enchilada', '59393', 'Chk Enchilada 500g', 699, 3],
  ['pancake', '44348', 'Pancake Choc 325g', 199, 2],
];
const lines = examples.flatMap(([id, productCode, name, price, count]) => Array.from({ length: count }, (_, index) => {
  const product = line(`${id}-${index}`, `${productCode} ${name}`, price, { productCode, interpretedName: name });
  return id === 'enchilada' ? [product, line(`${id}-discount-${index}`, 'New price', -140, { lineType: 'discount', relatedLineItemId: product.id, unitAmountCents: null })] : [product];
}).flat());
const complete = normalizeReceipt(rawReceipt(lines, { receipt: { merchantName: 'Synthetic Test Market', purchaseDate: '2026-10-12', currency: null, totalCents: 2573 } }));
// Unknown currency is intentional: match the prototype without inventing USD.
complete.analysis = { status: 'complete', warnings: [] };
const partial = structuredClone(complete);
partial.analysis = { status: 'partial', warnings: ['Some related discounts could not be verified. Review the original receipt.'] };
const missingPrice = structuredClone(partial);
missingPrice.duplicateGroups[0].units = null;
missingPrice.duplicateGroups[0].potentialExtraCents = null;
for (const item of missingPrice.lineItems.filter(item => missingPrice.duplicateGroups[0].relatedLineItemIds.includes(item.id))) {
  item.unitAmountCents = null; item.amountCents = null;
}
const empty = structuredClone(complete); empty.duplicateGroups = [];
const emptyPartial = structuredClone(empty); emptyPartial.analysis = structuredClone(partial.analysis);
export const resultsReviewFixtures = { complete, partial, missingPrice, empty, emptyPartial };
for (const fixture of Object.values(resultsReviewFixtures)) validateReceiptAnalysis(fixture);
