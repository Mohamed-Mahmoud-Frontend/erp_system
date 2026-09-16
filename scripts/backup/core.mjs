import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {tmpdir} from 'node:os';
import {symlinkSync,existsSync,realpathSync} from 'node:fs';
import {randomBytes,randomUUID,createCipheriv,createDecipheriv,createHash} from 'node:crypto';
export const privateDir=resolve('.private'),backupDir=resolve('.backups');
export function run(file,args,options={}){return new Promise((resolveResult,reject)=>{const p=spawn(file,args,{windowsHide:true,...options,stdio:['pipe','pipe','pipe']});let stdout='',stderr='';p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.on('error',reject);p.on('exit',code=>resolveResult({code,stdout,stderr}));p.stdin.end(options.input??'');});}
export async function linkedPgEnv(){
 const r=await run(process.execPath,['node_modules/supabase/dist/supabase.js','db','dump','--linked','--dry-run']);
 if(r.code!==0)throw Error('Supabase could not prepare a linked database connection. No credentials printed.');
 const env={...process.env,PGSSLMODE:'require'};
 for(const match of r.stdout.matchAll(/^export (PG[A-Z_]+)=(.*)$/gm)){
  let v=match[2].trim();if(v.startsWith('"')&&v.endsWith('"'))v=v.slice(1,-1).replace(/\\([\\"$`])/g,'$1');else if(v.startsWith("'")&&v.endsWith("'"))v=v.slice(1,-1).replaceAll("'\\''","'");
  env[match[1]]=v;
 }
 for(const k of ['PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE'])if(!env[k])throw Error('Incomplete linked connection '+k);
 return env;
}
export function asciiPath(path){
 const root=resolve('.'),alias=join(tmpdir(),'erp-workspace-'+createHash('sha256').update(root).digest('hex').slice(0,12));
 if(!existsSync(alias))symlinkSync(root,alias,'junction');
 if(realpathSync(alias)!==realpathSync(root))throw Error('Unexpected portable tools junction');
 const rel=relative(root,resolve(path));if(rel.startsWith('..'))throw Error('Native path must stay in workspace');
 const result=join(alias,rel);if(/[^\x00-\x7F]/.test(result))throw Error('PostgreSQL tools require an ASCII temporary path on this Windows installation');return result;
}
export function pgBin(name){return asciiPath('.tools/postgresql17/pgsql/bin/'+name+'.exe');}
export async function key(){await mkdir(privateDir,{recursive:true});const path=join(privateDir,'backup-key.bin');try{return await readFile(path);}catch(e){if(e.code!=='ENOENT')throw e;const k=randomBytes(32);await writeFile(path,k,{flag:'wx',mode:0o600});return k;}}
export async function encryptedDump(){
 await mkdir(backupDir,{recursive:true});await mkdir(privateDir,{recursive:true});
 const id=randomUUID(),raw=join(privateDir,'dump-'+id+'.bin');
 const env=await linkedPgEnv();
 const session=spawn(pgBin('psql'),['-X','-At','-v','ON_ERROR_STOP=1'],{env,windowsHide:true,stdio:['pipe','pipe','pipe']});
 const lines=createInterface({input:session.stdout});let errorText='';session.stderr.on('data',b=>errorText+=b);
 const queue=[],waiting=[];lines.on('line',line=>{if(waiting.length)waiting.shift()(line);else queue.push(line);});
 const nextLine=()=>queue.length?Promise.resolve(queue.shift()):new Promise((yes,no)=>{const timeout=setTimeout(()=>no(Error('Backup snapshot session timed out')),60000);waiting.push(line=>{clearTimeout(timeout);yes(line);});});
 session.stdin.write("SET ROLE postgres; BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; SELECT 'SNAPSHOT:'||pg_export_snapshot();\n");
 try{
  let line;do{line=await nextLine();}while(!line.startsWith('SNAPSHOT:'));const snapshot=line.slice(9);
  if(!/^[0-9A-F-]+$/i.test(snapshot))throw Error('Invalid exported snapshot');
  const dumped=await run(pgBin('pg_dump'),['--role=postgres','--snapshot',snapshot,'--format=custom','--file',asciiPath(raw)],{env});
  if(dumped.code!==0)throw Error('pg_dump failed: '+dumped.stderr.replaceAll(env.PGPASSWORD,'[REDACTED]'));
  session.stdin.write((await readFile('scripts/backup/inventory.sql','utf8')).replace(/^\uFEFF/,'')+'\n');
  do{line=await nextLine();}while(!line.startsWith('{'));const inventory=JSON.parse(line);
  session.stdin.end('COMMIT;\n');
  if(errorText.includes('ERROR:'))throw Error('Backup source inventory failed');
  const bytes=await readFile(raw),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',await key(),iv);
  const name='erp-'+new Date().toISOString().replaceAll(':','-')+'-'+id+'.dump.enc';
  const metadata={created_at:new Date().toISOString(),name,inventory,format:'PostgreSQL custom archive; AES-256-GCM; embedded snapshot inventory',scope:'Full database pg_dump. Cluster role passwords, Storage objects and external project settings are not included.',restore_verified:false};
  const metaBytes=Buffer.from(JSON.stringify(metadata)),length=Buffer.alloc(4);length.writeUInt32BE(metaBytes.length);
  const encrypted=Buffer.concat([Buffer.from('ERPBACKUP2'),iv,cipher.update(Buffer.concat([length,metaBytes,bytes])),cipher.final(),cipher.getAuthTag()]);
  await writeFile(join(backupDir,name),encrypted,{flag:'wx'});
  const manifest={...metadata,bytes:encrypted.length,sha256:createHash('sha256').update(encrypted).digest('hex')};
  await writeFile(join(backupDir,name+'.json'),JSON.stringify(manifest,null,2));return manifest;
 }finally{session.stdin.end();session.kill();lines.close();try{await unlink(raw);}catch(e){if(e.code!=='ENOENT')throw e;}}
}
export async function decryptDump(path,destination){
 const b=await readFile(path);const version=b.subarray(0,10).toString();if(!['ERPBACKUP1','ERPBACKUP2'].includes(version))throw Error('Unknown backup format');
 const decipher=createDecipheriv('aes-256-gcm',await readFile(join(privateDir,'backup-key.bin')),b.subarray(10,22));decipher.setAuthTag(b.subarray(-16));
 let bytes=Buffer.concat([decipher.update(b.subarray(22,-16)),decipher.final()]);let metadata=null;
 if(version==='ERPBACKUP2'){const n=bytes.readUInt32BE(0);if(n>bytes.length-4)throw Error('Invalid encrypted inventory');metadata=JSON.parse(bytes.subarray(4,4+n).toString('utf8'));bytes=bytes.subarray(4+n);}
 await writeFile(destination,bytes,{flag:'wx',mode:0o600});return metadata;
}
