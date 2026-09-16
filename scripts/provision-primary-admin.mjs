import {randomBytes} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
const local='.private/admin-first-login.txt';
if(!readFileSync('.gitignore','utf8').includes('.private/'))throw Error('Private directory must be ignored');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
let found=false;for(let page=1;;page++){const {data,error}=await db.auth.admin.listUsers({page,perPage:100});if(error)throw Error('Cannot inspect users');if(data.users.some(u=>u.email?.toLowerCase()==='admin@admin.com'))found=true;if(data.users.length<100)break;}
if(found)throw Error('Administrator email already exists; no password reset or overwrite performed');
const password=randomBytes(24).toString('base64url');
// No email is sent. Credentials are created locally before account creation,
// so a process interruption cannot leave an unrecoverable generated password.
writeFileSync(local,`Email: admin@admin.com\nPassword: ${password}\nChange this password from your account page after first login. Keep this file private.\n`,{flag:'wx',mode:0o600});
const {data,error}=await db.auth.admin.createUser({email:'admin@admin.com',password,email_confirm:true});
if(error)throw Error('Account creation failed; local credential file retained for inspection.');
writeFileSync('.private/admin-provision.json',JSON.stringify({id:data.user.id,email:data.user.email,created_at:new Date().toISOString()},null,2));
console.log('Requested administrator account created. Initial credentials saved only in the ignored local file. No email sent; application permissions will be assigned by the RBAC rollout.');
