import {readdir,readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {pgBin,asciiPath,privateDir,backupDir,decryptDump,run} from './core.mjs';
const id=randomUUID(),cluster=join(privateDir,'restore-'+id),raw=join(privateDir,'restore-'+id+'.dump'),pwfile=join(privateDir,'restore-'+id+'.password'),log=join(privateDir,'restore-'+id+'.log');
const names=(await readdir(backupDir)).filter(n=>n.endsWith('.dump.enc')).sort();const requested=process.argv[2];if(requested&&(!names.includes(requested)||requested.includes('/')||requested.includes('\\')))throw Error('Choose an archive filename from .backups');const backup=requested??names.at(-1);if(!backup)throw Error('No encrypted archive');
const evidence={started_at:new Date().toISOString(),backup,scope:['public','auth','supabase_migrations'],source_untouched:true};let started=false;
const password=randomBytes(24).toString('base64url');const env={...process.env,PGHOST:'127.0.0.1',PGPORT:'55432',PGUSER:'postgres',PGPASSWORD:password,PGDATABASE:'postgres',PGSSLMODE:'disable'};
async function command(name,args,options={}){const r=await run(pgBin(name),args,{env,...options});if(r.code!==0)throw Error(name+' failed: '+r.stderr.replaceAll(password,'[REDACTED]'));return r.stdout;}
try{
 await mkdir(cluster,{recursive:true});await writeFile(pwfile,password,{flag:'wx',mode:0o600});const embeddedInventory=await decryptDump(join(backupDir,backup),raw);
 await command('initdb',['-D',asciiPath(cluster),'-U','postgres','--encoding=UTF8','--locale=C','--auth=scram-sha-256','--pwfile',asciiPath(pwfile)]);
 await command('pg_ctl',['-D',asciiPath(cluster),'-l',asciiPath(log),'-o','-h 127.0.0.1 -p 55432','-w','start']);started=true;
 // Only temporary local database. Roles are no-login placeholders for ACLs.
 await command('psql',['-v','ON_ERROR_STOP=1','-c',"CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE ROLE authenticator; CREATE ROLE supabase_admin; CREATE ROLE supabase_auth_admin; CREATE ROLE supabase_storage_admin; CREATE ROLE dashboard_user; CREATE ROLE cli_login_postgres; CREATE SCHEMA auth; CREATE SCHEMA supabase_migrations; CREATE SCHEMA extensions; CREATE EXTENSION pgcrypto WITH SCHEMA extensions; CREATE EXTENSION \"uuid-ossp\" WITH SCHEMA extensions;"]);
 await command('pg_restore',['--dbname=postgres','--exit-on-error','--no-owner','--schema=public','--schema=auth','--schema=supabase_migrations',asciiPath(raw)]);
 const inventorySql=(await readFile('scripts/backup/inventory.sql','utf8')).replace(/^\uFEFF/,'');
 const output=await command('psql',['-X','-At','-v','ON_ERROR_STOP=1'],{input:inventorySql});
 evidence.restored=JSON.parse(output.trim().split('\n').at(-1));
 let sidecar={};try{sidecar=JSON.parse(await readFile(join(backupDir,backup+'.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const archiveBytes=await readFile(join(backupDir,backup));const checksum=createHash('sha256').update(archiveBytes).digest('hex');
 if(sidecar.sha256&&sidecar.sha256!==checksum)throw Error('Archive checksum differs from manifest');
 const manifest={...sidecar,...embeddedInventory,bytes:archiveBytes.length,sha256:checksum};
 if(!manifest.inventory)throw Error('Archive predates snapshot inventory; export a new archive');
 evidence.source=manifest.inventory;
 if(JSON.stringify(evidence.restored)!==JSON.stringify(evidence.source))throw Error('Restored rows differ from the exact pg_dump snapshot');
 evidence.tables_verified=Object.keys(evidence.source).length;
 await command('psql',['-X','-At','-v','ON_ERROR_STOP=1'],{input:(await readFile('scripts/verify-readiness-live.sql','utf8')).replace(/^\uFEFF/,'')});
 evidence.restored_business_rules_verified=true;
 manifest.restore_verified=true;manifest.restore_scope=evidence.scope;manifest.restore_verified_at=new Date().toISOString();await writeFile(join(backupDir,backup+'.json'),JSON.stringify(manifest,null,2));
 evidence.success=true;console.log(JSON.stringify({success:true,backup,tables_verified:evidence.tables_verified,scope:evidence.scope},null,2));
}catch(error){evidence.error=error.message;console.error(error.message);process.exitCode=1;}finally{
 if(started){const stopped=await run(pgBin('pg_ctl'),['-D',asciiPath(cluster),'-m','fast','-w','stop'],{env});evidence.local_server_stopped=stopped.code===0;if(stopped.code!==0){process.exitCode=1;evidence.shutdown_error=true;evidence.success=false;}}
 for(const p of [raw,pwfile])try{await unlink(p);}catch(e){if(e.code!=='ENOENT')throw e;}
 evidence.finished_at=new Date().toISOString();await mkdir('audit/readiness',{recursive:true});await writeFile('audit/readiness/restore.json',JSON.stringify(evidence,null,2));
}
