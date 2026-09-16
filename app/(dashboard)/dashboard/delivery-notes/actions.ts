"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/access";
import { deliveryNoteSchema } from "@/lib/delivery-notes";
import { createClient } from "@/lib/supabase/server";
export type DeliveryState = { error?: string };
export async function createDeliveryNote(_previous: DeliveryState, formData: FormData): Promise<DeliveryState> {
  await requirePermission(["sales", "production"]);
  let items: unknown;
  try { items = JSON.parse(String(formData.get("items"))); }
  catch { return { error: "بيانات الأصناف غير صالحة. راجعها وأعد المحاولة." }; }
  const parsed = deliveryNoteSchema.safeParse({ ...Object.fromEntries(formData), items });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "راجع بيانات الإذن." };
  const db = await createClient();
  const { error } = await db.from("delivery_notes").insert(parsed.data);
  if (error) {
    // Stable UUID prevents duplicate documents on retry.
    const existing = error.code === "23505"
      ? await db.from("delivery_notes").select("id").eq("id", parsed.data.id).maybeSingle() : null;
    if (!existing?.data) return { error: "تعذر حفظ إذن التسليم. أعد المحاولة، وإذا استمرت المشكلة تواصل مع مسؤول النظام." };
  }
  revalidatePath("/dashboard/delivery-notes");
  redirect("/dashboard/delivery-notes/" + parsed.data.id);
}
