import Decimal from "decimal.js";
import { z } from "zod";

export const decimalQuantity = z.string().trim().refine(value => {
  try { const n = new Decimal(value); return value !== "" && n.isFinite() && n.greaterThanOrEqualTo(0); }
  catch { return false; }
}, "الكمية يجب أن تكون رقمًا موجبًا أو صفرًا");
export const recipeLineSchema = z.object({ material_id: z.string().uuid(), qty_per_unit: decimalQuantity.refine(v => new Decimal(v).greaterThan(0)) });
export const requirementsSchema = z.array(z.object({ material_id: z.string().uuid(), name: z.string(), unit: z.string(), qty_per_unit: decimalQuantity, default_qty: decimalQuantity }));
export const overridesSchema = z.record(z.string().uuid(), decimalQuantity);
export function readOverrides(formData: FormData) {
  return overridesSchema.safeParse(Object.fromEntries([...formData.entries()].filter(([key, value]) => key.startsWith("override:") && value !== "").map(([key, value]) => [key.slice(9), value])));
}
export const statusLabels: Record<string, string> = { pending: "قيد الانتظار", in_production: "جاري التصنيع", completed: "مكتمل", delivered: "تم التسليم", cancelled: "ملغي" };
export type Requirement = z.infer<typeof requirementsSchema>[number];
export type RecipeOption = { id: string; name: string; product_spec_materials: { material_id: string; qty_per_unit: number; materials: { type: string; unit: string } }[] };
