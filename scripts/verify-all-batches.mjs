import {spawnSync} from 'node:child_process';
for(const file of ['verify-batch1.mjs','verify-batch2.mjs','verify-batch3.mjs','verify-batch4.mjs','verify-batch5.mjs']){
 const r=spawnSync(process.execPath,['scripts/'+file],{stdio:'inherit',windowsHide:true});
 if(r.status!==0)process.exit(r.status??1);
}
