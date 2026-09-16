import{readFile,writeFile}from'node:fs/promises';import{createClient}from'@supabase/supabase-js';import dotenv from'dotenv';dotenv.config({path:'.env.local',quiet:true});
const provision=JSON.parse(await readFile('.private/admin-provision.json','utf8'));
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const id=provision.id??provision.user_id; if(!id)throw Error('Provision record missing user UUID');
const {data,error}=await db.auth.admin.getUserById(id);if(error||data.user?.email!=='admin@admin.com')throw Error('Provisioned identity did not match approved email');
const existing=await db.from('user_access').select('user_id,role,active').eq('user_id',id).maybeSingle();if(existing.error)throw Error(existing.error.message);
if(existing.data){if(existing.data.role!=='admin'||!existing.data.active)throw Error('Existing access differs; refusing overwrite');}
else{const saved=await db.from('user_access').insert({user_id:id,email:'admin@admin.com',role:'admin',permissions:[],active:true});if(saved.error)throw Error(saved.error.message);}
await writeFile('audit/readiness/admin-provisioned.json',JSON.stringify({email:'admin@admin.com',user_id:id,role:'admin',active:true,verified_at:new Date().toISOString(),password_in_private_file_only:true},null,2));console.log('Approved primary administrator membership verified. No existing users overwritten.');
