import { z } from "zod";
import Decimal from "decimal.js";
export function cairoToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function payrollWeek(day = cairoToday()) {
  if (!z.iso.date().safeParse(day).success) throw new Error("تاريخ الأسبوع غير صالح");
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 2) % 7));
  const dates = Array.from({ length: 7 }, (_, i) => new Date(date.getTime() + i * 86400000).toISOString().slice(0,10));
  return { start: dates[0], end: dates[6], dates };
}
const amount = z.string().refine(s => { try { return new Decimal(s).isFinite(); } catch { return false; } });
export const payrollSchema = z.array(z.object({
  worker_id: z.string().uuid(), worker_name: z.string(), paid_at: z.string().nullable(),
  daily_wage: amount, days_present: amount, attendance_bonus: amount, transaction_bonus: amount,
  advances: amount, deductions: amount, net_amount: amount,
}));
