"use client";
import { useActionState, useState } from "react";
import Decimal from "decimal.js";
import { createRecipeOrderAction } from "../../manufacturing-actions";
import type { RecipeOption } from "@/lib/manufacturing";
export default function RecipeOrderForm({ clients, specs }: { clients: { id: string; name: string }[]; specs: RecipeOption[] }) {
  const [state, action, pending] = useActionState(createRecipeOrderAction, null);
  const [specId, setSpecId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const spec = specs.find(s => s.id === specId);
  return <form action={action} aria-label="أوردر بوصفة" className="bg-white border rounded-xl p-6 space-y-4">
    <label className="block">العميل<select name="client_id" required className="border rounded p-2 block w-full"><option value="">اختر العميل</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className="block">وصفة المنتج<select name="product_spec_id" required value={specId} onChange={e => setSpecId(e.target.value)} className="border rounded p-2 block w-full"><option value="">اختر الوصفة</option>{specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label className="block">عدد الوحدات<input type="number" name="quantity" required min="1" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="border rounded p-2 block" /></label>
    <p className="text-sm text-slate-600">اترك التجاوز فارغًا لاستخدام الوصفة. التجاوز هو إجمالي الخامة للأوردر كله. الحفظ لا يخصم المخزون؛ الخصم عند بدء التصنيع.</p>
    <div key={specId}>{spec?.product_spec_materials.map(line => <div key={line.material_id} className="border-t py-3" data-material-id={line.material_id}>
      <p>{line.materials.type} ({line.materials.unit}) — لكل وحدة: {line.qty_per_unit}</p>
      <p data-testid="default-requirement">الإجمالي الافتراضي: {new Decimal(line.qty_per_unit).times(Number(quantity) || 0).toString()}</p>
      <label>تجاوز الإجمالي لهذا الأوردر<input type="number" min="0" step="any" name={`override:${line.material_id}`} className="border rounded p-2 block" /></label>
    </div>)}</div>
    {state && <p role="alert" className="text-red-700">{state.message}</p>}
    <button disabled={pending} className="bg-blue-600 text-white rounded px-5 py-2 disabled:opacity-50">حفظ أوردر الوصفة</button>
  </form>;
}
