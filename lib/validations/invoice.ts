import { z } from "zod";

export const createInvoiceSchema = z.object({
  order_id: z.string().uuid("رقم الطلب غير صالح"),
  total: z.number({ message: "يجب إدخال مبلغ صحيح" }).min(0.01, "المبلغ الإجمالي يجب أن يكون أكبر من الصفر"),
});

export type CreateInvoiceValues = z.infer<typeof createInvoiceSchema>;
