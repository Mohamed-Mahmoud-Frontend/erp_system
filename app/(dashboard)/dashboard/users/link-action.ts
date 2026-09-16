"use server";
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {allowed,getAccess,modules} from '@/lib/access';
export async function linkExistingMember(previous:unknown,form:FormData){
 if(!allowed(await getAccess(),'admin'))return {message:'إدارة الحسابات متاحة للمدير فقط.'};
 const parsed=z.object({email:z.email().transform(s=>s.toLowerCase()),permissions:z.array(z.enum(modules))}).safeParse({email:form.get('email'),permissions:form.getAll('permissions')});
 if(!parsed.success)return {message:'بيانات غير صالحة.'};
 const admin=createAdminClient();let found;
 for(let page=1;;page++){const result=await admin.auth.admin.listUsers({page,perPage:100});if(result.error)return {message:'تعذر فحص حسابات الدخول.'};found=result.data.users.find(u=>u.email?.toLowerCase()===parsed.data.email);if(found||result.data.users.length<100)break;}
 if(!found)return {message:'لا يوجد حساب دخول بهذا البريد. استخدم إنشاء موظف جديد.'};
 const db=await createClient();const saved=await db.from('user_access').insert({user_id:found.id,email:parsed.data.email,role:'employee',permissions:parsed.data.permissions,active:true});
 if(saved.error)return {message:saved.error.code==='23505'?'الحساب مضاف بالفعل؛ عدّل صلاحياته من القائمة.':'تعذر ربط الحساب.'};
 revalidatePath('/dashboard/users');return {success:true,message:'تم ربط الحساب الموجود دون تغيير كلمة مروره.'};
}
