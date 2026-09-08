"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supplierSchema } from "@/lib/validations/material";

export async function createSupplierAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name"),
    balance: Number(formData.get("balance")) || 0,
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
    balance: parsed.data.balance,
  });

  if (error) {
    return { message: "حدث خطأ أثناء إضافة المورد." };
  }

  revalidatePath("/dashboard/suppliers");
  redirect("/dashboard/suppliers");
}

export async function recordSupplierTransactionAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const supplier_id = formData.get("supplier_id") as string;
  const type = formData.get("type") as "invoice" | "payment";
  const amount = Number(formData.get("amount"));

  if (!supplier_id || !type || amount <= 0) {
    return { message: "تأكد من إدخال مبلغ صحيح واختيار المورد" };
  }

  // Record transaction atomically
  const { error: rpcError } = await supabase.rpc("record_supplier_transaction", {
    p_supplier_id: supplier_id,
    p_type: type,
    p_amount: amount,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (rpcError) {
    console.error("Supplier transaction error:", rpcError);
    return { message: "حدث خطأ أثناء تسجيل المعاملة." };
  }

  revalidatePath("/dashboard/suppliers");
  return { success: true, message: "تم تسجيل المعاملة بنجاح" };
}
