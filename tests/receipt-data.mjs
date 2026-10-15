export const line = (id, description, amount, overrides={}) => ({id, originalDescription:description, interpretedName:null, productCode:description==='CHIFORESTVTY'?'1449879':null, quantity:1, amountCents:amount, unitAmountCents:amount, lineType:'product', relatedLineItemId:null, ...overrides});
export const rawReceipt = (lineItems, overrides={}) => ({receipt:{merchantName:'Test Market',purchaseDate:'2026-10-12',currency:'USD',totalCents:lineItems.reduce((sum,l)=>sum+(['product','fee','discount','tax','reversal'].includes(l.lineType)?l.amountCents??0:0),0)},lineItems, duplicateCandidates:[],analysis:{status:'complete',warnings:[]},...overrides});
export const costco = () => rawReceipt([
 line('p1','CHIFORESTVTY',1789),line('f1','CRV',120,{lineType:'fee',relatedLineItemId:'p1'}),
 line('p2','CHIFORESTVTY',1789),line('f2','CRV',120,{lineType:'fee',relatedLineItemId:'p2'})
]);
// Manually transcribed financial rows only; no personal/payment data or stored photo.
export const traderJoesTea = () => rawReceipt([
 line('milk1','ORGANIC LACTOSE FREE 2%',569),
 line('milk2','A2 ORGANIC WHOLE MILK',599),line('milk3','A2 ORGANIC WHOLE MILK',599),
 line('tea','GOLDEN OOLONG TEA',845,{quantity:5,unitAmountCents:169}),
 line('deposit','Bottle Deposit',25,{quantity:5,unitAmountCents:5,lineType:'fee',relatedLineItemId:'tea'}),
 line('deposit-total','Total Bottle Deposit',25,{lineType:'summary'}),
],{receipt:{merchantName:"Trader Joe's",purchaseDate:null,currency:'USD',totalCents:2637}});
