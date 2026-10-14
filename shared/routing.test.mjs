import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('router query parsing supports the security update and bounds malformed input work',()=>{
 const code=`const {createRequire}=require('node:module');const r=createRequire(require.resolve('expo-router/package.json'));const q=r('query-string');if(q.parse('text=hello%20world').text!=='hello world')process.exit(2);const s=q.parse('bad='+('%A9'.repeat(2048))).bad;if(typeof s!=='string')process.exit(3);`;
 const result=spawnSync(process.execPath,['-e',code],{timeout:2000,encoding:'utf8'});assert.equal(result.error,undefined);assert.equal(result.status,0,result.stderr);
});
