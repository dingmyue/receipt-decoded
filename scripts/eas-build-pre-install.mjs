import {spawnSync} from 'node:child_process';
if(process.env.EAS_BUILD_PROFILE==='production'){
 const result=spawnSync(process.execPath,['scripts/release-check.mjs','--online'],{stdio:'inherit',env:process.env});process.exit(result.status??1);
}
