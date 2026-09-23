"use client";

import { useActionState, useState } from "react";
import CorrectionForm from "../../corrections/form";
import { deleteWorkerDayAction } from "../actions";

type Row = { id: string; worker_name: string; status: string; extra_type: string; extra_units: number; week_paid: boolean };
type Amounts = Record<string, { advance: number; bonus: number; deduction: number }>;
const labels: Record<string, string> = { present: "حاضر", half_day: "نصف يوم", quarter_day: "ربع يوم", absent: "غائب" };
const money = (value: number) => new Intl.NumberFormat("ar-EG-u-nu-latn", { maximumFractionDigits: 2 }).format(value);

function AttendanceRow({ row, amounts, canDelete, showMoney }: { row: Row; amounts?: Amounts[string]; canDelete: boolean; showMoney: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(deleteWorkerDayAction, null);
  return <>
    <tr className="border-b border-slate-100 align-middle">
      <td className="font-semibold">{row.worker_name}</td>
      <td><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${row.status === "absent" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{labels[row.status] ?? row.status}</span></td>
      <td>{row.extra_units ? `${money(row.extra_units)} ${row.extra_type === "amount" ? "جنيه" : "من اليومية"}` : "—"}</td>
      {showMoney && <><td>{amounts?.advance ? money(amounts.advance) : "—"}</td><td>{amounts?.bonus ? money(amounts.bonus) : "—"}</td><td>{amounts?.deduction ? money(amounts.deduction) : "—"}</td></>}
      <td>{row.week_paid ? <span className="text-xs text-amber-800">الأسبوع مصروف</span> : <div className="flex items-center gap-2">
        <button type="button" onClick={() => setEditing(!editing)} aria-expanded={editing} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">{editing ? "إغلاق" : "تعديل"}</button>
        {canDelete && <form action={action} onSubmit={event => { if (!window.confirm("حذف اليومية والمعاملات المالية المرتبطة بها؟")) event.preventDefault(); }}>
          <input type="hidden" name="id" value={row.id} /><button disabled={pending} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{pending ? "جارٍ الحذف…" : "حذف"}</button>
        </form>}
      </div>}</td>
    </tr>
    {state?.message && <tr><td colSpan={showMoney ? 7 : 4}><p role={state.success ? "status" : "alert"} className={state.success ? "text-emerald-700" : "text-red-700"}>{state.message}</p></td></tr>}
    {editing && !row.week_paid && <tr><td colSpan={showMoney ? 7 : 4} className="bg-slate-50"><div className="max-w-xl"><CorrectionForm kind="attendance" id={row.id} status={row.status} extraType={row.extra_type} extraUnits={row.extra_units} /></div></td></tr>}
  </>;
}

export default function AttendanceTable({ rows, amounts, canDelete, showMoney }: { rows: Row[]; amounts: Amounts; canDelete: boolean; showMoney: boolean }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-bold text-slate-900">سجل اليوم</h2><p className="text-sm text-slate-500">{rows.length} {rows.length === 1 ? "يومية مسجلة" : "يوميات مسجلة"}</p></div>
    {showMoney && <p className="border-b border-slate-100 px-5 py-2 text-xs text-slate-500">المبالغ هنا تخص اليوميات المسجلة بعد تحديث النظام؛ المعاملات الأقدم تظهر في سجل معاملات العمال.</p>}
    {rows.length === 0 ? <p className="px-5 py-10 text-center text-sm text-slate-500">لا توجد يوميات مسجلة لهذا اليوم.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm"><thead><tr><th>العامل</th><th>الحضور</th><th>الإضافة</th>{showMoney && <><th>السلفة</th><th>المكافأة</th><th>الخصم</th></>}<th>الإجراءات</th></tr></thead><tbody>{rows.map(row => <AttendanceRow key={row.id} row={row} amounts={amounts[row.id]} canDelete={canDelete} showMoney={showMoney} />)}</tbody></table></div>}
  </section>;
}
