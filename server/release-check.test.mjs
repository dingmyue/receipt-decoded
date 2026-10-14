import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const checker=fileURLToPath(new URL('../scripts/release-check.mjs',import.meta.url));
const base='https://little-moments-api.onrender.com/receipt-decoded';
async function check({url=base,html='RECEIPT DECODED',legal={},site=base}={}){
 const temp=await mkdtemp(resolve(tmpdir(),'receipt-release-check-'));
 try{
  await mkdir(resolve(temp,'shared'));
  const data={
   'shared/app-info.json':{publisherName:'Test Publisher',supportEmail:'test@example.com',effectiveDate:'2026-10-13',publicSiteUrl:site,bundleIdentifierConfirmed:true,appleTeamId:'TESTTEAM01',appStoreConnectAppId:'1234567890'},
   'shared/legal-copy.json':legal,
   'app.json':{expo:{version:'1.0.0',ios:{infoPlist:{ITSAppUsesNonExemptEncryption:false}},extra:{eas:{projectId:'b937c8d5-4e34-4bbd-881b-39cad3599fe2'}}}},
   'eas.json':{build:{production:{environment:'production'}}}
  };
  for(const [file,value] of Object.entries(data))await writeFile(resolve(temp,file),JSON.stringify(value));
  const stub=resolve(temp,'fetch-stub.mjs');
  await writeFile(stub,`globalThis.fetch=async url=>new Response(String(url).endsWith('/health')?JSON.stringify({ok:true,analysisAvailable:true}):${JSON.stringify(html)},{headers:{'Content-Type':String(url).endsWith('/health')?'application/json':'text/html'}});`);
  const run=spawnSync(process.execPath,['--import',stub,checker,'--online'],{cwd:temp,encoding:'utf8',env:{...process.env,EXPO_PUBLIC_AI_BASE_URL:url,EAS_BUILD:''}});
  if(run.error)throw run.error;
  return{status:run.status,text:run.stdout+run.stderr};
 }finally{await rm(temp,{recursive:true,force:true});}
}
test('release gate accepts the completed namespaced configuration and HTTPS policy contract',async()=>{
 const result=await check({url:base+'/'});assert.equal(result.status,0,result.text);
});
test('release gate rejects the Little Moments origin as receipt API or policy base',async()=>{
 for(const config of [{url:'https://little-moments-api.onrender.com'},{site:'https://little-moments-api.onrender.com'}]){
  const result=await check(config);assert.equal(result.status,1);assert.match(result.text,/must include \/receipt-decoded/);
 }
});
test('release gate rejects another app policy and an unfilled public AI region',async()=>{
 const wrong=await check({html:'Little Moments Privacy Policy'});assert.equal(wrong.status,1);assert.match(wrong.text,/must serve Receipt Decoded/);
 const placeholder=await check({html:'RECEIPT DECODED [OpenAI processing region]'});assert.equal(placeholder.status,1);assert.match(placeholder.text,/Remove public .* placeholders/);
});
