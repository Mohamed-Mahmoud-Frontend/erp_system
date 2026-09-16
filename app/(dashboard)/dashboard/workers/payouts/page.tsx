import { requirePermission } from "@/lib/access";
import Link from "next/link";
import Decimal from "decimal.js";
import { createClient } from "@/lib/supabase/server";
import { payrollSchema, payrollWeek } from "@/lib/payroll";
import { money } from "@/lib/billing";
import PayForm from "./pay-form";
export const metadata = { title: "الرواتب الأسبوعية" };
export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ week?: string; search?: string }> }) {
  await requirePermission("payroll");

  const params = await searchParams;
  let week;
  try { week = payrollWeek(params.week); } catch { return <p role="alert" className="text-red-700">تاريخ الأسبوع غير صالح.</p>; }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_weekly_payroll", { p_week_start: week.start, p_search: params.search ?? "" });
  const parsed = payrollSchema.safeParse(data);
  if (error || !parsed.success) return <p role="alert" className="text-red-700">تعذر تحميل حسابات الأسبوع؛ الصرف غير متاح حتى نجاح القراءة.</p>;
  const rows = parsed.data;
  const pending = rows.filter(r => !r.paid_at).reduce((sum,r) => sum.plus(r.net_amount),new Decimal(0));
  return <div className="space-y-6 max-w-screen-xl mx-auto">
    <h1 className="text-2xl font-bold">الرواتب الأسبوعية</h1>
    <p data-testid="week-window">من الجمعة {week.start} إلى الخميس {week.end} — 7 أيام شاملة الطرفين</p>
    <div className="flex flex-wrap gap-4"><Link className="text-blue-700 underline" href="/dashboard/workers">العمال</Link><Link className="text-blue-700 underline" href="/dashboard/workers/attendance">تسجيل الحضور</Link><Link className="text-blue-700 underline" href="/dashboard/workers/transactions">السلف والمكافآت والخصومات</Link></div>
    <form className="flex flex-wrap items-end gap-4"><label>اختر يومًا داخل الأسبوع<input type="date" name="week" defaultValue={week.end} className="block border rounded p-2" /></label><label>بحث باسم العامل<input name="search" defaultValue={params.search} className="block border rounded p-2" /></label><button className="border rounded p-2">عرض الأسبوع</button></form>
    <section className="border rounded-xl bg-white p-6 space-y-3"><h2 className="text-xl font-bold">مجموع الصافي غير المصروف: {money(pending)} ج.م</h2>
      <p className="text-sm text-slate-600">صرف الكل يشمل العمال المعروضين بعد البحث. إذا سبق صرف أحدهم أو كان صافي أحدهم سالبًا تُرفض المجموعة كلها دون صرف جزئي؛ استخدم «صرف العامل» لباقي العمال.</p>
      <PayForm workers={rows.map(r => r.worker_id)} weekStart={week.start} all />
    </section>
    <p className="text-sm text-slate-600">الحساب قبل الصرف يستخدم اليومية الحالية، بما فيها إضافات أجزاء اليوم. الصف المصروف يعرض القيم المحفوظة وقت الصرف، ولا يتغير بتعديل اليومية أو الحضور لاحقًا.</p>
    <div className="overflow-x-auto bg-white border rounded-xl"><table className="w-full text-right text-sm">
      <thead><tr>{["العامل", "مكافئ أيام الحضور", "اليومية", "الأجر الأساسي", "إضافات الحضور +", "مكافآت المعاملات +", "السلف −", "الخصومات −", "الصافي", "الصرف"].map(label => <th key={label} className="p-3 whitespace-nowrap">{label}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.worker_id} data-worker-id={row.worker_id} className="border-t">
        <td className="p-3 font-bold"><Link className="underline" href={`/dashboard/workers/${row.worker_id}?week=${week.end}`}>{row.worker_name} — التصحيح والتاريخ</Link></td><td className="p-3" data-field="days_present">{row.days_present}</td>
        <td className="p-3">{money(row.daily_wage)}</td><td className="p-3" data-field="base_pay">{money(new Decimal(row.days_present).times(row.daily_wage))}</td>
        <td className="p-3" data-field="attendance_bonus">{money(row.attendance_bonus)}</td><td className="p-3" data-field="transaction_bonus">{money(row.transaction_bonus)}</td>
        <td className="p-3" data-field="advances">{money(row.advances)}</td><td className="p-3" data-field="deductions">{money(row.deductions)}</td>
        <td data-field="net_amount" className={`p-3 font-bold ${new Decimal(row.net_amount).isNegative() ? "text-red-700" : "text-blue-700"}`}>{money(row.net_amount)}</td>
        <td className="p-3">{row.paid_at ? <span className="text-green-700">مصروف — {new Date(row.paid_at).toLocaleString("ar-EG",{timeZone:"Africa/Cairo"})}</span> : <PayForm workers={[row.worker_id]} weekStart={week.start} />}</td>
      </tr>)}</tbody>
    </table>{rows.length === 0 && <p className="p-6">لا يوجد عمال مطابقون للبحث.</p>}</div>
  </div>;
}
