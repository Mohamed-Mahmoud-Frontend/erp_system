"use server";

import { createClient } from "@/lib/supabase/server";
import { quoteRequestSchema } from "@/lib/validations/quote";

export async function submitQuoteAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    guest_name: formData.get("guest_name"),
    guest_phone: formData.get("guest_phone"),
    details: formData.get("details"),
    website_url: formData.get("website_url") || "", // honeypot
  };

  const parsed = quoteRequestSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  // Honeypot check: If filled, silently accept but don't save
  if (parsed.data.website_url && parsed.data.website_url.length > 0) {
    return { success: true, message: "تم إرسال طلبك بنجاح. سنتواصل معك قريباً." };
  }

  const { error } = await supabase.from("quotations").insert({
    guest_name: parsed.data.guest_name,
    guest_phone: parsed.data.guest_phone,
    details: parsed.data.details,
    status: "draft", // Enforced by RLS anyway, but good to be explicit
  });

  if (error) {
    console.error("Quote insertion error:", error);
    return { message: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى." };
  }

  return { success: true, message: "تم إرسال طلبك بنجاح. سنتواصل معك قريباً." };
}
