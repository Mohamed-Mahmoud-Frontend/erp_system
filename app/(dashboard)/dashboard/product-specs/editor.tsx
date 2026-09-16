"use client";
import { useActionState, useState } from "react";
import { deleteSpecAction, saveSpecAction } from "./actions";
type Material = { id: string; type: string; unit: string };
type Initial = { id: string; name: string; active: boolean; product_spec_materials: { material_id: string; qty_per_unit: number }[] };
export default function SpecEditor({ materials, initial }: { materials: Material[]; initial?: Initial }) {
  const [state, action, pending] = useActionState(saveSpecAction, null);
  const [lines, setLines] = useState(initial?.product_spec_materials.map(line => ({ key: line.material_id, material_id: line.material_id, qty: String(line.qty_per_unit) })) ?? [{ key: "first", material_id: "", qty: "" }]);
  return <form action={action} aria-label="وصفة المنتج" className="bg-white border rounded-xl p-6 space-y-4">
    <h2 className="text-xl font-bold">{initial ? "تعديل الوصفة" : "وصفة جديدة"}</h2>
    <input type="hidden" name="id" value={initial?.id ?? ""} />
    <label className="block">اسم المنتج<input name="name" required defaultValue={initial?.name} className="border rounded p-2 w-full" placeholder="خزان 1000 لتر أبيض بيور" /></label>
    <label className="flex gap-2"><input type="checkbox" name="active" defaultChecked={initial?.active ?? true} />نشطة للاستخدام في أوردرات جديدة</label>
    <p className="text-sm text-slate-600">كميات الخامات التالية للوحدة الواحدة، بوحدة قياس كل خامة. تعديلها لا يغيّر الأوردرات المحفوظة سابقًا.</p>
    {lines.map((line, index) => <div key={line.key} className="flex flex-wrap items-end gap-3" data-recipe-line>
      <label className="flex-1">الخامة<select name="material_id" required value={line.material_id} onChange={e => setLines(lines.map((l,i) => i === index ? { ...l, material_id: e.target.value } : l))} className="block border rounded p-2 w-full"><option value="">اختر خامة</option>{materials.map(m => <option key={m.id} value={m.id}>{m.type} ({m.unit})</option>)}</select></label>
      <label>الكمية لكل وحدة<input name="qty_per_unit" type="number" min="0.000001" step="any" required value={line.qty} onChange={e => setLines(lines.map((l,i) => i === index ? { ...l, qty: e.target.value } : l))} className="block border rounded p-2" /></label>
      <button type="button" disabled={lines.length === 1} onClick={() => setLines(lines.filter((_,i) => i !== index))} className="p-2 text-red-700 disabled:opacity-40">حذف السطر</button>
    </div>)}
    <button type="button" className="text-blue-700 underline" onClick={() => setLines([...lines, { key: crypto.randomUUID(), material_id: "", qty: "" }])}>إضافة خامة</button>
    {state && <p role="alert" className="text-red-700">{state.message}</p>}
    <button disabled={pending || materials.length === 0} className="block bg-blue-600 text-white rounded px-5 py-2 disabled:opacity-40">{pending ? "جارٍ الحفظ…" : "حفظ الوصفة"}</button>
  </form>;
}
export function DeleteSpec({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteSpecAction, null);
  return <form action={action}><input type="hidden" name="id" value={id} /><button disabled={pending} className="text-red-700 underline">حذف الوصفة</button>{state && <p role="alert" className="text-red-700">{state.message}</p>}</form>;
}
