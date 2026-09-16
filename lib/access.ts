import "server-only";
import {cache} from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {z} from "zod";
export const modules=['sales','production','attendance','payroll','suppliers'] as const;
export type Module=typeof modules[number];
export const labels:Record<Module,string>={sales:'العملاء والمبيعات والتحصيل',production:'الأوردرات والتصنيع والخامات',attendance:'الحضور بدون الاطلاع على اليومية والرواتب',payroll:'العمال والرواتب والسلف',suppliers:'الموردون وحساباتهم'};
const schema=z.object({user_id:z.uuid(),email:z.string(),role:z.enum(['admin','employee']),permissions:z.array(z.enum(modules)),active:z.boolean()});
export const getAccess=cache(async()=>{
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return null;
 const result=await db.from('user_access').select('*').eq('user_id',user.id).maybeSingle();
 if(result.error)throw Error('تعذر التحقق من صلاحيات الحساب. أعد المحاولة.');
 if(!result.data)return null;
 const parsed=schema.safeParse(result.data);if(!parsed.success)throw Error('إعدادات صلاحيات الحساب غير صالحة.');return parsed.data;
});
export type Access=NonNullable<Awaited<ReturnType<typeof getAccess>>>;
export function allowed(access:Access|null,permission:Module|'admin') {return !!access?.active&&(access.role==='admin'||(permission!=='admin'&&access.permissions.includes(permission)));}
export async function requirePermission(permission:Module|'admin'|Module[]){const access=await getAccess();if(!(Array.isArray(permission)?permission.some(p=>allowed(access,p)):allowed(access,permission)))redirect('/dashboard?denied=1');return access!;}
