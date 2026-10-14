import {readFile} from 'node:fs/promises';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const [info,app,eas,legal]=await Promise.all(['shared/app-info.json','app.json','eas.json','shared/legal-copy.json'].map(json));
const problems=[];
const requireValue=(ok,message)=>{if(!ok)problems.push(message);};
const completed=s=>typeof s==='string'&&s.trim()&&!s.includes('[')&&!s.includes(']');
const https=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!['localhost','127.0.0.1'].includes(u.hostname)&&!u.hostname.endsWith('.example')&&!u.username&&!u.password&&!u.search&&!u.hash;}catch{return false;}};
requireValue(completed(info.publisherName),'Fill publisherName in shared/app-info.json.');
requireValue(completed(info.supportEmail)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.supportEmail),'Fill a working supportEmail.');
requireValue(completed(info.effectiveDate)&&/^\d{4}-\d{2}-\d{2}$/.test(info.effectiveDate),'Fill effectiveDate (YYYY-MM-DD).');
requireValue(https(info.publicSiteUrl),'Fill publicSiteUrl with the live HTTPS policy/support service.');
requireValue(!/\[[^\]]+\]/.test(JSON.stringify(legal)),'Complete remaining policy placeholders in shared/legal-copy.json (including the OpenAI processing region).');
requireValue(info.bundleIdentifierConfirmed===true,'Confirm the unique ios.bundleIdentifier; set bundleIdentifierConfirmed true.');
requireValue(/^[A-Z0-9]{10}$/.test(info.appleTeamId),'Fill your Apple Developer team ID.');
requireValue(/^\d+$/.test(info.appStoreConnectAppId),'Fill your App Store Connect app ID.');
requireValue(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(app.expo.extra?.eas?.projectId??''),'Initialize this app’s own EAS project ID.');
requireValue(https(process.env.EXPO_PUBLIC_AI_BASE_URL),'Set EXPO_PUBLIC_AI_BASE_URL to the live production HTTPS backend.');
const sharedOrigin='https://little-moments-api.onrender.com';
for(const [value,label] of [[info.publicSiteUrl,'publicSiteUrl'],[process.env.EXPO_PUBLIC_AI_BASE_URL,'EXPO_PUBLIC_AI_BASE_URL']]){
 if(https(value)&&new URL(value).origin===sharedOrigin)requireValue(new URL(value).pathname.replace(/\/+$/,'')==='/receipt-decoded',`${label} must include /receipt-decoded on the shared Little Moments service.`);
}
requireValue(app.expo.version==='1.0.0','Check the initial App Store version.');
requireValue(app.expo.ios.infoPlist.ITSAppUsesNonExemptEncryption===false,'Review encryption declaration if encryption features change.');
requireValue(eas.build.production.environment==='production','Use the production EAS environment.');
// Never require or embed OPENAI_API_KEY in the mobile build environment.
if(process.env.EAS_BUILD && process.env.OPENAI_API_KEY) problems.push('Remove OPENAI_API_KEY from mobile EAS secrets; it belongs on the backend only.');
if(process.argv.includes('--online')&&https(info.publicSiteUrl)&&https(process.env.EXPO_PUBLIC_AI_BASE_URL)){
 for(const [base,path] of [[info.publicSiteUrl,'/privacy'],[info.publicSiteUrl,'/support'],[info.publicSiteUrl,'/terms'],[process.env.EXPO_PUBLIC_AI_BASE_URL,'/health']]){
  try{const res=await fetch(base.replace(/\/+$/,'')+path,{signal:AbortSignal.timeout(10000)});const text=await res.text();requireValue(res.ok,`Make ${path} publicly reachable.`);if(path==='/health')requireValue(JSON.parse(text).analysisAvailable===true,'Production health must report analysisAvailable.');else {requireValue(text.includes('RECEIPT DECODED')&&(res.headers.get('content-type')??'').includes('text/html'),`${path} must serve Receipt Decoded's HTML page.`);requireValue(!/\[[^\]<\n]+\]/.test(text),`Remove public ${path} placeholders.`);}}catch{problems.push(`Verify public ${path} availability.`);}
 }
}
if(problems.length){console.error('Release setup remains:\n'+problems.map(s=>`• ${s}`).join('\n'));process.exitCode=1;}else console.log('Configuration checks passed. Complete real-device/TestFlight validation and App Store Connect declarations before submission.');
