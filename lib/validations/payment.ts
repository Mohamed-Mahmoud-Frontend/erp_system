import { z } from "zod";

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().min(0.01, "المبلغ يجب أن يكون أكبر من الصفر"),
  method: z.enum(["cash", "transfer", "cheque"]),
  // Cheque specific fields
  cheque_due_date: z.string().optional().nullable(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
