import { z } from "zod";

export const clientTypes = ["trader", "contractor", "individual", "company", "office"] as const;

export const clientSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  type: z.enum(clientTypes, {
    message: "يرجى اختيار نوع العميل",
  }),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  price_tier: z.string().optional().nullable(),
  credit_days: z.number({ message: "يجب إدخال رقم صحيح" }).min(0, "فترة الائتمان لا يمكن أن تكون سالبة"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
