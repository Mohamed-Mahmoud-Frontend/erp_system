import{readFile,writeFile,mkdir,unlink}from'node:fs/promises';
import{randomUUID,createHmac}from'node:crypto';
import{createClient}from'@supabase/supabase-js';
import dotenv from'dotenv';
import{encryptedDump,backupDir}from'../backup/core.mjs';
import{join}from'node:path';
dotenv.config({path:'.env.local',quiet:true});
const tables=['clients','orders','invoices','payments','cheques','sales_returns','materials','material_movements','product_specs','product_spec_materials','suppliers','supplier_transactions','workers','attendance','worker_transactions','worker_payouts','quotations','invoice_sequences'];
export async function send(payload,endpoint=process.env.GOOGLE_SYNC_URL){
 if(!endpoint||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('Google connection not configured: set GOOGLE_SYNC_URL to the deployed Apps Script URL');
 const secret=(await readFile('.private/google-sync-secret.txt','utf8')).trim();const ts=Date.now(),nonce=randomUUID(),encoded=Buffer.from(JSON.stringify(payload)).toString('base64');
 const signature=createHmac('sha256',secret).update(ts+'.'+nonce+'.'+encoded).digest('hex');
 const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ts,nonce,payload:encoded,signature}),signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw Error('Google HTTP '+response.status);
 const result=await response.json();if(!result.ok)throw Error('Google rejected request: '+result.error);return result;
}
export async function synchronize(){
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const summary={sheets:[],backup:null};
 try{
  if(!process.env.GOOGLE_SYNC_URL)throw Error('Google connection not configured');
  for(const table of tables){
   const {data,error}=await db.rpc('sheet_snapshot',{p_table:table});if(error)throw Error('Snapshot '+table+': '+error.message);
   if(!data.event_ids.length&&!process.argv.includes('--full'))continue;
   const {event_ids,...snapshot}=data;const result=await send({kind:'sheet',...snapshot});
   if(result.table!==table||result.row_count!==data.rows.length||result.snapshot_at!==data.snapshot_at||!result.file_id)throw Error('Unverified sheet acknowledgement');
   // Exact IDs only, in bounded batches. Concurrent new events remain queued.
   for(let i=0;i<event_ids.length;i+=100){const ack=await db.from('sync_events').delete().in('id',event_ids.slice(i,i+100));if(ack.error)throw Error('Could not acknowledge mirrored events');}
   summary.sheets.push({table,rows:data.rows.length,file_id:result.file_id});
  }
  let prior={};try{prior=JSON.parse(await readFile('.private/google-backup-status.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  if(!prior.uploaded_at||Date.now()-new Date(prior.uploaded_at).getTime()>24*3600*1000){
   const manifest=await encryptedDump();const result=await send({kind:'backup',name:manifest.name,sha256:manifest.sha256,data:(await readFile(join(backupDir,manifest.name))).toString('base64')});
   if(result.sha256!==manifest.sha256||result.name!==manifest.name||!result.file_id)throw Error('Unverified backup acknowledgement');
   summary.backup={...manifest,file_id:result.file_id,uploaded_at:new Date().toISOString()};await writeFile('.private/google-backup-status.json',JSON.stringify(summary.backup,null,2));
  }
  const saved=await db.from('integration_status').upsert({name:'google_drive',last_success:new Date().toISOString(),last_error:null,details:summary});if(saved.error)throw Error('Could not persist sync status');
  console.log(JSON.stringify(summary));
 }catch(error){const saved=await db.from('integration_status').upsert({name:'google_drive',last_error:error.message});if(saved.error)console.error('Could not persist failure status');throw error;}
}
// A crashed process leaves a lock; remove it only after proving its PID is absent.
if(process.argv[1]?.replaceAll('\\','/').endsWith('/sync/run.mjs')){
 await mkdir('.private',{recursive:true});const lock='.private/sync.lock';
 try{let held;try{held=JSON.parse(await readFile(lock,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  if(held){try{process.kill(held.pid,0);throw Error('Another sync process is running');}catch(e){if(e.code!=='ESRCH')throw e;}await unlink(lock);}
  await writeFile(lock,JSON.stringify({pid:process.pid}),{flag:'wx'});
  try{await synchronize();}finally{await unlink(lock);}
 }catch(error){console.error(error.message);process.exitCode=1;}
}
