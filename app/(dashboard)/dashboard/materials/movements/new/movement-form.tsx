"use client";

import { useActionState, useState, useTransition } from "react";
import ArabicDatePicker from "../../../arabic-date-picker";
import { recordMovementAction } from "../../actions";

type Material = { id: string; type: string; unit: string; stock_qty: number };
type Supplier = { id: string; name: string };
export default function MovementForm({materials,suppliers,today}:{materials:Material[];suppliers:Supplier[];today:string}) {
 const [state,action]=useActionState(recordMovementAction,null);
 const [pending,start]=useTransition();
 const [direction,setDirection]=useState<"in"|"out">("in");
 const [materialId,setMaterialId]=useState("");
 const [supplierId,setSupplierId]=useState("");
 const [qty,setQty]=useState("");
 const [mode,setMode]=useState<"per_ton"|"total">("per_ton");
 const [price,setPrice]=useState("");
 const [date,setDate]=useState(today);
 const [isReturn,setIsReturn]=useState(false);
 const material=materials.find(item=>item.id===materialId);
 const quantity=Number(qty);
 const total=Number(price)*(mode==="total"?1:quantity/(material?.unit==="kg"?1000:1));
 const priced=direction==="in"&&!!supplierId&&!isReturn;
 return <form onSubmit={e=>{e.preventDefault();start(()=>action(new FormData(e.currentTarget)))}} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
  {state?.message&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{state.message}</p>}
  <div><p className="mb-2 font-bold">١. نوع الحركة</p><div className="grid grid-cols-2 gap-3">
   <label className={`cursor-pointer rounded-xl border p-4 text-center ${direction==="in"?"border-green-600 bg-green-50 font-bold":"border-slate-300"}`}><input className="sr-only" type="radio" name="direction" value="in" checked={direction==="in"} onChange={()=>setDirection("in")}/>وارد للمخزون</label>
   <label className={`cursor-pointer rounded-xl border p-4 text-center ${direction==="out"?"border-blue-600 bg-blue-50 font-bold":"border-slate-300"}`}><input className="sr-only" type="radio" name="direction" value="out" checked={direction==="out"} onChange={()=>setDirection("out")}/>صرف من المخزون</label>
  </div></div>
  <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-semibold">٢. الخامة</span><select name="material_id" required value={materialId} onChange={e=>setMaterialId(e.target.value)} className="w-full rounded-xl border border-slate-300 p-3"><option value="">اختر الخامة</option>{materials.map(m=><option key={m.id} value={m.id}>{m.type} — المتاح {m.stock_qty} {m.unit==="ton"?"طن":"كجم"}</option>)}</select></label>
   <label className="block"><span className="mb-2 block font-semibold">الكمية ({material?.unit==="ton"?"طن":"كجم"})</span><input type="number" name="qty" min="0.01" step="0.01" required value={qty} onChange={e=>setQty(e.target.value)} className="w-full rounded-xl border border-slate-300 p-3" placeholder="مثال: 5"/></label></div>
  {direction==="in"&&<><label className="block"><span className="mb-2 block font-semibold">٣. المورد</span><select name="supplier_id" value={supplierId} onChange={e=>setSupplierId(e.target.value)} className="w-full rounded-xl border border-slate-300 p-3"><option value="">مخزون افتتاحي بدون مورد</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_return" value="true" checked={isReturn} onChange={e=>setIsReturn(e.target.checked)}/>مرتجع من طلب تصنيع سابق (لا يزيد المخزون)</label>
   {priced&&<section className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4"><h2 className="font-bold text-blue-900">٤. تكلفة التوريد على حساب المورد</h2><p className="text-sm text-blue-800">تُسجّل الكمية والمبلغ المستحق في حساب المورد معًا.</p>
    <div className="grid grid-cols-2 gap-3"><label className="rounded-xl border bg-white p-3"><input type="radio" name="price_mode" value="per_ton" checked={mode==="per_ton"} onChange={()=>setMode("per_ton")}/> سعر الطن</label><label className="rounded-xl border bg-white p-3"><input type="radio" name="price_mode" value="total" checked={mode==="total"} onChange={()=>setMode("total")}/> الإجمالي مباشرة</label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block font-semibold">{mode==="per_ton"?"سعر الطن بالجنيه":"إجمالي المبلغ بالجنيه"}</span><input name="price" type="number" min="0.01" step="0.01" required value={price} onChange={e=>setPrice(e.target.value)} className="w-full rounded-xl border p-3" placeholder="0.00"/></label><label><span className="mb-2 block font-semibold">رقم الفاتورة أو المرجع (اختياري)</span><input name="reference" maxLength={100} className="w-full rounded-xl border p-3" placeholder="رقم مختلف لكل مورد"/></label></div>
    <ArabicDatePicker name="occurred_on" value={date} onChange={setDate} label="تاريخ التوريد"/><p className="rounded-xl bg-white p-4 text-lg font-bold">سيُضاف لحساب المورد: {Number.isFinite(total)&&total>0?total.toLocaleString("ar-EG",{minimumFractionDigits:2,maximumFractionDigits:2}):"0.00"} ج.م</p>
   </section>}</>}
  <button type="submit" disabled={pending} className="w-full rounded-xl bg-blue-700 px-6 py-3 font-bold text-white disabled:opacity-50">{pending?"جارٍ التسجيل...":"حفظ الحركة"}</button>
 </form>;
}