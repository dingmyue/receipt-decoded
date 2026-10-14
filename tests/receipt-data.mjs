export const line = (id, description, amount, overrides={}) => ({id, originalDescription:description, interpretedName:null, productCode:description==='CHIFORESTVTY'?'1449879':null, quantity:1, amountCents:amount, unitAmountCents:amount, lineType:'product', relatedLineItemId:null, ...overrides});
export const rawReceipt = (lineItems, overrides={}) => ({receipt:{merchantName:'Test Market',purchaseDate:'2026-10-12',currency:'USD',totalCents:lineItems.reduce((sum,l)=>sum+(['product','fee','discount','tax','reversal'].includes(l.lineType)?l.amountCents??0:0),0)},lineItems, duplicateCandidates:[],analysis:{status:'complete',warnings:[]},...overrides});
export const costco = () => rawReceipt([
 line('p1','CHIFORESTVTY',1789),line('f1','CRV',120,{lineType:'fee',relatedLineItemId:'p1'}),
 line('p2','CHIFORESTVTY',1789),line('f2','CRV',120,{lineType:'fee',relatedLineItemId:'p2'})
]);
