"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/validations/order";

export async function createOrderAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  // Extract dynamic items array
  const capacities = formData.getAll("capacity[]") as string[];
  const quantities = formData.getAll("quantity[]") as string[];

  const items = capacities.map((cap, index) => ({
    capacity: cap,
    quantity: Number(quantities[index] || 1),
  }));

  const rawData = {
    client_id: formData.get("client_id") || "",
    client_name: formData.get("client_name") || "",
    client_type: formData.get("client_type") || undefined,
    client_phone: formData.get("client_phone") || "",
    items: items,
  };

  const parsed = createOrderSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  let clientId = parsed.data.client_id;

  // Create new client if client_id is not provided
  if (!clientId) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        name: parsed.data.client_name!,
        type: parsed.data.client_type!,
        phone: parsed.data.client_phone || null,
        credit_days: 0,
      })
      .select("id")
      .single();

    if (clientError || !newClient) {
      console.error("Client Creation Error:", clientError);
      return { message: "حدث خطأ أثناء إنشاء العميل الجديد." };
    }
    clientId = newClient.id;
  }

  // Calculate total quantity across all items
  const totalQuantity = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);

  // Create Order
  const { error: orderError } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      quantity: totalQuantity,
      product_spec: parsed.data.items, // Save items directly as JSONB
      status: "pending",
    });

  if (orderError) {
    console.error("Order Creation Error:", orderError);
    return { message: "حدث خطأ أثناء إضافة الطلب." };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/clients");
  redirect("/dashboard/orders");
}
