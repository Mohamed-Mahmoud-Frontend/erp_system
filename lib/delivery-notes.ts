import { z } from "zod";
export const deliveryItemSchema = z.object({
  description: z.string().trim().min(1, "اكتب اسم الصنف").max(500),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر").max(1_000_000)
    .refine(v => Math.abs(v * 1000 - Math.round(v * 1000)) < 0.000001, "الكمية بحد أقصى ٣ منازل عشرية"),
  unit: z.string().trim().min(1, "اكتب الوحدة").max(40),
});
export const deliveryNoteSchema = z.object({
  id: z.uuid(), delivery_date: z.iso.date(),
  customer_name: z.string().trim().min(1, "اكتب اسم العميل / جهة التسليم").max(200),
  recipient_name: z.string().trim().min(1, "اكتب اسم المستلم").max(200),
  recipient_phone: z.string().trim().max(40), delivery_address: z.string().trim().max(500),
  driver_name: z.string().trim().max(200), vehicle_number: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  items: z.array(deliveryItemSchema).min(1, "أضف صنفًا واحدًا على الأقل").max(100),
});
export function deliveryNumber(number: number) { return "DN-" + String(number).padStart(6, "0"); }
export function cairoToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
