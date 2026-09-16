"use client";
import { useActionState } from "react";
import { changeOrderStatusAction } from "../manufacturing-actions";
import type { Requirement } from "@/lib/manufacturing";
export default function OrderStatusForm({ id, status, requirements, overrides }: { id: string; status: string; requirements: Requirement[]; overrides: Record<string,string> }) {
  const [state, action, pending] = useActionState(changeOrderStatusAction, null);
  const next = status === "pending" ? "in_production" : status === "in_production" ? "completed" : status === "completed" ? "delivered" : null;
  return <form action={action} aria-label="حالة التصنيع" className="bg-white border rounded-xl p-6 space-y-4"><input type="hidden" name="id" value={id} />
    <h2 className="font-bold text-lg">الخامات والتصنيع</h2>
    {requirements.length === 0 && <p>أوردر مخصص بدون وصفة: تسجّل الخامات يدويًا من شاشة حركات المخزون. تغيير الحالة لا يخصم خامات تلقائيًا.</p>}
    {requirements.map(line => <div key={line.material_id} data-material-id={line.material_id} className="border-t py-3">
      <p>{line.name} ({line.unit}) — افتراضي الأوردر: {line.default_qty} — المعتمد: {overrides[line.material_id] ?? line.default_qty}</p>
      {status === "pending" && <label>تجاوز إجمالي هذا الأوردر<input type="number" name={`override:${line.material_id}`} min="0" step="any" defaultValue={overrides[line.material_id] ?? ""} className="border rounded p-2 block" /></label>}
    </div>)}
    {status === "pending" && requirements.length > 0 && <p className="text-sm text-slate-600">اترك التجاوز فارغًا لاستخدام الافتراضي المحفوظ. الكمية صفر تتخطى هذا السطر. لا تتغير الوصفة الأصلية.</p>}
    {state && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
    {next && <button name="status" value={next} disabled={pending} className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-40">{next === "in_production" ? "بدء التصنيع" : next === "completed" ? "إتمام التصنيع" : "تأكيد التسليم"}</button>}
    {status === "pending" && <button name="status" value="cancelled" disabled={pending} className="text-red-700 px-4 py-2">إلغاء الأوردر</button>}
  </form>;
}
