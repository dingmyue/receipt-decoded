// Synthetic, deterministic UI regressions. Never contains a shopper's receipt.
import { normalizeReceipt } from '../server/receipt-analyzer.mjs';
import { costco } from './receipt-data.mjs';
import { validateReceiptAnalysis } from '../shared/receipt-contract.mjs';
const copy = value => structuredClone(value);
const known = normalizeReceipt(costco());
const warnings = [
 'Some related amounts could not be verified. Review the original receipt.',
 'The currency could not be read reliably.',
 'An unlinked fee, discount or correction needs manual review.',
 'The readable charges do not add up to the printed total.',
 'Summary entries were excluded from the purchased products.'
];
const unknown = copy(known);
unknown.receipt = { merchantName:'Synthetic Test Market',purchaseDate:'2026-10-12',currency:null,totalCents:4517 };
unknown.analysis = {status:'partial',warnings};
unknown.duplicateGroups[0].units = null;
unknown.duplicateGroups[0].potentialExtraCents = null;
const partialKnown = copy(known);
partialKnown.receipt.merchantName = 'Synthetic Test Market';
partialKnown.analysis = {status:'partial',warnings:[warnings[0],warnings[3]]};
const mixed = copy(partialKnown);
const extraLines = copy(unknown.lineItems).map(line => ({...line,id:`unknown-${line.id}`,relatedLineItemId:line.relatedLineItemId?`unknown-${line.relatedLineItemId}`:null}));
mixed.lineItems.push(...extraLines);
const extraGroup = copy(unknown.duplicateGroups[0]);
extraGroup.id = 'unknown-group';extraGroup.productName = 'Synthetic second product';extraGroup.relatedLineItemIds = extraGroup.relatedLineItemIds.map(id=>`unknown-${id}`);
mixed.duplicateGroups.push(extraGroup);
const clean = copy(known);clean.duplicateGroups = [];
const partialEmpty = copy(clean);partialEmpty.analysis = {status:'partial',warnings};
const unknownComplete = copy(unknown);unknownComplete.analysis.status = 'complete';
const unreadable = {receipt:{merchantName:null,purchaseDate:null,currency:null,totalCents:null},lineItems:[],duplicateGroups:[],analysis:{status:'unreadable',warnings:['The receipt could not be read.']}};
export const uiResultsFixtures = {known,unknown,partialKnown,mixed,clean,partialEmpty,unknownComplete,unreadable};
for(const fixture of Object.values(uiResultsFixtures))validateReceiptAnalysis(fixture);
export const unknownGroupId = unknown.duplicateGroups[0].id;
