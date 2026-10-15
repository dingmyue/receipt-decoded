import test from 'node:test';
import assert from 'node:assert/strict';
import { potentialExtraCents, summarizeGroups } from './receipt-math.mjs';
import { normalizeReceipt } from '../server/receipt-analyzer.mjs';
import { validateReceiptAnalysis } from './receipt-contract.mjs';
import { costco, rawReceipt, line, traderJoesTea } from '../tests/receipt-data.mjs';
test('Costco regression: two product rows plus their CRV equal 1909 conditional cents',()=>{
 const result=normalizeReceipt(costco()), g=result.duplicateGroups[0];
 assert.equal(result.duplicateGroups.length,1);assert.equal(g.recordedQuantity,2);assert.equal(g.potentialExtraCents,1909);assert.equal(g.relatedLineItemIds.length,4);
 assert.equal(summarizeGroups([g],{}).amountCents,1909);assert.equal(summarizeGroups([g],{[g.id]:1}).possibleErrors,1);
 assert.equal(summarizeGroups([g],{[g.id]:2}).amountCents,0);assert.equal(summarizeGroups([g],{[g.id]:2}).expected,1);
 assert.equal(summarizeGroups([g],{[g.id]:null}).unresolved,1);
});
test('one quantity-two charge is reviewable without counting annotations or summaries as purchases',()=>{
 const r=normalizeReceipt(rawReceipt([line('p','EGGS',1398,{quantity:2,unitAmountCents:699}),line('s','FSA',1398,{lineType:'summary'}),line('t','TOTAL',1398,{lineType:'summary'})]));assert.equal(r.duplicateGroups.length,1);
 assert.equal(r.duplicateGroups[0].recordedQuantity,2);assert.deepEqual(r.duplicateGroups[0].relatedLineItemIds,['p']);assert.equal(r.duplicateGroups[0].potentialExtraCents,699);
});
test('five teas and linked deposits are one unverified quantity review, alongside the repeated milk',()=>{
 for(const candidate of [[],[{productLineItemIds:['tea']}]]){
  const raw=traderJoesTea();raw.duplicateCandidates=candidate;
  const r=normalizeReceipt(raw), g=r.duplicateGroups.find(g=>g.originalDescription==='GOLDEN OOLONG TEA');
  assert.equal(r.analysis.status,'complete');assert.equal(r.duplicateGroups.length,2);
  assert.equal(g.recordedQuantity,5);assert.equal(g.verificationStatus,'unverified');assert.deepEqual(g.relatedLineItemIds,['tea','deposit']);
  assert.equal(g.units.length,5);assert.ok(g.units.every(u=>u.productCents===169&&u.feeCents===5));
  assert.equal(potentialExtraCents(g.units,4),174);assert.equal(potentialExtraCents(g.units,5),0);
  assert.match(g.explanation,/one charge/);
 }
});
test('multi-unit quantities remain visible with missing or inconsistent prices and no invented estimate',()=>{
 for(const price of [{amountCents:null,unitAmountCents:null},{amountCents:845,unitAmountCents:null},{amountCents:845,unitAmountCents:170}]){
  const raw=rawReceipt([line('tea','TEA',845,{quantity:5,unitAmountCents:169,...price})]);
  // 8.45 / 5 can be derived exactly when only the unit price is absent.
  const g=normalizeReceipt(raw).duplicateGroups[0];assert.equal(g.recordedQuantity,5);
  if(price.amountCents===null||price.unitAmountCents===170){assert.equal(g.units,null);assert.equal(g.potentialExtraCents,null);}
  else assert.equal(g.units[0].productCents,169);
 }
});
test('quantity-row corrections suppress zero/one remaining unit and retain multiple or uncertain units',()=>{
 for(const [reversed,quantity] of [[845,0],[676,1],[169,4],[100,null]]){
  const raw=rawReceipt([line('tea','TEA',845,{quantity:5,unitAmountCents:169}),line('r','VOID',-reversed,{lineType:'reversal',unitAmountCents:null,relatedLineItemId:'tea'})]);
  const r=normalizeReceipt(raw);assert.equal(r.duplicateGroups.length,quantity===0||quantity===1?0:1);
  if(r.duplicateGroups.length) assert.equal(r.duplicateGroups[0].recordedQuantity,quantity);
 }
});
test('pack sizes, one/unknown quantities and multi-unit fees/summaries/payments do not create quantity reviews',()=>{
 const raw=rawReceipt([line('p','TEA 5 PACK',845),line('u','TEA',200,{quantity:null}),...['fee','summary','tax','payment'].map((lineType,i)=>line(`x${i}`,'5 ITEMS',25,{lineType,quantity:5,unitAmountCents:5}))]);
 assert.equal(normalizeReceipt(raw).duplicateGroups.length,0);
 for(const quantity of [1,null]){raw.duplicateCandidates=[{productLineItemIds:['p']}];raw.lineItems[0].quantity=quantity;assert.throws(()=>normalizeReceipt(raw));}
});
test('complete product reversal suppresses the corrected duplicate',()=>{
 const raw=costco();raw.lineItems.push(line('r','VOID',-1789,{lineType:'reversal',unitAmountCents:-1789,relatedLineItemId:'p2'}));assert.equal(normalizeReceipt(raw).duplicateGroups.length,0);
});
test('discounts and fee reversals reduce estimates, without double counting',()=>{
 const raw=costco();raw.lineItems.push(line('d','COUPON',-200,{lineType:'discount',unitAmountCents:null,relatedLineItemId:'p2'}),line('r','VOID CRV',-120,{lineType:'reversal',unitAmountCents:null,relatedLineItemId:'f2'}));const g=normalizeReceipt(raw).duplicateGroups[0];assert.equal(g.potentialExtraCents,1589);
});
test('partial quantity reversal removes only reversed units',()=>{
 const raw=rawReceipt([line('a','EGGS',2097,{quantity:3,unitAmountCents:699}),line('b','EGGS',699),line('r','VOID',-699,{lineType:'reversal',unitAmountCents:null,relatedLineItemId:'a'})]);const g=normalizeReceipt(raw).duplicateGroups[0];assert.equal(g.recordedQuantity,3);assert.equal(g.potentialExtraCents,1398);assert.equal(potentialExtraCents(g.units,2),699);
});
test('merge a model subset with remaining identical product rows',()=>{
 const raw=rawReceipt([line('a','EGGS',699),line('b','EGGS',699),line('c','EGGS',699)]);raw.duplicateCandidates=[{productLineItemIds:['a','b']}];assert.equal(normalizeReceipt(raw).duplicateGroups[0].potentialExtraCents,1398);
});
test('separate product groups contribute each estimate once',()=>{
 const r=normalizeReceipt(rawReceipt([line('a','EGGS',699),line('b','EGGS',699),line('c','MILK',450),line('d','MILK',450)]));assert.equal(r.duplicateGroups.length,2);assert.equal(summarizeGroups(r.duplicateGroups,{}).amountCents,1149);assert.equal(summarizeGroups(r.duplicateGroups,{'group-1':2}).amountCents,450);
});
test('unknown amounts and ambiguous adjustments produce partial results without invented estimates',()=>{
 for(const raw of [rawReceipt([line('a','EGGS',null),line('b','EGGS',699)]),rawReceipt([line('a','EGGS',699),line('b','EGGS',699),line('d','COUPON',-100,{lineType:'discount',unitAmountCents:null})])]) {const r=normalizeReceipt(raw);assert.equal(r.analysis.status,'partial');assert.equal(r.duplicateGroups[0].potentialExtraCents,null);assert.equal(summarizeGroups(r.duplicateGroups,{}).amountCents,null);}
});
test('different item codes are not grouped even when model proposes it',()=>{
 const raw=rawReceipt([line('a','EGGS',699,{productCode:'111'}),line('b','EGGS',699,{productCode:'222'})]);raw.duplicateCandidates=[{productLineItemIds:['a','b']}];assert.equal(normalizeReceipt(raw).duplicateGroups.length,0);
});
test('non-cent currencies retain descriptions but suppress all monetary values',()=>{
 const raw=costco();raw.receipt.currency='JPY';const r=normalizeReceipt(raw);assert.equal(r.receipt.totalCents,null);assert.ok(r.lineItems.every(l=>l.amountCents===null&&l.unitAmountCents===null));assert.equal(r.duplicateGroups[0].units,null);
});
test('estimates that individually or collectively exceed the total become unknown',()=>{
 const raw=rawReceipt([line('a','EGGS',699),line('b','EGGS',699),line('c','MILK',450),line('d','MILK',450)]);raw.receipt.totalCents=1000;const r=normalizeReceipt(raw);assert.ok(r.duplicateGroups.every(g=>g.potentialExtraCents===null));
});
test('runtime contract rejects malformed dates, links, ids and forged monetary estimates',()=>{
 for (const alter of [r=>r.receipt.purchaseDate='2026-02-30',r=>r.lineItems[1].id='p1',r=>r.lineItems[1].relatedLineItemId='f2',r=>r.lineItems[0].relatedLineItemId='p2',r=>r.duplicateCandidates=[{productLineItemIds:['p1','missing']}],r=>r.lineItems[0].amountCents=NaN]) {const raw=costco();alter(raw);assert.throws(()=>normalizeReceipt(raw));}
 const valid=normalizeReceipt(costco());valid.duplicateGroups[0].potentialExtraCents=999;assert.throws(()=>validateReceiptAnalysis(valid));
});
test('unreadable results have no fabricated products and strip payment identifiers',()=>{
 const r=normalizeReceipt(rawReceipt([],{analysis:{status:'unreadable',warnings:['Not a shopping receipt.']}}));assert.equal(r.duplicateGroups.length,0);
 const payment=normalizeReceipt(rawReceipt([line('p','VISA 1234',1000,{lineType:'payment'})]));assert.equal(payment.lineItems[0].originalDescription,'Payment details omitted');
});
test('cent apportioning stays integral, conservative, and monotonic over all quantity choices',()=>{
 for(let q=2;q<=30;q++){const raw=rawReceipt([line('a','EGGS',q*99,{quantity:q,unitAmountCents:99}),line('b','EGGS',99),line('d','COUPON',-13,{lineType:'discount',unitAmountCents:null,relatedLineItemId:'a'})]);const g=normalizeReceipt(raw).duplicateGroups[0];assert.ok(g.units.every(u=>Number.isInteger(u.totalCents)));let prior=Infinity;for(let bought=1;bought<=q+2;bought++){const n=potentialExtraCents(g.units,bought);assert.ok(n<=prior&&n>=0);prior=n;}assert.equal(g.units.reduce((s,u)=>s+u.totalCents,0),(q+1)*99-13);}
});
test('same printed item code with different prices retains all independent rows conservatively',()=>{
 const raw=rawReceipt([line('a','111 EGGS 6.99',699,{productCode:'111'}),line('b','111 EGGS 5.99',599,{productCode:'111'}),line('c','111 EGGS 6.99',699,{productCode:'111'})]);raw.duplicateCandidates=[{productLineItemIds:['a','c']}];const g=normalizeReceipt(raw).duplicateGroups[0];assert.equal(g.recordedQuantity,3);assert.equal(g.potentialExtraCents,1298);
});
test('free product rows do not become suspicious paid duplicates',()=>{
 const raw=rawReceipt([line('a','FREE SAMPLE',0),line('b','FREE SAMPLE',0)]);raw.duplicateCandidates=[{productLineItemIds:['a','b']}];assert.equal(normalizeReceipt(raw).duplicateGroups.length,0);
});
test('large receipts preserve a bounded partial review rather than failing the entire result',()=>{
 const lines=Array.from({length:45},(_,i)=>[line(`a${i}`,`PRODUCT ${i}`,100),line(`b${i}`,`PRODUCT ${i}`,100)]).flat();const r=normalizeReceipt(rawReceipt(lines));assert.equal(r.duplicateGroups.length,40);assert.equal(r.analysis.status,'partial');assert.ok(r.analysis.warnings.some(s=>s.includes('first 40')));
});
test('missing extraction rows or no readable products cannot claim a complete clean check',()=>{
 const raw=rawReceipt([line('a','EGGS',699)]);raw.receipt.totalCents=1398;assert.equal(normalizeReceipt(raw).analysis.status,'partial');assert.equal(normalizeReceipt(rawReceipt([])).analysis.status,'partial');
 const unreadable=normalizeReceipt(rawReceipt([],{analysis:{status:'unreadable',warnings:[]}}));assert.deepEqual(unreadable.receipt,{merchantName:null,purchaseDate:null,currency:null,totalCents:null});
});
test('uncertain product names use the printed description without inventing a brand or size',()=>{
 const raw=costco();for(const l of raw.lineItems.filter(l=>l.lineType==='product'))l.originalDescription='1449879 CHIFORESTVTY 17.89';const g=normalizeReceipt(raw).duplicateGroups[0];assert.equal(g.productName,'CHIFORESTVTY');assert.equal(g.originalDescription,'1449879 CHIFORESTVTY 17.89');
});
