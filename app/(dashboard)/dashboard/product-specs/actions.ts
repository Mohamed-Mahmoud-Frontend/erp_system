"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recipeLineSchema } from "@/lib/manufacturing";

export async function saveSpecAction(_previous: unknown, form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "يجب تسجيل الدخول." };
  const ids = form.getAll("material_id"), quantities = form.getAll("qty_per_unit");
  const parsed = z.object({ id: z.string().uuid().nullable(), name: z.string().trim().min(1), lines: z.array(recipeLineSchema).min(1) }).safeParse({
    id: form.get("id") || null, name: form.get("name"), lines: ids.map((id, index) => ({ material_id: id, qty_per_unit: quantities[index] })),
  });
  if (!parsed.success) return { message: "أدخل اسم الوصفة وخاماتها بكميات موجبة للوحدة الواحدة." };
  if (new Set(parsed.data.lines.map(l => l.material_id)).size !== parsed.data.lines.length) return { message: "الخامة مكررة؛ اجمع كميتها في سطر واحد." };
  const { data, error } = await supabase.rpc("save_product_spec", { p_id: parsed.data.id, p_name: parsed.data.name, p_active: form.get("active") === "on", p_lines: parsed.data.lines });
  if (error) return { message: error.code === "P0001" ? error.message : "تعذر حفظ الوصفة؛ تحقق من الخامات وأعد المحاولة." };
  revalidatePath("/dashboard/product-specs"); revalidatePath("/dashboard/orders/new/recipe");
  redirect(`/dashboard/product-specs?edit=${data}&saved=1`);
}
export async function deleteSpecAction(_previous: unknown, form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "يجب تسجيل الدخول." };
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return { message: "الوصفة غير صالحة." };
  const { data, error } = await supabase.from("product_specs").delete().eq("id", id.data).select("id").maybeSingle();
  if (error || !data) return { message: error?.code === "23503" ? "الوصفة مستخدمة في أوردر. يمكنك إلغاء تنشيطها بدل حذفها." : "تعذر حذف الوصفة أو أنها غير موجودة." };
  revalidatePath("/dashboard/product-specs"); revalidatePath("/dashboard/orders/new/recipe");
  redirect("/dashboard/product-specs");
}
