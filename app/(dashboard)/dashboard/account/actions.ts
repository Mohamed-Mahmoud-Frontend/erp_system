"use server";
import {z} from 'zod';
import {createClient} from '@/lib/supabase/server';
export async function changePassword(previous:unknown,form:FormData){
 const parsed=z.object({current:z.string().min(1),password:z.string().min(12).max(128),confirmation:z.string()}).refine(x=>x.password===x.confirmation).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {message:'أدخل كلمة المرور الحالية وجديدة لا تقل عن 12 حرفًا مع تأكيد مطابق.'};
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();if(error||!user?.email)return {message:'يجب تسجيل الدخول.'};
 const verified=await db.auth.signInWithPassword({email:user.email,password:parsed.data.current});if(verified.error)return {message:'كلمة المرور الحالية غير صحيحة.'};
 const result=await db.auth.updateUser({password:parsed.data.password});if(result.error)return {message:'تعذر تغيير كلمة المرور. أعد المحاولة.'};
 return {success:true,message:'تم تغيير كلمة المرور. احتفظ بها بأمان.'};
}
