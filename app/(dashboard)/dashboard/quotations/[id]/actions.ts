"use server";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {requirePermission} from "@/lib/access";
import {createClient} from "@/lib/supabase/server";
import {quotationItemsSchema} from "@/lib/quotations/items";
const header=z.object({id:z.uuid(),guest_name:z.string().trim().min(2).max(200),guest_phone:z.string().trim().max(50),details:z.string().trim().max(10000),status:z.enum(["draft","sent","approved","rejected"])});
export async function saveQuotation(_previous:unknown,form:FormData){
 await requirePermission("sales");
 const parsed=header.safeParse(Object.fromEntries(form));
 const capacities=form.getAll("capacity[]");const quantities=form.getAll("quantity[]");const prices=form.getAll("price[]");const materials=form.getAll("material[]");
 if(!parsed.success||capacities.length<1||capacities.length>100||[quantities,prices,materials].some(a=>a.length!==capacities.length))return {message:"راجع بيانات العرض والبنود."};
 const items=quotationItemsSchema.safeParse({products:capacities.map((capacity,i)=>({capacity,quantity:Number(quantities[i]),price:Number(prices[i]),material:materials[i]})),transportation_cost:Number(form.get("transportation_cost"))});
 if(!items.success||items.data.products.length===0)return {message:"أدخل بندًا واحدًا على الأقل بسعة وكمية وسعر صالحين."};
 const db=await createClient();const {data,error}=await db.from("quotations").update({guest_name:parsed.data.guest_name,guest_phone:parsed.data.guest_phone||null,details:parsed.data.details||null,status:parsed.data.status,parsed_items:items.data}).eq("id",parsed.data.id).select("id").maybeSingle();
 if(error||!data)return {message:"تعذر حفظ عرض السعر؛ راجع الصلاحيات وأعد المحاولة."};
 revalidatePath("/dashboard/quotations");revalidatePath(`/dashboard/quotations/${data.id}`);revalidatePath(`/quote/${data.id}`);
 return {success:true,message:"تم حفظ عرض السعر وتحديث الرابط المشترك."};
}