const TYPES = new Set(["product", "fee", "discount", "tax", "reversal", "summary", "payment", "unknown"]);
const STATUSES = new Set(["complete", "partial", "unreadable"]);
const fail = () => { throw new Error("Invalid receipt analysis."); };
const object = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v, max = 300) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const nullableText = (v, max = 300) => v === null || text(v, max);
const money = (v) => v === null || (Number.isSafeInteger(v) && Math.abs(v) <= 100_000_000);
const quantity = (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 500);

export function validateReceiptBase(v) {
  if (!object(v) || !object(v.receipt) || !object(v.analysis) || !Array.isArray(v.lineItems) || v.lineItems.length > 250) fail();
  const r = v.receipt;
  if (!nullableText(r.merchantName, 100) || !nullableText(r.purchaseDate, 10) || !money(r.totalCents)) fail();
  if (r.purchaseDate !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(r.purchaseDate) || !Number.isFinite(Date.parse(r.purchaseDate)) || new Date(r.purchaseDate).toISOString().slice(0, 10) !== r.purchaseDate)) fail();
  if (r.currency !== null && (typeof r.currency !== "string" || !/^[A-Z]{3}$/.test(r.currency))) fail();
  if (!STATUSES.has(v.analysis.status) || !Array.isArray(v.analysis.warnings) || v.analysis.warnings.length > 12 || !v.analysis.warnings.every((s) => text(s, 300))) fail();
  const ids = new Set();
  for (const l of v.lineItems) {
    if (!object(l) || !text(l.id, 40) || ids.has(l.id) || !text(l.originalDescription, 200) || !nullableText(l.interpretedName, 120) || !nullableText(l.productCode, 60) || !quantity(l.quantity) || !money(l.amountCents) || !money(l.unitAmountCents) || !TYPES.has(l.lineType) || !nullableText(l.relatedLineItemId, 40)) fail();
    if (l.unitAmountCents !== null && l.unitAmountCents < 0 && !["discount", "reversal"].includes(l.lineType)) fail();
    if (["discount", "reversal"].includes(l.lineType) && l.amountCents !== null && l.amountCents > 0) fail();
    if (["product", "fee"].includes(l.lineType) && l.amountCents !== null && l.amountCents < 0) fail();
    ids.add(l.id);
  }
  const byId = new Map(v.lineItems.map((l) => [l.id, l]));
  for (const l of v.lineItems) {
    if (l.relatedLineItemId !== null && (!ids.has(l.relatedLineItemId) || l.relatedLineItemId === l.id)) fail();
    if (l.relatedLineItemId !== null) {
      const target = byId.get(l.relatedLineItemId).lineType;
      if (!["fee", "discount", "reversal"].includes(l.lineType) || (l.lineType === "reversal" ? !["product", "fee"].includes(target) : target !== "product")) fail();
    }
  }
  if (v.analysis.status === "unreadable" && v.lineItems.length) fail();
  return byId;
}

export function validateReceiptAnalysis(v) {
  const byId = validateReceiptBase(v);
  if (!Array.isArray(v.duplicateGroups) || v.duplicateGroups.length > 40) fail();
  const ids = new Set(), owned = new Set();
  for (const g of v.duplicateGroups) {
    if (!object(g) || !text(g.id, 40) || ids.has(g.id) || !text(g.productName, 120) || !text(g.originalDescription, 200) || !nullableText(g.productCode, 60) || !quantity(g.recordedQuantity) || !money(g.potentialExtraCents) || !text(g.explanation, 300) || g.verificationStatus !== "unverified" || !Array.isArray(g.relatedLineItemIds) || !g.relatedLineItemIds.length) fail();
    if (g.potentialExtraCents !== null && g.potentialExtraCents < 0) fail();
    if (new Set(g.relatedLineItemIds).size !== g.relatedLineItemIds.length) fail();
    for (const id of g.relatedLineItemIds) { if (!byId.has(id) || owned.has(id)) fail(); owned.add(id); }
    if (g.units !== null) {
      if (!Array.isArray(g.units) || g.units.length !== g.recordedQuantity || g.units.length < 2 || g.units.length > 500) fail();
      for (const u of g.units) {
        if (!object(u) || ![u.productCents, u.feeCents, u.discountCents, u.totalCents].every((n) => Number.isSafeInteger(n) && Math.abs(n) <= 100_000_000) || u.productCents < 0 || u.feeCents < 0 || u.discountCents > 0 || u.totalCents < 0 || u.totalCents !== u.productCents + u.feeCents + u.discountCents) fail();
      }
      const sum = [...g.units].sort((a, b) => a.totalCents - b.totalCents).slice(0, -1).reduce((n, u) => n + u.totalCents, 0);
      if (sum !== g.potentialExtraCents) fail();
    } else if (g.potentialExtraCents !== null) fail();
    ids.add(g.id);
  }
  if (v.analysis.status === "unreadable" && v.duplicateGroups.length) fail();
  return v;
}
