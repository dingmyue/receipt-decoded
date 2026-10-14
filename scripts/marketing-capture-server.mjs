// Local screenshot fixture server. No credential is read and no provider is called.
import {createServer} from 'node:http';
import {createRequestListener,loadConfig} from '../server/index.mjs';
import {normalizeReceipt} from '../server/receipt-analyzer.mjs';
import {line,rawReceipt} from '../tests/receipt-data.mjs';
import {validateReceiptAnalysis} from '../shared/receipt-contract.mjs';
const product=(id)=>line(id,'Sparkling water',1789,{productCode:'000123',interpretedName:'Sparkling water'});
const fee=(id,related)=>line(id,'Container deposit',120,{lineType:'fee',relatedLineItemId:related,productCode:null,interpretedName:'Container deposit'});
const sample=normalizeReceipt(rawReceipt([product('p1'),fee('f1','p1'),product('p2'),fee('f2','p2')],{receipt:{merchantName:'Sample Market',purchaseDate:'2026-10-12',currency:'USD',totalCents:3818}}));
validateReceiptAnalysis(sample);
if(sample.analysis.status!=='complete'||sample.duplicateGroups.length!==1||sample.duplicateGroups[0].potentialExtraCents!==1909)throw Error('Invalid marketing example');
let checks=0;
const config=loadConfig({PORT:'8790',USAGE_STATE_PATH:':memory:',RATE_LIMIT_MAX_REQUESTS:'30'});
const handler=createRequestListener(config,{analyze:async()=>{checks++;return{result:structuredClone(sample),usage:{inputTokens:0,outputTokens:0}};}});
const server=createServer((req,res)=>{
 if(req.url==='/__capture/status'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({synthetic:true,checks,providerCalls:0,potentialExtraCents:1909}));return;}
 handler(req,res);
});
server.listen(8790,'127.0.0.1',()=>console.log('Synthetic screenshot backend atlocalhost8790. No API key or provider calls.'));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
