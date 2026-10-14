import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createUsageGuard } from './usage-guard.mjs';
import { loadConfig } from './index.mjs';
const cfg={...loadConfig({USAGE_STATE_PATH:':memory:'}),dailyRequestLimit:3,dailyBudgetCents:20,maxScanBudgetCents:10,maxConcurrentRequests:1};
test('concurrency capacity is released once, even on failure',()=>{const guard=createUsageGuard(cfg);const release=guard.enter();assert.throws(()=>guard.enter(),e=>e.code==='SERVER_BUSY');release();release();guard.enter()();});
test('daily reservations serialize, stop at budget, and reset on UTC day change',async()=>{let now=Date.parse('2026-10-12T23:59:59Z');const guard=createUsageGuard(cfg,()=>now);await Promise.all([guard.reserve(),guard.reserve()]);await assert.rejects(guard.reserve(),e=>e.code==='DAILY_LIMIT');now+=2000;await guard.reserve();});
test('durable reservations survive restarts and contain aggregates only',async()=>{const dir=await mkdtemp(join(tmpdir(),'receipt-usage-'));try{const config={...cfg,usageStatePath:join(dir,'usage.json')};const first=createUsageGuard(config);await first.reserve();await first.record({inputTokens:100,outputTokens:200});const second=createUsageGuard(config);await second.reserve();await assert.rejects(second.reserve(),e=>e.code==='DAILY_LIMIT');const data=JSON.parse(await readFile(config.usageStatePath,'utf8'));assert.deepEqual(Object.keys(data).sort(),['schemaVersion','month','monthlyRequests','monthlyReservedCents','day','requests','reservedCents','successes','inputTokens','outputTokens'].sort());assert.equal(data.requests,2);assert.equal(data.inputTokens,100);}finally{await rm(dir,{recursive:true,force:true});}});
test('corrupt persisted accounting consistently fails closed on repeated requests',async()=>{const dir=await mkdtemp(join(tmpdir(),'receipt-usage-'));try{const config={...cfg,usageStatePath:join(dir,'usage.json')};await writeFile(config.usageStatePath,'{"requests":-1}');const guard=createUsageGuard(config);for(let i=0;i<3;i++)await assert.rejects(guard.reserve(),e=>e.code==='SERVICE_UNAVAILABLE');}finally{await rm(dir,{recursive:true,force:true});}});
test('UTC day changes never reset the monthly allowance; only a new UTC month does',async()=>{
 let now=Date.parse('2026-10-12T23:59:59Z');const config={...cfg,monthlyBudgetCents:20};const guard=createUsageGuard(config,()=>now);
 await guard.reserve();now+=2000;await guard.reserve();now=Date.parse('2026-10-31T23:59:59Z');await assert.rejects(guard.reserve(),e=>e.code==='MONTHLY_LIMIT');
 now=Date.parse('2026-11-01T00:00:00Z');await guard.reserve();
});
test('monthly allowance survives a restart after a failed paid attempt and serializes races',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'receipt-month-'));try{let now=Date.parse('2026-10-12T12:00:00Z');const config={...cfg,usageStatePath:join(dir,'usage.json'),dailyBudgetCents:100,dailyRequestLimit:10,monthlyBudgetCents:20};
 const first=createUsageGuard(config,()=>now);await first.reserve(); // no record: failed/canceled paid attempt still counts.
 now=Date.parse('2026-10-13T12:00:00Z');const second=createUsageGuard(config,()=>now);const results=await Promise.allSettled([second.reserve(),second.reserve(),second.reserve()]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.ok(results.filter(r=>r.status==='rejected').every(r=>r.reason.code==='MONTHLY_LIMIT'));
 const data=JSON.parse(await readFile(config.usageStatePath,'utf8'));assert.equal(data.monthlyRequests,2);assert.equal(data.monthlyReservedCents,20);assert.equal(data.requests,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('legacy daily accounting conservatively closes its current month instead of forgetting prior spend',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'receipt-migrate-'));try{let now=Date.parse('2026-10-13T12:00:00Z');const config={...cfg,usageStatePath:join(dir,'usage.json'),monthlyBudgetCents:2000};await writeFile(config.usageStatePath,JSON.stringify({day:'2026-10-12',requests:2,reservedCents:20,successes:1,inputTokens:12,outputTokens:34}));const guard=createUsageGuard(config,()=>now);
 await assert.rejects(guard.reserve(),e=>e.code==='MONTHLY_LIMIT');const migrated=JSON.parse(await readFile(config.usageStatePath,'utf8'));assert.equal(migrated.schemaVersion,2);assert.equal(migrated.monthlyReservedCents,2000);assert.equal(migrated.inputTokens,12);
 await assert.rejects(createUsageGuard(config,()=>now).reserve(),e=>e.code==='MONTHLY_LIMIT');now=Date.parse('2026-11-01T00:00:00Z');await guard.reserve();
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('malformed monthly counters and backwards clocks consistently fail closed',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'receipt-corrupt-month-'));try{const config={...cfg,usageStatePath:join(dir,'usage.json')};await writeFile(config.usageStatePath,JSON.stringify({schemaVersion:2,month:'2026-10',monthlyRequests:0,monthlyReservedCents:-1,day:'2026-10-12',requests:0,reservedCents:0,successes:0,inputTokens:0,outputTokens:0}));let now=Date.parse('2026-10-12T12:00:00Z');const guard=createUsageGuard(config,()=>now);for(let i=0;i<2;i++)await assert.rejects(guard.reserve(),e=>e.code==='SERVICE_UNAVAILABLE');await rm(config.usageStatePath);const good=createUsageGuard(config,()=>now);await good.reserve();now=Date.parse('2026-09-12T12:00:00Z');await assert.rejects(createUsageGuard(config,()=>now).reserve(),e=>e.code==='SERVICE_UNAVAILABLE');
 }finally{await rm(dir,{recursive:true,force:true});}
});
