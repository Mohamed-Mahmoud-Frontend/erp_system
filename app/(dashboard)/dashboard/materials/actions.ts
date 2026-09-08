"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { materialSchema, movementSchema } from "@/lib/validations/material";

export async function createMaterialAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    type: formData.get("type"),
    unit: formData.get("unit"),
    min_threshold: Number(formData.get("min_threshold")) || 0,
  };

  const parsed = materialSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { error } = await supabase.from("materials").insert({
    type: parsed.data.type,
    unit: parsed.data.unit,
    min_threshold: parsed.data.min_threshold,
    stock_qty: 0, // Starts at 0
  });

  if (error) {
    return { message: "حدث خطأ أثناء إضافة المادة." };
  }

  revalidatePath("/dashboard/materials");
  redirect("/dashboard/materials");
}

export async function recordMovementAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    material_id: formData.get("material_id"),
    direction: formData.get("direction"),
    qty: Number(formData.get("qty")),
    supplier_id: formData.get("supplier_id") || null,
    order_id: formData.get("order_id") || null,
    is_return: formData.get("is_return") === "true",
  };

  const parsed = movementSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { material_id, direction, qty, supplier_id, order_id, is_return } = parsed.data;

  // Record movement atomically
  const { error: rpcError } = await supabase.rpc("record_material_movement", {
    p_material_id: material_id,
    p_direction: direction,
    p_qty: qty,
    p_supplier_id: supplier_id || undefined,
    p_order_id: order_id || undefined,
    p_is_return: is_return,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (rpcError) {
    console.error("Movement recording error:", rpcError);
    return { message: "حدث خطأ أثناء تسجيل حركة المخزون." };
  }

  revalidatePath("/dashboard/materials");
  redirect("/dashboard/materials");
}
