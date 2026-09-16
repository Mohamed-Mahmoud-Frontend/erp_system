"use server";
import {allowed,getAccess} from "@/lib/access";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const correction = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("wage"), id: z.uuid(), daily_wage: z.coerce.number().finite().min(0), confirm: z.literal("yes") }),
  z.object({ kind: z.literal("attendance"), id: z.uuid(), status: z.enum(["present","half_day","quarter_day","absent"]), extra_type: z.enum(["amount","day_fraction"]), extra_units: z.coerce.number().finite().min(0) }),
  z.object({ kind: z.enum(["payout","return"]), id: z.uuid(), reason: z.string().trim().min(1).max(2000), confirm: z.literal("yes") }),
]);
export async function correctAction(previous: unknown, form: FormData) {
  const parsed = correction.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: "راجع البيانات وسبب الإلغاء وخانة التأكيد المطلوبة." };
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) return { message: "يجب تسجيل الدخول." };
  const p = parsed.data;
  const access=await getAccess();
  if(p.kind === "attendance" ? !(allowed(access,"attendance")||allowed(access,"payroll")) : !allowed(access,"admin")) return {message:"ليست لديك صلاحية تنفيذ هذا التصحيح."};
  const result = p.kind === "wage"
    ? await db.from("workers").update({ daily_wage: p.daily_wage }).eq("id",p.id).select("id").maybeSingle()
    : p.kind === "attendance"
    ? await db.from("attendance").update({ status:p.status, extra_type:p.extra_type, extra_units:p.extra_units }).eq("id",p.id).select("id").maybeSingle()
    : await db.from(p.kind === "payout" ? "worker_payouts" : "sales_returns").update({ voided_at: new Date().toISOString(), voided_reason:p.reason }).eq("id",p.id).select("id").maybeSingle();
  if (result.error) return { message: result.error.code === "P0001" ? result.error.message : "تعذر حفظ التصحيح. أعد المحاولة." };
  if (!result.data) return { message: "السجل غير موجود؛ لم يتم حفظ أي تصحيح." };
  revalidatePath("/dashboard", "layout");
  return { success:true, message:"تم حفظ التصحيح مع الاحتفاظ بالسجل المالي الأصلي." };
}
