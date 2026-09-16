import Decimal from "decimal.js";
import { z } from "zod";

const amount = z.string().refine(value => new Decimal(value).isFinite());
export const statementSchema = z.object({
  balance: amount,
  entries: z.array(z.object({
    id: z.string(), invoice_id: z.string(), invoice_number: z.string(), date: z.string(),
    kind: z.enum(["invoice", "payment", "return"]), description: z.string().nullable(),
    debit: amount, credit: amount, original_amount: amount, bounced: z.boolean(),
    due_date: z.string().nullable(), invoice_balance: amount, running_balance: amount,
  })),
});
export function money(value: Decimal.Value) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(new Decimal(value).toNumber());
}
export function balanceLabel(value: Decimal.Value) {
  const balance = new Decimal(value);
  return `${balance.isZero() ? "متوازن" : balance.isPositive() ? "عليه" : "له"} ${money(balance.abs())} ج.م`;
}
export function isOverdue(dueDate: string | null, balance: Decimal.Value) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Decimal(balance).greaterThan(0) && dueDate !== null && dueDate < today;
}
