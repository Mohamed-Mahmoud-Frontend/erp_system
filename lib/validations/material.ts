import { z } from "zod";
import Decimal from "decimal.js";

export const materialSchema = z.object({
  type: z.string().min(2, "نوع المادة يجب أن يكون أكثر من حرفين"),
  unit: z.enum(["kg", "ton"], { error: "يجب اختيار وحدة قياس صحيحة (كجم أو طن)" }),
  min_threshold: z.number().min(0, "الحد الأدنى لا يمكن أن يكون سالباً"),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

export const movementSchema = z.object({
  material_id: z.string().uuid("المادة مطلوبة"),
  direction: z.enum(["in", "out"]),
  qty: z.number().min(0.01, "الكمية يجب أن تكون أكبر من الصفر"),
  supplier_id: z.string().uuid().optional().nullable(),
  order_id: z.string().uuid().optional().nullable(),
  is_return: z.boolean().default(false),
});

export type MovementFormValues = z.infer<typeof movementSchema>;

export const supplierSchema = z.object({
  name: z.string().min(2, "اسم المورد مطلوب"),
  balance: z.number().finite().default(0),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const supplierTransactionSchema = z.object({
 supplier_id: z.uuid(), type:z.enum(['invoice','payment']), amount:z.coerce.number().finite().positive().refine(n=>new Decimal(n).decimalPlaces()<=2), reference:z.string().trim().max(100), description:z.string().trim().max(2000), occurred_on:z.iso.date(),
});
