import { z } from "zod";
import { orderItemSchema } from "./order";

export const directInvoiceSchema = z.object({
  client_id: z.string().uuid().optional().or(z.literal("")),
  client_name: z.string().optional(),
  client_type: z.enum(["trader", "contractor", "individual", "company", "office"]).optional(),
  client_phone: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "يجب إضافة بند واحد على الأقل"),
  total: z.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
  paid_amount: z.number().min(0, "المبلغ المدفوع يجب أن يكون رقماً موجباً"),
}).refine(
  (data) => {
    // If no client_id, we MUST have a client_name and client_type
    if (!data.client_id) {
      return !!data.client_name && data.client_name.length > 2 && !!data.client_type;
    }
    return true;
  },
  {
    message: "يجب اختيار عميل حالي أو إدخال بيانات عميل جديد بشكل صحيح",
    path: ["client_name"],
  }
);

export type DirectInvoiceFormValues = z.infer<typeof directInvoiceSchema>;
