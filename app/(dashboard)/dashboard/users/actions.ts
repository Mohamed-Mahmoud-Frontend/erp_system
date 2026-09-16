"use server";
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {allowed,getAccess,modules} from '@/lib/access';
const member=z.object({id:z.uuid(),role:z.enum(['admin','employee']),permissions:z.array(z.enum(modules)),active:z.boolean()});
export async function saveMember(previous:unknown,form:FormData){
 if(!allowed(await getAccess(),'admin'))return {message:'إدارة الصلاحيات متاحة للمدير فقط.'};
 const parsed=member.safeParse({id:form.get('id'),role:form.get('role'),permissions:form.getAll('permissions'),active:form.get('active')==='on'});
 if(!parsed.success)return {message:'بيانات الصلاحيات غير صالحة.'};
 const {id,role,permissions,active}=parsed.data;const db=await createClient();
 const result=await db.from('user_access').update({role,permissions:role==='admin'?[]:permissions,active}).eq('user_id',id).select('user_id').maybeSingle();
 if(result.error)return {message:result.error.code==='P0001'?result.error.message:'تعذر حفظ الصلاحيات.'};
 if(!result.data)return {message:'الحساب غير موجود أو لم تعد لديك صلاحية إدارته.'};
 revalidatePath('/dashboard','layout');return {success:true,message:'تم تحديث الصلاحيات؛ تسري على الطلب التالي حتى للجلسات المفتوحة.'};
}
export async function createMember(previous:unknown,form:FormData){
 if(!allowed(await getAccess(),'admin'))return {message:'إنشاء الحسابات متاح للمدير فقط.'};
 const parsed=z.object({email:z.email().transform(s=>s.toLowerCase()),password:z.string().min(12).max(128),permissions:z.array(z.enum(modules))}).safeParse({email:form.get('email'),password:form.get('password'),permissions:form.getAll('permissions')});
 if(!parsed.success)return {message:'أدخل بريدًا صحيحًا وكلمة مرور لا تقل عن 12 حرفًا.'};
 const admin=createAdminClient();const created=await admin.auth.admin.createUser({email:parsed.data.email,password:parsed.data.password,email_confirm:true});
 if(created.error)return {message:'تعذر إنشاء الحساب؛ قد يكون البريد مستخدمًا بالفعل.'};
 const db=await createClient();const saved=await db.from('user_access').insert({user_id:created.data.user.id,email:parsed.data.email,role:'employee',permissions:parsed.data.permissions,active:true});
 if(saved.error){const cleanup=await admin.auth.admin.deleteUser(created.data.user.id);return {message:cleanup.error?'تعذر إسناد الصلاحيات وتنظيف حساب الدخول؛ يحتاج المدير مراجعة الحساب.':'تعذر إسناد الصلاحيات؛ أُلغي إنشاء حساب الدخول.'};}
 revalidatePath('/dashboard/users');return {success:true,message:'تم إنشاء الموظف. سلّمه بيانات الدخول بأمان واطلب منه تغيير كلمة المرور من حسابه.'};
}
