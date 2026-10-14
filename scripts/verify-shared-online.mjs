// Read-only deployment smoke check. No upload, key or quota mutation.
const base=process.argv[2]??'https://little-moments-api.onrender.com';
const root=new URL(base);
if(root.protocol!=='https:'||root.username||root.password||root.search||root.hash||root.pathname!=='/')throw Error('Provide the shared HTTPS origin without /receipt-decoded.');
let failures=0;
for(const prefix of ['', '/receipt-decoded']){
 for(const page of ['/health','/privacy','/support','/terms']){
  const path=prefix+page;
  try{
   const response=await fetch(new URL(path,root),{signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const text=await response.text();
   if(page==='/health'){
    const health=JSON.parse(text);
    if(prefix?health.ok!==true||health.analysisAvailable!==true:health.ok!==true||health.data?.status!=='ok')throw Error('Unexpected health contract');
   }else{
    if(!(response.headers.get('content-type')??'').includes('text/html'))throw Error('Expected HTML');
    if(!text.includes(prefix?'RECEIPT DECODED':'Little Moments'))throw Error('Wrong app policy');
    if(prefix&&/\[[^\]<\n]+\]/.test(text))throw Error('Unfilled policy placeholder');
    if(prefix)for(const link of ['privacy','support','terms'])if(!text.includes(`href="/receipt-decoded/${link}"`))throw Error('Policy navigation leaves receipt namespace');
   }
   console.log(`PASS ${path}`);
  }catch(error){failures++;console.error(`FAIL ${path}: ${error.message}`);}
 }
}
if(failures)process.exitCode=1;
else console.log('Public routing checks passed. Still verify one consented receipt check, accounting persistence and the installed Little Moments app after deployment.');
