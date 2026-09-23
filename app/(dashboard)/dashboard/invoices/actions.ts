"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {requirePermission} from "@/lib/access";
import {createInvoiceSchema} from "@/lib/validations/invoice";
import {directInvoiceSchema} from "@/lib/validations/direct-invoice";
import {invoiceTotal,parseInvoiceForm} from "@/lib/invoices/items";
export async function createInvoiceAction(_previous:unknown,formData:FormData){
 await requirePermission("sales");
 const details=parseInvoiceForm(formData);
 const parsed=createInvoiceSchema.safeParse({order_id:formData.get("order_id"),total:details.success?invoiceTotal(details.data).toNumber():NaN});
 if(!parsed.success)return {errors:parsed.error.flatten().fieldErrors,message:"راجع أمر الشغل وبنود الفاتورة."};
 if(!details.success)return {message:"راجع وصف البنود والكميات والأسعار والمصاريف."};
 const db=await createClient();
 const {data,error}=await db.rpc("create_invoice_with_items",{p_order_id:parsed.data.order_id,p_items:details.data.items,p_shipping:details.data.shipping,p_discount:details.data.discount,p_notes:details.data.notes});
 if(error||!data)return {message:"تعذر إصدار الفاتورة؛ راجع البنود ومطابقتها لأمر الشغل."};
 revalidatePath("/dashboard/invoices");redirect(`/dashboard/invoices/${data}`);
}
export async function createDirectInvoiceAction(_previous:unknown,formData:FormData){
 await requirePermission("sales");
 const details=parseInvoiceForm(formData);
 if(!details.success)return {message:"راجع بنود الفاتورة والكميات والأسعار والخصم."};
 const parsed=directInvoiceSchema.safeParse({
  client_id:formData.get("client_id")||"",client_name:formData.get("client_name")||"",
  client_type:formData.get("client_type")||undefined,client_phone:formData.get("client_phone")||"",
  items:details.data.items.map(({capacity,quantity})=>({capacity,quantity})),
  total:invoiceTotal(details.data).toNumber(),paid_amount:Number(formData.get("paid_amount")),
 });
 if(!parsed.success)return {errors:parsed.error.flatten().fieldErrors,message:"راجع العميل والمبلغ المدفوع وبنود الفاتورة."};
 const db=await createClient();
 const {data,error}=await db.rpc("create_direct_invoice_with_items",{
  p_client_id:parsed.data.client_id||null,p_client_name:parsed.data.client_name||"",
  p_client_type:parsed.data.client_type||"",p_client_phone:parsed.data.client_phone||"",
  p_items:details.data.items,p_shipping:details.data.shipping,p_discount:details.data.discount,
  p_paid_amount:parsed.data.paid_amount,p_notes:details.data.notes,
 });
 if(error||!data)return {message:"تعذر إصدار فاتورة البيع المباشر؛ تحقق من البيانات وأعد المحاولة."};
 revalidatePath("/dashboard/invoices");revalidatePath("/dashboard/clients");redirect(`/dashboard/invoices/${data}`);
}