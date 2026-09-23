"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { materialSchema, movementSchema } from "@/lib/validations/material";
import Decimal from "decimal.js";

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

  const priceMode = String(formData.get("price_mode") || "");
  const priceText = String(formData.get("price") || "").trim();
  const reference = String(formData.get("reference") || "").trim();
  const occurredOn = String(formData.get("occurred_on") || "");
  if (direction === "in" && supplier_id && !is_return) {
    const price = new Decimal(priceText || "NaN");
    if (!["per_ton", "total"].includes(priceMode) || !price.isFinite() || price.lte(0) || price.decimalPlaces() > 2 || reference.length > 100 || !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
      return { message: "اختر طريقة السعر وأدخل مبلغًا موجبًا وتاريخًا صحيحًا." };
    }
    const { error } = await supabase.rpc("record_priced_material_receipt", {
      p_material_id: material_id, p_supplier_id: supplier_id, p_qty: qty,
      p_price_mode: priceMode, p_price: price.toNumber(),
      p_reference: reference, p_occurred_on: occurredOn,
    });
    if (error) {
      console.error("Priced receipt error:", error);
      return { message: error.code === "23505" ? "رقم المرجع مستخدم لهذا المورد. أدخل رقمًا مختلفًا." : "تعذر حفظ التوريد وحساب المورد. تحقق من البيانات والصلاحيات." };
    }
    revalidatePath("/dashboard/materials");
    revalidatePath("/dashboard/suppliers/" + supplier_id);
    redirect("/dashboard/suppliers/" + supplier_id);
  }
  if (direction === "in" && supplier_id && is_return && priceText) {
    return { message: "المرتجع لا يسجل فاتورة مورد. أزل السعر ثم احفظ." };
  }
  // Record movement atomically
  const { error: rpcError } = await supabase.rpc("record_material_movement", {
    p_material_id: material_id,
    p_direction: direction,
    p_qty: qty,
    p_supplier_id: supplier_id || undefined,
    p_order_id: order_id || undefined,
    p_is_return: is_return,
  });

  if (rpcError) {
    console.error("Movement recording error:", rpcError);
    return { message: "حدث خطأ أثناء تسجيل حركة المخزون." };
  }

  revalidatePath("/dashboard/materials");
  redirect("/dashboard/materials");
}
