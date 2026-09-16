import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
const parse=p=>{const b=readFileSync(p);return JSON.parse(b.toString(b[0]===255&&b[1]===254?'utf16le':'utf8').replace(/^\uFEFF/,''));};
const before=parse('audit/batch5/data-before-raw.json'),after=parse('audit/batch5/data-after-raw.json');
assert.deepEqual(after.rows,before.rows);
writeFileSync('audit/batch5/data-verification.json',JSON.stringify({verified_at:new Date().toISOString(),unchanged:true,before,after},null,2));
writeFileSync('audit/batch5/backup-settings.json',JSON.stringify({checked_at:statSync('audit/batch5/backups-raw.json').mtime.toISOString(),plan:'Free',plan_source:'User checked Organization Billing and confirmed Free in conversation',project_ref:'pvuriolguibgwxmugyhh',settings:parse('audit/batch5/backups-raw.json'),restore_performed:false,reason:'No available backup; PITR disabled; Free plan'},null,2));
const items=[];
for(const file of readdirSync('app/(dashboard)',{recursive:true}).filter(p=>p.endsWith('.tsx'))){
 const path='app/(dashboard)/'+file.replaceAll('\\','/'),lines=readFileSync(path,'utf8').split('\n');
 const calls=lines.flatMap((line,index)=>/\.(select|rpc)\(/.test(line)?[{line:index+1,source:line.trim()}]:[]);
 if(calls.length){const guards=lines.flatMap((line,index)=>/error|Error/.test(line)?[{line:index+1,source:line.trim()}]:[]);assert.ok(guards.length,path);items.push({file:path,calls,reviewed_error_handling:guards});}
}
writeFileSync('audit/batch5/dashboard-read-inventory.json',JSON.stringify({captured_at:new Date().toISOString(),method:'All dashboard TSX select/rpc callsites inventoried; error handling manually traced, including query variables and Promise.all results. Guard text is supporting evidence, not a static proof.',files:items},null,2));
const packageFile=JSON.parse(readFileSync('package.json','utf8'));packageFile.scripts['verify:batch5']='node scripts/verify-batch5.mjs';packageFile.scripts['verify:batch5:browser']='node scripts/verify-batch5-browser.mjs';writeFileSync('package.json',JSON.stringify(packageFile,null,2)+'\n');
for(const name of ['scripts/verify-batch2-live.mjs','scripts/verify-batch4-live.mjs']){
 let text=readFileSync(name,'utf8');
 const guard="import { existsSync as hasCorrectionMigration } from 'node:fs';\nif (hasCorrectionMigration('supabase/migrations/0021_correction_history.sql')) throw Error('This historical live fixture test requires deleting financial history. Disabled after Batch 5: use verify:batch5:browser and the rollback SQL tests instead.');\n";
 if(!text.includes('hasCorrectionMigration'))writeFileSync(name,guard+text);
}
console.log('Business fingerprints unchanged. Backup evidence saved. Dashboard read files:',items.length,'calls:',items.reduce((n,x)=>n+x.calls.length,0));
