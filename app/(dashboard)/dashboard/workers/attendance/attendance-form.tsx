"use client";
import { useActionState } from "react";
import { recordAttendanceAction } from "../actions";
export default function AttendanceForm({ workers, today }: { workers: { id: string; name: string }[]; today: string }) {
  const [state, action, pending] = useActionState(recordAttendanceAction, null);
  return <form action={action} aria-label="تسجيل اليومية" className="bg-white border rounded-xl p-6 space-y-4">
    <label className="block">العامل<select name="worker_id" required className="block border rounded p-2 w-full"><option value="">اختر العامل</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
    <label className="block">التاريخ<input name="work_date" type="date" required defaultValue={today} className="block border rounded p-2 w-full" /></label>
    <label className="block">الحضور<select name="status" className="block border rounded p-2 w-full"><option value="present">حاضر (يوم)</option><option value="half_day">نصف يوم</option><option value="quarter_day">ربع يوم</option><option value="absent">غائب</option></select></label>
    <label className="block">نوع الإضافة<select name="extra_type" className="block border rounded p-2 w-full"><option value="amount">مبلغ بالجنيه</option><option value="day_fraction">جزء من اليومية</option></select></label>
    <label className="block">قيمة الإضافة<input name="extra_units" type="number" min="0" step="any" defaultValue="0" required className="block border rounded p-2 w-full" /></label>
    <p className="text-sm text-slate-600">مبلغ بالجنيه يُضاف مباشرة؛ جزء من اليومية مثل 0.5 يُضرب في اليومية الحالية وقت الحساب.</p>
    {state && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
    <button disabled={pending} className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-40">تسجيل اليومية</button>
  </form>;
}
