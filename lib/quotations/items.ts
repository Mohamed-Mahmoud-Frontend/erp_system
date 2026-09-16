import { z } from "zod";
import Decimal from "decimal.js";

export const quotationProductSchema = z.object({
  capacity: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive().max(1_000_000),
  price: z.number().nonnegative().max(1_000_000_000),
  material: z.string().max(500).default("بولي إيثيلين درجة أولى بيور"),
});

export const quotationItemsSchema = z.object({
  products: z.array(quotationProductSchema).max(100),
  transportation_cost: z.number().nonnegative().max(1_000_000_000).default(0),
});

export const aiQuotationSchema = quotationItemsSchema.extend({
  guest_name: z.string().max(200).optional(),
  guest_phone: z.string().max(50).optional(),
  products: z.array(quotationProductSchema).min(1).max(100),
});

export type QuotationItems = z.infer<typeof quotationItemsSchema>;

export function parseQuotationItems(value: unknown): QuotationItems {
  return quotationItemsSchema.parse(Array.isArray(value)
    ? { products: value, transportation_cost: 0 }
    : value);
}

export function quotationTotals(items: QuotationItems) {
  const subtotal = items.products.reduce(
    (sum, item) => sum.plus(new Decimal(item.price).times(item.quantity)),
    new Decimal(0),
  );
  return {
    itemsTotal: subtotal.toDecimalPlaces(2).toNumber(),
    transportationCost: items.transportation_cost,
    grandTotal: subtotal.plus(items.transportation_cost).toDecimalPlaces(2).toNumber(),
  };
}

export type SharedQuotation = {
  guest_name: string | null;
  guest_phone: string | null;
  created_at: string;
  parsed_items: QuotationItems;
};
