"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({ invoice_id: z.string().uuid(), amount: z.coerce.number().positive().finite(), condition: z.string().trim().min(1), note: z.string().trim() });
export async function recordReturnAction(_previous: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "يجب تسجيل الدخول أولًا." };
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: "أدخل قيمة موجبة وحالة أو سبب المرتجع." };
  const { invoice_id, amount, condition, note } = parsed.data;
  const { error } = await supabase.rpc("record_sales_return", { p_invoice_id: invoice_id, p_amount: amount, p_condition: condition, p_note: note || undefined });
  if (error) {
    console.error("Sales return failed", error);
    return { success: false, message: error.message.includes("قيمة المرتجع") ? "قيمة المرتجع تتجاوز قيمة الفاتورة بعد المرتجعات السابقة." : "تعذر تسجيل المرتجع. تحقق من الفاتورة وأعد المحاولة." };
  }
  revalidatePath(`/dashboard/invoices/${invoice_id}`);
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/clients/[id]", "page");
  return { success: true, message: "تم تسجيل مرتجع البيع." };
}
