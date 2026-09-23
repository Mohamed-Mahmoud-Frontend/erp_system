import Link from "next/link";
import { z } from "zod";
import { requirePermission, allowed, getAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { cairoToday, payrollWeek } from "@/lib/payroll";
import AttendanceForm from "./attendance-form";
import AttendanceTable from "./attendance-table";
import DateNavigation from "./date-navigation";

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requirePermission(["attendance", "payroll"]);
  const access = await getAccess();
  const chosen = (await searchParams).date ?? cairoToday();
  if (!z.iso.date().safeParse(chosen).success) return <p role="alert">تاريخ غير صالح.</p>;
  const week = payrollWeek(chosen);
  const shift = (days: number) => new Date(Date.parse(chosen + "T00:00:00Z") + days * 86400000).toISOString().slice(0, 10);
  const db = await createClient();
  const [workers, attendance] = await Promise.all([
    db.from("worker_directory").select("id,name").order("name"),
    db.from("attendance_status").select("*").eq("work_date", chosen).order("worker_name"),
  ]);
  const canFinancial = allowed(access, "payroll");
  const ids = attendance.data?.map(row => row.id) ?? [];
  const transactions = canFinancial && ids.length ? await db.from("worker_transactions").select("attendance_id,type,amount").in("attendance_id", ids) : null;
  const amounts: Record<string, { advance: number; bonus: number; deduction: number }> = {};
  for (const item of transactions?.data ?? []) {
    if (!item.attendance_id || !["advance", "bonus", "deduction"].includes(item.type)) continue;
    const row = amounts[item.attendance_id] ?? { advance: 0, bonus: 0, deduction: 0 };
    row[item.type as keyof typeof row] += Number(item.amount);
    amounts[item.attendance_id] = row;
  }
  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">الحضور واليوميات</h1><p className="text-sm text-slate-500">سجل الحضور والمبالغ، وراجع يوميات التاريخ المختار أسفل النموذج.</p></div>{canFinancial && <Link href="/dashboard/workers/payouts" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">عرض الرواتب</Link>}</div>
    <div className="flex flex-wrap items-end justify-between gap-3"><DateNavigation date={chosen} /><div className="flex gap-2 text-sm"><Link className="rounded-lg border bg-white px-3 py-2 hover:bg-slate-50" href={`?date=${shift(-7)}`}>الأسبوع السابق</Link><Link className="rounded-lg border bg-white px-3 py-2 hover:bg-slate-50" href={`?date=${shift(7)}`}>الأسبوع التالي</Link></div></div>
    <nav aria-label="أيام الأسبوع" className="attendance-week grid grid-cols-3 gap-2 sm:grid-cols-6">{week.dates.slice(1).map((date, index) => <Link key={date} href={`?date=${date}`} aria-current={date === chosen ? "date" : undefined} className={`rounded-xl border p-2 text-center text-sm ${date === chosen ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white hover:border-blue-300"}`}><strong className="block">{["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"][index]}</strong><small>{date}</small></Link>)}</nav>
    {workers.error ? <p role="alert">تعذر تحميل العمال.</p> : <AttendanceForm key={chosen} syncWithPage workers={workers.data} today={chosen} canFinancial={canFinancial} />}
    {attendance.error ? <p role="alert">تعذر تحميل الحضور.</p> : <AttendanceTable rows={attendance.data} amounts={amounts} canDelete={allowed(access, "admin")} showMoney={canFinancial && !transactions?.error} />}
    {transactions?.error && <p role="alert" className="text-sm text-red-700">تعذر تحميل مبالغ اليوميات. تحقق من تطبيق ترحيل قاعدة البيانات الجديد.</p>}
  </div>;
}
