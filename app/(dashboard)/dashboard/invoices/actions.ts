"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvoiceSchema } from "@/lib/validations/invoice";
import { directInvoiceSchema } from "@/lib/validations/direct-invoice";

export async function createInvoiceAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    order_id: formData.get("order_id"),
    total: Number(formData.get("total")),
  };

  const parsed = createInvoiceSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { data: invoiceId, error: rpcError } = await supabase.rpc("create_invoice_atomic", {
    p_order_id: parsed.data.order_id,
    p_total: parsed.data.total,
    p_credit_days: 0,
  });

  if (rpcError) {
    console.error("RPC Error:", rpcError);
    return { message: "حدث خطأ أثناء إصدار الفاتورة." };
  }

  revalidatePath("/dashboard/invoices");
  redirect(`/dashboard/invoices/${invoiceId}`);
}

export async function createDirectInvoiceAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const capacities = formData.getAll("capacity[]") as string[];
  const quantities = formData.getAll("quantity[]") as string[];

  const items = capacities.map((cap, index) => ({
    capacity: cap,
    quantity: Number(quantities[index] || 1),
  }));

  const rawData = {
    client_id: formData.get("client_id") || "",
    client_name: formData.get("client_name") || "",
    client_type: formData.get("client_type") || "",
    client_phone: formData.get("client_phone") || "",
    items: items,
    total: Number(formData.get("total")),
    paid_amount: Number(formData.get("paid_amount")),
  };

  const parsed = directInvoiceSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const totalQuantity = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);

  const { data: invoiceId, error: rpcError } = await supabase.rpc("create_direct_invoice_atomic", {
    p_client_id: parsed.data.client_id || null, // UUID accepts null
    p_client_name: parsed.data.client_name || "",
    p_client_type: parsed.data.client_type || "",
    p_client_phone: parsed.data.client_phone || "",
    p_quantity: totalQuantity,
    p_total: parsed.data.total,
    p_paid_amount: parsed.data.paid_amount,
    p_product_spec: parsed.data.items, // JSONB
  });

  if (rpcError) {
    console.error("RPC Error:", rpcError);
    return { message: "حدث خطأ أثناء إنشاء فاتورة البيع المباشر." };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/invoices/${invoiceId}`);
}
