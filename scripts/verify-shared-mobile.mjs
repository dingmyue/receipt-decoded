// Exercise the actual mobile client against the real shared HTTP listener.
// Expo platform adapters and both AI providers are replaced; no credentials load.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import { validateReceiptAnalysis } from '../shared/receipt-contract.mjs';
import { validateProductLookupRequest, validateProductLookupResult } from '../shared/product-lookup-contract.mjs';
import { costco, traderJoesTea } from '../tests/receipt-data.mjs';
import { normalizeReceipt } from '../server/receipt-analyzer.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const littleMoments=resolve(process.argv[2]??resolve(root,'../little-moments'));
const { createRequestListener, loadConfig }=await import(pathToFileURL(resolve(littleMoments,'server/index.mjs')));
const { normalizeReceipt: normalizeSharedReceipt }=await import(pathToFileURL(resolve(littleMoments,'server/receipt-decoded/server/receipt-analyzer.mjs')));
const productionBase='https://little-moments-api.onrender.com/receipt-decoded';
const expected=validateReceiptAnalysis(normalizeReceipt(costco()));
const expectedTea=validateReceiptAnalysis(normalizeReceipt(traderJoesTea()));
let analyzerCalls=0, lookupCalls=0;
const lookupRequest={merchantName:'Costco',productCode:'2022263',originalDescription:'CHIFORESTVTY',interpretedName:'Chi Forest Sparkling Water'};
const lookupResult={status:'possible',product:{name:'Chi Forest Sparkling Water',brand:'Chi Forest',size:null},source:{title:'Synthetic product source',url:'https://www.costco.com/chi-forest.product.2022263.html',domain:'costco.com'},matchReason:'Product name resembles the receipt description; the exact item could not be verified.'};
const server=createServer(createRequestListener({
 config:loadConfig({OPENAI_API_KEY:'lm-mock',APP_SHARED_SECRET:'lm-mock-secret',AI_SERVER_PRICING_STATE_FILE:':memory:',AI_SERVER_EVENTS_FILE:':memory:',RECEIPT_DECODED_ENABLED:'true',RECEIPT_DECODED_OPENAI_API_KEY:'receipt-mock',RECEIPT_DECODED_USAGE_STATE_PATH:':memory:',RECEIPT_DECODED_PRODUCT_LOOKUP_RATE_MAX:'1'}),
 logger:{info(){},warn(){},error(){}},
 fetchImpl:async()=>{throw Error('No live provider calls permitted');},
 receiptHooks:{analyze:async()=>{analyzerCalls++;return{result:normalizeSharedReceipt(analyzerCalls===1?costco():traderJoesTea()),usage:{}};},productLookup:async input=>{lookupCalls++;assert.deepEqual(input,lookupRequest);return{result:lookupResult,usage:{}};}}
}));
server.listen(0,'127.0.0.1');await once(server,'listening');
const localBase=`http://127.0.0.1:${server.address().port}`;
const requests=[];
const source=await readFile(resolve(root,'lib/ai-client.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function mobileClient(base,dev=false,hostUri){
 const exports={};
 runInNewContext(compiled,{
  exports,__DEV__:dev,process:{env:{EXPO_PUBLIC_AI_BASE_URL:base}},URL,FormData,AbortController,setTimeout,clearTimeout,
  require(name){
   if(name==='expo-constants')return{__esModule:true,default:{expoConfig:{hostUri}}};
   if(name==='expo-file-system')return{File:class extends File{constructor(uri){super([readFileSync(fileURLToPath(uri))],'receipt.jpg',{type:'image/jpeg'});}}};
   if(name==='expo/fetch')return{fetch:async(url,options)=>{
    requests.push(url);const u=new URL(url);assert.equal(options.method,'POST');
    if(u.pathname==='/receipt-decoded/api/receipt/analyze'){
     assert.equal(options.body.get('consentToAi'),'true');assert.deepEqual([...options.body.keys()],['image','consentToAi']);
    }else{
     assert.equal(u.pathname,'/receipt-decoded/api/product/lookup');assert.equal(options.headers['Content-Type'],'application/json');assert.deepEqual(JSON.parse(options.body),lookupRequest);
    }
    return fetch(localBase+u.pathname,options);
   }};
   if(name==='../shared/receipt-contract.mjs')return{validateReceiptAnalysis};
   if(name==='../shared/product-lookup-contract.mjs')return{validateProductLookupRequest,validateProductLookupResult};
   throw Error(`Unexpected mobile import ${name}`);
  }
 });
 return exports;
}
const temp=await mkdtemp(resolve(tmpdir(),'receipt-decoded-mobile-'));
try{
 const jpeg=resolve(temp,'receipt.jpg');
 await writeFile(jpeg,await sharp(resolve(root,'tests/fixtures/duplicate-fees.png')).jpeg().toBuffer());
 const photo={uri:pathToFileURL(jpeg).href};
 const client=mobileClient(productionBase+'/');
 await assert.rejects(()=>client.analyzeReceipt(photo,false,new AbortController().signal),err=>err.code==='CONSENT_REQUIRED');
 assert.equal(requests.length,0);
 const received=await client.analyzeReceipt(photo,true,new AbortController().signal);
 // JSON originates in the VM's realm; compare its wire value in this realm.
 assert.deepEqual(JSON.parse(JSON.stringify(received)),expected);
 assert.equal(requests[0],productionBase+'/api/receipt/analyze');
 await assert.rejects(()=>mobileClient('http://little-moments-api.onrender.com/receipt-decoded').analyzeReceipt(photo,true,new AbortController().signal),err=>err.code==='SERVICE_UNAVAILABLE');
 assert.equal(requests.length,1);
 const teaReceived=await mobileClient('http://localhost:8791/receipt-decoded',true,'192.168.1.116:8082').analyzeReceipt(photo,true,new AbortController().signal);
 assert.deepEqual(JSON.parse(JSON.stringify(teaReceived)),expectedTea);
 assert.equal(teaReceived.duplicateGroups.find(group=>group.originalDescription==='GOLDEN OOLONG TEA').recordedQuantity,5);
 assert.equal(requests[1],'http://192.168.1.116:8791/receipt-decoded/api/receipt/analyze');
 const lookup=await client.lookupProduct(lookupRequest,new AbortController().signal);
 assert.deepEqual(JSON.parse(JSON.stringify(lookup)),lookupResult);
 assert.equal(requests[2],productionBase+'/api/product/lookup');
 await assert.rejects(()=>client.lookupProduct(lookupRequest,new AbortController().signal),err=>err.code==='RATE_LIMITED');
 assert.equal(lookupCalls,1);assert.equal(requests.length,4);
 const health=await(await fetch(localBase+'/health')).json();assert.equal(health.data.status,'ok');
 assert.equal(analyzerCalls,2);
 console.log('PASS: actual mobile client → Little Moments shared server: consent gate, HTTPS URL/prefix, multipart receipt analysis including one five-unit product row with linked deposit, product-only JSON lookup, validated results, typed lookup rate limit, development LAN resolution and Little Moments health. Two synthetic analyses and one synthetic lookup; zero provider calls. Expo adapters are mocked; device/TLS verification follows deployment.');
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});}
