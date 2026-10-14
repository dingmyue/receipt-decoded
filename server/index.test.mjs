import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer, request as httpRequest } from 'node:http';
import test from 'node:test';
import sharp from 'sharp';
import { createRateLimiter, createRequestListener, loadConfig, clientAddress } from './index.mjs';
import { normalizeReceipt, analyzeImages, prepareImageInputs } from './receipt-analyzer.mjs';
import { costco } from '../tests/receipt-data.mjs';
const image=await sharp({create:{width:128,height:128,channels:3,background:'white'}}).png().toBuffer();
const upload=(consent='true',bytes=image,mime='image/png')=>{const f=new FormData();f.append('image',new Blob([bytes],{type:mime}),'receipt.png');if(consent!==null)f.append('consentToAi',consent);return f;};
async function withServer(run,overrides={},hooks={}) {
 const config={...loadConfig({USAGE_STATE_PATH:':memory:'}),...overrides};const server=createServer(createRequestListener(config,hooks));server.listen(0,'127.0.0.1');await once(server,'listening');try{await run(`http://127.0.0.1:${server.address().port}`);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
test('config validates bounds and requires a production-only key',()=>{
 assert.equal(loadConfig({}).port,8787);assert.throws(()=>loadConfig({NODE_ENV:'production'}));for(const env of [{PORT:'0'},{PORT:'65536'},{MAX_REQUEST_BYTES:'-1'},{RATE_LIMIT_WINDOW_MS:'1.5'},{MAX_CONCURRENT_REQUESTS:'9'},{TRUST_PROXY_HOPS:'3'}])assert.throws(()=>loadConfig(env));
});
test('health and public policies work without exposing secrets',async()=>withServer(async url=>{
 const response=await fetch(`${url}/health`);assert.deepEqual(await response.json(),{ok:true,analysisAvailable:true});assert.equal(response.headers.get('cache-control'),'no-store');
 for(const path of ['privacy','terms','support']){const page=await fetch(`${url}/${path}`);assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/default-src 'none'/);const text=await page.text();assert.ok(!text.includes('test-secret'));}
},{openAiApiKey:'test-secret'}));
test('real multipart upload returns a validated result and only JPEGs reach analyzer',async()=>{
 let calls=0;await withServer(async url=>{const res=await fetch(`${url}/api/receipt/analyze`,{method:'POST',body:upload()});assert.equal(res.status,200);assert.equal((await res.json()).duplicateGroups[0].potentialExtraCents,1909);},{},{analyze:async images=>{calls++;assert.equal((await sharp(images[0].bytes).metadata()).format,'jpeg');return {result:normalizeReceipt(costco()),usage:{inputTokens:10,outputTokens:20}};}});assert.equal(calls,1);
});
test('consent, invalid files, multiple files and extra fields are rejected before paid analysis',async()=>{
 let calls=0;await withServer(async url=>{
 const extra=upload();extra.append('secret','bad');const multiple=upload();multiple.append('image',new Blob([image],{type:'image/png'}),'two.png');
 for(const [body,expected] of [[upload(null),400],[upload('false'),400],[upload('true',Buffer.from('not an image')),422],[upload('true',image,'image/jpeg'),422],[extra,400],[multiple,400],[upload('true',image,'image/gif'),415]]){const res=await fetch(`${url}/api/receipt/analyze`,{method:'POST',body});assert.equal(res.status,expected);await res.text();}
 },{rateLimitMaxRequests:20},{analyze:async()=>{calls++;throw Error('should not run');}});assert.equal(calls,0);
});
test('unknown routes, methods, missing service, malformed multipart return safe errors',async()=>withServer(async url=>{
 for(const [path,method,status,body,headers] of [['/missing','GET',404],['/health','POST',405],['/api/receipt/analyze','GET',405],['/api/receipt/analyze','POST',503,upload()],['/api/receipt/analyze','POST',415,'text'],['/api/receipt/analyze','POST',400,'bad',{'Content-Type':'multipart/form-data; boundary=bad'}]]){const r=await fetch(url+path,{method,body,headers});assert.equal(r.status,status);const text=await r.text();assert.ok(!text.includes('stack'));}
}));
test('declared and chunked bodies cannot bypass the size limit',async()=>withServer(async url=>{
 const r=await fetch(`${url}/api/receipt/analyze`,{method:'POST',body:upload()});assert.equal(r.status,413);await r.text();
 const result=await new Promise((resolve,reject)=>{const req=httpRequest(`${url}/api/receipt/analyze`,{method:'POST',headers:{'Content-Type':'multipart/form-data; boundary=x'}},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(body)}));});req.on('error',reject);req.write('123');req.end('45');});assert.equal(result.status,413);assert.equal(result.body.error.code,'REQUEST_TOO_LARGE');
},{maxRequestBytes:4}));
test('spoofed proxy headers cannot evade default rate limiting, health remains available',async()=>withServer(async url=>{
 const first=await fetch(`${url}/api/receipt/analyze`,{method:'POST'});assert.equal(first.status,415);await first.text();const second=await fetch(`${url}/api/receipt/analyze`,{method:'POST',headers:{'X-Forwarded-For':'1.2.3.4'}});assert.equal(second.status,429);assert.ok(+second.headers.get('retry-after')>=1);await second.text();assert.equal((await fetch(`${url}/health`)).status,200);
},{rateLimitMaxRequests:1}));
test('rate limits expire and trusted proxy address uses the configured hop',()=>{
 let now=0;const check=createRateLimiter({rateLimitWindowMs:1000,rateLimitMaxRequests:1},()=>now);assert.ok(check('a').allowed);assert.ok(!check('a').allowed);assert.ok(check('b').allowed);now=1000;assert.ok(check('a').allowed);
 const req={headers:{'x-forwarded-for':'1.1.1.1, 2.2.2.2'},socket:{remoteAddress:'3.3.3.3'}};assert.equal(clientAddress(req,0),'3.3.3.3');assert.equal(clientAddress(req,1),'2.2.2.2');assert.equal(clientAddress(req,2),'1.1.1.1');
});
test('long images include overlapping close-ups, invalid image geometry is rejected',async()=>{
 const long=await sharp({create:{width:400,height:4000,channels:3,background:'white'}}).png().toBuffer();assert.ok((await prepareImageInputs(long,'image/png')).length>1);
 const tiny=await sharp({create:{width:20,height:20,channels:3,background:'white'}}).png().toBuffer();await assert.rejects(prepareImageInputs(tiny,'image/png'),e=>e.code==='UNREADABLE_IMAGE');
});
test('Responses request uses strict schema, high-detail image and store false',async()=>{
 const controller=new AbortController();const result=await analyzeImages([{bytes:image,label:"Synthetic test receipt"}],{openAiApiKey:'unit-secret',receiptModel:'gpt-4.1-mini',analysisTimeoutMs:1000},controller.signal,async(url,init)=>{
 assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(init.body);assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert.equal(body.input[0].content[2].detail,'high');assert.ok(!init.body.includes('unit-secret'));
 return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(costco())}]}],usage:{input_tokens:100,output_tokens:100}});
 });assert.equal(result.result.duplicateGroups[0].potentialExtraCents,1909);
});
test('provider failures/refusals/malformed data never expose provider text or guessed results',async()=>{
 const cfg={openAiApiKey:'unit-secret',receiptModel:'x',analysisTimeoutMs:1000};
 for(const response of [new Response('PRIVATE DETAILS',{status:401}),Response.json({status:'incomplete',output:[]}),Response.json({status:'completed',output:[{content:[{type:'refusal',refusal:'PRIVATE DETAILS'}]}]}),Response.json({status:'completed',output:[{content:[{type:'output_text',text:'{"bad":true}'}]}]})])await assert.rejects(analyzeImages([{bytes:image,label:"Synthetic test receipt"}],cfg,new AbortController().signal,async()=>response),e=>!e.message.includes('PRIVATE')&&[502,503].includes(e.status));
});
test('abort and provider timeout are distinguished',async()=>{
 const cfg={openAiApiKey:'x',receiptModel:'x',analysisTimeoutMs:5};const controller=new AbortController();controller.abort();await assert.rejects(analyzeImages([{bytes:image,label:"Synthetic test receipt"}],cfg,controller.signal,async()=>{throw Error();}),e=>e.code==='CANCELED');
 await assert.rejects(analyzeImages([{bytes:image,label:"Synthetic test receipt"}],cfg,new AbortController().signal,async(_u,init)=>{await new Promise(resolve=>setTimeout(resolve,15));init.signal.throwIfAborted();}),e=>e.code==='ANALYSIS_TIMEOUT');
});
test('image normalization rotates EXIF orientation and strips metadata before AI processing',async()=>{
 const source=await sharp({create:{width:320,height:128,channels:3,background:'white'}}).withMetadata({orientation:6}).png().toBuffer();const [normalized]=await prepareImageInputs(source,'image/png');const m=await sharp(normalized.bytes).metadata();assert.equal(m.width,128);assert.equal(m.height,320);assert.equal(m.exif,undefined);
});
