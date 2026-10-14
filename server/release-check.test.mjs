import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const checker=fileURLToPath(new URL('../scripts/release-check.mjs',import.meta.url));
const base='https://little-moments-api.onrender.com/receipt-decoded';
async function check({url=base,html='RECEIPT DECODED',legal={},site=base,build=false,appId='1234567890',teamId='TESTTEAM01',bundleConfirmed=true,bundle='com.test.receiptdecoded'}={}){
 const temp=await mkdtemp(resolve(tmpdir(),'receipt-release-check-'));
 try{
  await mkdir(resolve(temp,'shared'));
  const data={
   'shared/app-info.json':{publisherName:'Test Publisher',supportEmail:'test@example.com',effectiveDate:'2026-10-13',publicSiteUrl:site,bundleIdentifierConfirmed:bundleConfirmed,appleTeamId:teamId,appStoreConnectAppId:appId},
   'shared/legal-copy.json':legal,
   'app.json':{expo:{version:'1.0.0',ios:{bundleIdentifier:bundle,infoPlist:{ITSAppUsesNonExemptEncryption:false}},extra:{eas:{projectId:'b937c8d5-4e34-4bbd-881b-39cad3599fe2'}}}},
   'eas.json':{build:{production:{environment:'production'}}}
  };
  for(const [file,value] of Object.entries(data))await writeFile(resolve(temp,file),JSON.stringify(value));
  const stub=resolve(temp,'fetch-stub.mjs');
  await writeFile(stub,`globalThis.fetch=async url=>new Response(String(url).endsWith('/health')?JSON.stringify({ok:true,analysisAvailable:true}):${JSON.stringify(html)},{headers:{'Content-Type':String(url).endsWith('/health')?'application/json':'text/html'}});`);
  const run=spawnSync(process.execPath,['--import',stub,checker,'--online',...(build?['--build']:[])],{cwd:temp,encoding:'utf8',env:{...process.env,EXPO_PUBLIC_AI_BASE_URL:url,EAS_BUILD:''}});
  if(run.error)throw run.error;
  return{status:run.status,text:run.stdout+run.stderr};
 }finally{await rm(temp,{recursive:true,force:true});}
}
test('release gate accepts the completed namespaced configuration and HTTPS policy contract',async()=>{
 const result=await check({url:base+'/',legal:{privacy:{sections:[{title:'Hosting',body:'Standard API without regional data residency.'}]},terms:{sections:[]}}});assert.equal(result.status,0,result.text);
});
test('release gate detects unresolved policy text inside nested section arrays',async()=>{
 const result=await check({legal:{privacy:{sections:[{body:'OpenAI processing region: [OpenAI processing region].'}]}}});
 assert.equal(result.status,1);assert.match(result.text,/remaining policy placeholders/);
});
test('first signed build warns about publication details while the public release gate still rejects them',async()=>{
 const pending={legal:{region:'[OpenAI processing region]'},html:'RECEIPT DECODED [Effective date]',appId:'[App Store Connect app ID]',teamId:'[Apple Team ID]',bundleConfirmed:false};
 const build=await check({...pending,build:true});assert.equal(build.status,0,build.text);assert.match(build.text,/Before public submission/);
 const release=await check(pending);assert.equal(release.status,1);assert.match(release.text,/App Store Connect app ID/);
 const insecure=await check({...pending,build:true,url:'http://little-moments-api.onrender.com/receipt-decoded'});assert.equal(insecure.status,1);assert.match(insecure.text,/production HTTPS backend/);
 const wrongPolicy=await check({build:true,html:'Little Moments policy'});assert.equal(wrongPolicy.status,1);assert.match(wrongPolicy.text,/must serve Receipt Decoded/);
 const wrongBundle=await check({build:true,bundle:'invalid bundle'});assert.equal(wrongBundle.status,1);assert.match(wrongBundle.text,/valid ios.bundleIdentifier/);
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
