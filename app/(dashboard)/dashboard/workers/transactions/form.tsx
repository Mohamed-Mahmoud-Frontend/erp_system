"use client";
import { useActionState } from "react";
import { recordWorkerTransactionAction } from "../actions";
export default function WorkerTransactionForm({ workers }: { workers: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(recordWorkerTransactionAction, null);
  return <form action={action} aria-label="معاملة عامل" className="bg-white border rounded-xl p-6 space-y-4">
    <label className="block">العامل<select required name="worker_id" className="block border rounded p-2 w-full"><option value="">اختر العامل</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
    <label className="block">نوع المعاملة<select name="type" className="block border rounded p-2 w-full"><option value="advance">سلفة</option><option value="deduction">خصم</option><option value="bonus">مكافأة</option></select></label>
    <label className="block">المبلغ بالجنيه<input name="amount" type="number" required min="0.01" step="0.01" className="block border rounded p-2 w-full" /></label>
    <p className="text-sm text-slate-600">تسجل المعاملة بتاريخ ووقت الحفظ. صرف الأسبوع يسجل من شاشة الرواتب، ولا يُسجل كمعاملة هنا.</p>
    {state && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
    <button disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40">حفظ المعاملة</button>
  </form>;
}
