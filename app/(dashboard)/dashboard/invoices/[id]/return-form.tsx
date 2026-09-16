"use client";
import { useActionState } from "react";
import { recordReturnAction } from "./return-actions";
export default function ReturnForm({ invoiceId, maxAmount }: { invoiceId: string; maxAmount: number }) {
  const [state, action, pending] = useActionState(recordReturnAction, null);
  if (maxAmount <= 0) return <p className="p-4 bg-slate-50">تم تسجيل مرتجعات بكامل قيمة الفاتورة.</p>;
  return <details className="rounded-xl border bg-white p-6"><summary className="cursor-pointer font-bold text-blue-700">تسجيل مرتجع بيع</summary>
    <form action={action} className="space-y-4 pt-4" aria-label="تسجيل مرتجع بيع">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <label className="block">قيمة المرتجع (ج.م)<input className="block w-full border rounded p-2" name="amount" type="number" required min="0.01" step="0.01" max={maxAmount} /></label>
      <label className="block">حالة / سبب المرتجع<input className="block w-full border rounded p-2" name="condition" required placeholder="مثال: معطوب / اسكراب" /></label>
      <label className="block">ملاحظة (اختياري)<textarea className="block w-full border rounded p-2" name="note" /></label>
      {state && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
      <button disabled={pending} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50">{pending ? "جارٍ التسجيل…" : "حفظ المرتجع"}</button>
    </form></details>;
}
