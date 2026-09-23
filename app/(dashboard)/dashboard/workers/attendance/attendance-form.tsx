"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordWorkerDayAction } from "../actions";
import ArabicDatePicker from "../../arabic-date-picker";
import UiIcon from "../../../ui-icon";

type Worker = { id: string; name: string };
const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800";

export default function AttendanceForm({ workers, today, canFinancial = true, syncWithPage = false }: {
  workers: Worker[]; today: string; canFinancial?: boolean; syncWithPage?: boolean;
}) {
  const [state, action, pending] = useActionState(recordWorkerDayAction, null);
  const [status, setStatus] = useState("present");
  const [localDate, setLocalDate] = useState(today);
  const router = useRouter();
  const [changingDate, startDateChange] = useTransition();
  const date = syncWithPage ? today : localDate;
  const setDate = (next: string) => {
    if (syncWithPage) startDateChange(() => router.push(`/dashboard/workers/attendance?date=${next}`, { scroll: false }));
    else setLocalDate(next);
  };
  const isPresent = status !== "absent";

  return <form action={action} aria-label="تسجيل اليومية" className="attendance-form rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <fieldset disabled={pending || changingDate} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="attendance-heading"><span className="form-heading-icon"><UiIcon name="users" /></span><div><h2 className="text-lg font-bold text-slate-900">تسجيل يومية العامل</h2><p className="text-sm text-slate-500">الحضور والمبالغ في خطوة واحدة</p></div></div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{date}</span>
      </div>
      <div className="form-section-label"><span>01</span> بيانات اليومية</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="block text-sm font-semibold text-slate-700 xl:col-span-2">العامل *
          <select name="worker_id" required defaultValue="" className={field}><option value="">اختر العامل</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        </label>
        <div><ArabicDatePicker key={date} name="work_date" value={date} onChange={setDate} label="تاريخ يوم العمل" /></div>
        <fieldset className="attendance-status xl:col-span-2">
          <legend>الحضور *</legend>
          <div className="attendance-status-options">
            {[["present", "حاضر"], ["half_day", "نصف يوم"], ["quarter_day", "ربع يوم"], ["absent", "غائب"]].map(([value, label]) => (
              <label key={value} data-status={value}>
                <input type="radio" name="status" value={value} checked={status === value} onChange={e => setStatus(e.target.value)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {isPresent ? <label className="block text-sm font-semibold text-slate-700">نوع الإضافة
          <select name="extra_type" className={field}><option value="amount">مبلغ بالجنيه</option><option value="day_fraction">جزء من اليومية</option></select>
        </label> : <input type="hidden" name="extra_type" value="amount" />}
      </div>
      {(isPresent || canFinancial) && <div className="form-section-label"><span>02</span> الإضافات والمبالغ</div>}
      <div className="attendance-money-grid grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isPresent ? <label className="block text-sm font-semibold text-slate-700">قيمة الإضافة
          <input name="extra_units" type="number" min="0" step="any" defaultValue="0" required className={field} />
        </label> : <input type="hidden" name="extra_units" value="0" />}
        {canFinancial && <>
          <label className="block text-sm font-semibold text-slate-700">السلفة بالجنيه
            <input name="advance" type="number" min="0" step="0.01" defaultValue="0" inputMode="decimal" className={field} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">المكافأة بالجنيه
            <input name="bonus" type="number" min="0" step="0.01" defaultValue="0" inputMode="decimal" className={field} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">الخصم بالجنيه
            <input name="deduction" type="number" min="0" step="0.01" defaultValue="0" inputMode="decimal" className={field} />
          </label>
        </>}
      </div>
      {state?.message && <p role={state.success ? "status" : "alert"} className={`rounded-xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{state.message}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">اترك أي مبلغ بصفر إذا لم يوجد. السلفة مبلغ نقدي دائمًا.</p>
        <button disabled={pending || changingDate || workers.length === 0} className="min-h-11 rounded-xl bg-blue-700 px-6 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"><UiIcon name={pending ? "clock" : "check"} />{pending ? "جارٍ الحفظ…" : "حفظ اليومية"}</button>
      </div>
    </fieldset>
  </form>;
}
