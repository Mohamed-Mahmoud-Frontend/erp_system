"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { paymentSchema } from "@/lib/validations/payment";

export async function recordPaymentAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "يجب تسجيل الدخول أولًا." };

  const rawData = {
    invoice_id: formData.get("invoice_id"),
    amount: Number(formData.get("amount")),
    method: formData.get("method"),
    cheque_due_date: formData.get("cheque_due_date") || null,
  };

  const parsed = paymentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { invoice_id, amount, method, cheque_due_date } = parsed.data;

  // Call the atomic RPC to record payment
  const { error: rpcError } = await supabase.rpc("record_payment_atomic", {
    p_invoice_id: invoice_id,
    p_amount: amount,
    p_method: method,
    p_cheque_due_date: cheque_due_date || undefined,
  });

  if (rpcError) {
    console.error("Payment recording error:", rpcError);
    if (rpcError.message.includes("المبلغ يجب أن يكون موجبًا")) {
      return { message: "المبلغ المدفوع أكبر من الرصيد المتبقي للفاتورة." };
    }
    return { message: "حدث خطأ أثناء تسجيل الدفعة." };
  }

  revalidatePath(`/dashboard/invoices/${invoice_id}`);
  revalidatePath(`/dashboard/invoices`);
  revalidatePath("/dashboard/clients/[id]", "page");
  revalidatePath("/dashboard/cheques");
  return { success: true, message: "تم تسجيل الدفعة بنجاح" };
}
