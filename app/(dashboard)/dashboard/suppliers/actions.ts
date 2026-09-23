"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {requirePermission} from "@/lib/access";
import { supplierSchema, supplierTransactionSchema } from "@/lib/validations/material";

export async function createSupplierAction(prevState: unknown, formData: FormData) {
  await requirePermission("suppliers");
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name"),
    balance: Number(formData.get("balance") || 0),
  };

  const parsed = supplierSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { error } = await supabase.from("suppliers").insert({
    name: parsed.data.name,
    opening_balance: parsed.data.balance,
  });

  if (error) {
    return { message: "حدث خطأ أثناء إضافة المورد." };
  }

  revalidatePath("/dashboard/suppliers");
  redirect("/dashboard/suppliers");
}

export async function recordSupplierTransactionAction(prevState: unknown, formData: FormData) {
  await requirePermission("suppliers");
  const supabase = await createClient();

  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError || !user) return {message:'يجب تسجيل الدخول.'};
  const parsed=supplierTransactionSchema.safeParse(Object.fromEntries(formData));
  if(!parsed.success) return {message:'اختر المورد ونوع المعاملة وأدخل مبلغًا موجبًا صالحًا.'};
  const {supplier_id,type,amount,reference,description,occurred_on}=parsed.data;

  // Record transaction atomically
  const { error: rpcError } = await supabase.rpc("record_supplier_transaction_detailed", {
    p_supplier_id: supplier_id,
    p_type: type,
    p_amount: amount, p_reference: reference, p_description: description, p_occurred_on: occurred_on,
  });

  if (rpcError) {
    console.error("Supplier transaction error:", rpcError);
    return { message: "حدث خطأ أثناء تسجيل المعاملة." };
  }

  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${supplier_id}`);
  return { success: true, message: "تم تسجيل المعاملة بنجاح" };
}
