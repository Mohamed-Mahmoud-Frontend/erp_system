"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
export async function updateChequeAction(_previous: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "يجب تسجيل الدخول أولًا." };
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["cleared", "bounced"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: "بيانات الشيك غير صالحة." };
  const { data, error } = await supabase.from("cheques").update({ status: parsed.data.status }).eq("id", parsed.data.id).select("id").maybeSingle();
  if (error || !data) return { success: false, message: "تعذر تحديث الشيك؛ قد يكون غير موجود أو غير متاح." };
  revalidatePath("/dashboard/cheques");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/invoices/[id]", "page");
  revalidatePath("/dashboard/clients/[id]", "page");
  return { success: true, message: parsed.data.status === "cleared" ? "تم تحصيل الشيك." : "تم تسجيل رفض الشيك." };
}
