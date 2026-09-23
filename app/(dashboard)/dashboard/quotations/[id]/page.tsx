import Link from "next/link";
import {notFound} from "next/navigation";
import {z} from "zod";
import {requirePermission} from "@/lib/access";
import {createClient} from "@/lib/supabase/server";
import {parseQuotationItems} from "@/lib/quotations/items";
import QuotationEditor from "./editor";
export const metadata={title:"تعديل عرض السعر"};
export default async function QuotationDetails({params}:{params:Promise<{id:string}>}){
 await requirePermission("sales");const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
 const db=await createClient();const {data,error}=await db.from("quotations").select("id,guest_name,guest_phone,details,status,parsed_items,share_token").eq("id",id).maybeSingle();
 if(error)return <p role="alert">تعذر تحميل عرض السعر.</p>;if(!data)notFound();
 let items;try{items=parseQuotationItems(data.parsed_items)}catch{return <p role="alert">بنود عرض السعر المحفوظة غير صالحة وتحتاج مراجعة البيانات.</p>}
 return <div className="mx-auto max-w-6xl space-y-5"><div className="flex justify-between"><Link href="/dashboard/quotations" className="underline">كل عروض الأسعار</Link><Link href={`/quote/${id}?token=${data.share_token}`} target="_blank" className="underline">معاينة العرض المشترك</Link></div><QuotationEditor quotation={{...data,parsed_items:items}}/></div>;
}