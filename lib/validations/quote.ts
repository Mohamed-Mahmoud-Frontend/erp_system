import { z } from "zod";

export const quoteRequestSchema = z.object({
  guest_name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  guest_phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  details: z.string().min(5, "يرجى كتابة تفاصيل طلبك"),
  // Honeypot field (should remain empty)
  website_url: z.string().max(0, "Invalid field").optional().or(z.literal("")),
});

export type QuoteRequestFormValues = z.infer<typeof quoteRequestSchema>;
