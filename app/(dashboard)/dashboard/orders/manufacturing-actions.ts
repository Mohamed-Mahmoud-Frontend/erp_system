"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { readOverrides } from "@/lib/manufacturing";

export async function createRecipeOrderAction(_previous: unknown, form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "يجب تسجيل الدخول." };
  const parsed = z.object({ client_id: z.string().uuid(), product_spec_id: z.string().uuid(), quantity: z.coerce.number().int().positive().max(2147483647) }).safeParse(Object.fromEntries(form));
  const overrides = readOverrides(form);
  if (!parsed.success || !overrides.success) return { message: "اختر العميل والوصفة وأدخل عدد وحدات صحيحًا وكميات خامات صالحة." };
  const { data, error } = await supabase.from("orders").insert({ ...parsed.data, material_overrides: overrides.data, status: "pending" }).select("id").single();
  if (error) return { message: error.code === "P0001" ? error.message : "تعذر إنشاء الأوردر. تحقق من العميل والوصفة وأعد المحاولة." };
  revalidatePath("/dashboard/orders"); revalidatePath("/dashboard/clients/[id]", "page");
  redirect(`/dashboard/orders/${data.id}`);
}
export async function changeOrderStatusAction(_previous: unknown, form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "يجب تسجيل الدخول." };
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["in_production", "completed", "delivered", "cancelled"]) }).safeParse(Object.fromEntries(form));
  const overrides = readOverrides(form);
  if (!parsed.success || !overrides.success) return { success: false, message: "الحالة أو كميات الخامات غير صالحة." };
  const { data, error } = await supabase.from("orders").update({ status: parsed.data.status,
    ...(parsed.data.status === "in_production" ? { material_overrides: overrides.data } : {}),
  }).eq("id", parsed.data.id).select("id").maybeSingle();
  if (error || !data) return { success: false, message: error?.code === "P0001" ? error.message : "تعذر تغيير الحالة؛ أعد تحميل الأوردر وحاول مرة أخرى." };
  revalidatePath(`/dashboard/orders/${parsed.data.id}`); revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/materials"); revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients/[id]", "page");
  return { success: true, message: "تم تحديث حالة الأوردر." };
}
