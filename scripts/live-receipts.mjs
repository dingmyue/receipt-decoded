// Paid integration check using generated, explicitly synthetic images only.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { loadConfig, createRequestListener } from '../server/index.mjs';
import { createServer } from 'node:http';
import { once } from 'node:events';
const config={...loadConfig(), usageStatePath:null,rateLimitMaxRequests:10};
if(!config.openAiApiKey) throw new Error('Set the server-only OPENAI_API_KEY before the live test.');
const server=createServer(createRequestListener(config));server.listen(0,'127.0.0.1');await once(server,'listening');
const checks=[['duplicate-fees',1,1909],['quantity-two',0,0],['reversal',0,0],['two-groups',2,1149],['not-receipt',0,0],['long-overlap',1,1909]];
const results=[];
try {
 for(const [name,count,cents] of checks){
  const form=new FormData();form.append('image',new Blob([await readFile(`tests/fixtures/${name}.png`)],{type:'image/png'}),'synthetic.png');form.append('consentToAi','true');
  const start=Date.now();const response=await fetch(`http://127.0.0.1:${server.address().port}/api/receipt/analyze`,{method:'POST',body:form,signal:AbortSignal.timeout(110000)});const body=await response.json();
  if(!response.ok) throw new Error(`Synthetic ${name}: HTTP ${response.status}, safe error ${body.error?.code??'UNKNOWN'}.`);
  assert.equal(body.duplicateGroups.length,count,`${name}: groups`);assert.equal(body.duplicateGroups.reduce((sum,g)=>sum+(g.potentialExtraCents??0),0),cents,`${name}: cents`);
  assert.equal(body.analysis.status,name==='not-receipt'?'unreadable':'complete',`${name}: status`);
  results.push({fixture:name,status:'passed',groups:count,potentialExtraCents:cents,durationMs:Date.now()-start});console.log(`PASS synthetic ${name}: ${count} groups, ${cents} conditional cents.`);
 }
 await writeFile('docs/live-validation.json',JSON.stringify({checkedAt:new Date().toISOString(),model:config.receiptModel,syntheticOnly:true,results},null,2)+'\n');
} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
