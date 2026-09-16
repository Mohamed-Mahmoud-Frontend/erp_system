"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
export async function payWorkersAction(_previous: unknown, form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "يجب تسجيل الدخول." };
  const parsed = z.object({ week_start: z.iso.date(), workers: z.array(z.string().uuid()).min(1) }).safeParse({ week_start: form.get("week_start"), workers: form.getAll("worker_id") });
  if (!parsed.success) return { success: false, message: "بيانات الأسبوع أو العمال غير صالحة." };
  const { data, error } = await supabase.rpc("pay_workers_week", { p_worker_ids: parsed.data.workers, p_week_start: parsed.data.week_start });
  if (error) {
    console.error("Weekly payout rejected", error);
    return { success: false, message: ["23505", "P0001"].includes(error.code) ? error.message : "تعذر تسجيل الصرف. لم تُحفظ أي دفعة في هذه المحاولة." };
  }
  revalidatePath("/dashboard/workers/payouts");
  return { success: true, message: `تم حفظ صرف ${data} عامل للأسبوع الذي يبدأ ${parsed.data.week_start}.` };
}
