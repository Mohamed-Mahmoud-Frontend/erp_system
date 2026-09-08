"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations/client";

export async function createClientAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name"),
    type: formData.get("type"),
    phone: formData.get("phone") || null,
    address: formData.get("address") || null,
    price_tier: formData.get("price_tier") || null,
    credit_days: Number(formData.get("credit_days")) || 0,
  };

  const parsed = clientSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من صحة البيانات المدخلة",
    };
  }

  const { error } = await supabase.from("clients").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    phone: parsed.data.phone,
    address: parsed.data.address,
    price_tier: parsed.data.price_tier,
    credit_days: parsed.data.credit_days,
  });

  if (error) {
    console.error("Create client error:", error);
    return {
      message: "حدث خطأ أثناء حفظ بيانات العميل. يرجى المحاولة مرة أخرى.",
    };
  }

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}

export async function updateClientAction(id: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name"),
    type: formData.get("type"),
    phone: formData.get("phone") || null,
    address: formData.get("address") || null,
    price_tier: formData.get("price_tier") || null,
    credit_days: Number(formData.get("credit_days")) || 0,
  };

  const parsed = clientSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من صحة البيانات المدخلة",
    };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      phone: parsed.data.phone,
      address: parsed.data.address,
      price_tier: parsed.data.price_tier,
      credit_days: parsed.data.credit_days,
    })
    .eq("id", id);

  if (error) {
    console.error("Update client error:", error);
    return {
      message: "حدث خطأ أثناء تحديث بيانات العميل. يرجى المحاولة مرة أخرى.",
    };
  }

  revalidatePath(`/dashboard/clients/${id}`);
  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${id}`);
}
