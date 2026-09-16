"use client";
import { useActionState, useState } from "react";
import { createDeliveryNote } from "../actions";
export default function DeliveryForm({ id, today }: { id: string; today: string }) {
  const [state, action, pending] = useActionState(createDeliveryNote, {});
  const [items, setItems] = useState([{ key: 0, description: "", quantity: "1", unit: "قطعة" }]);
  const [nextKey, setNextKey] = useState(1);
  const [fields, setFields] = useState({customer_name: "", recipient_name: "", recipient_phone: "", delivery_address: "", driver_name: "", vehicle_number: "", notes: "", delivery_date: today});
  function update(key: number, field: "description" | "quantity" | "unit", value: string) {
    setItems(current => current.map(item => item.key === key ? { ...item, [field]: value } : item));
  }
  return <form action={action} className="space-y-6">
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="items" value={JSON.stringify(items.map(({ description, quantity, unit }) => ({ description, quantity, unit })))} />
    {state.error && <p role="alert">{state.error}</p>}
    <fieldset disabled={pending} className="bg-white border rounded-xl p-6 space-y-5">
      <legend className="font-bold px-2">بيانات التسليم</legend>
      <div className="grid sm:grid-cols-2 gap-4">
        <label>العميل / جهة التسليم *<input className="block w-full mt-2" name="customer_name" value={fields.customer_name} onChange={e => setFields(current => ({ ...current, customer_name: e.target.value }))} required maxLength={200} /></label>
        <label>تاريخ التسليم *<input className="block w-full mt-2" type="date" name="delivery_date" value={fields.delivery_date} onChange={e => setFields(current => ({ ...current, delivery_date: e.target.value }))} required min="0001-01-01" max="9999-12-31" /></label>
        <label>اسم المستلم *<input className="block w-full mt-2" name="recipient_name" value={fields.recipient_name} onChange={e => setFields(current => ({ ...current, recipient_name: e.target.value }))} required maxLength={200} /></label>
        <label>هاتف المستلم<input className="block w-full mt-2" type="tel" name="recipient_phone" value={fields.recipient_phone} onChange={e => setFields(current => ({ ...current, recipient_phone: e.target.value }))} maxLength={40} /></label>
        <label className="sm:col-span-2">عنوان التسليم<input className="block w-full mt-2" name="delivery_address" value={fields.delivery_address} onChange={e => setFields(current => ({ ...current, delivery_address: e.target.value }))} maxLength={500} /></label>
        <label>اسم السائق<input className="block w-full mt-2" name="driver_name" value={fields.driver_name} onChange={e => setFields(current => ({ ...current, driver_name: e.target.value }))} maxLength={200} /></label>
        <label>رقم السيارة<input className="block w-full mt-2" name="vehicle_number" value={fields.vehicle_number} onChange={e => setFields(current => ({ ...current, vehicle_number: e.target.value }))} maxLength={80} /></label>
      </div>
    </fieldset>
    <fieldset disabled={pending} className="bg-white border rounded-xl p-6 space-y-4">
      <legend className="font-bold px-2">الأصناف والكميات</legend>
      {items.map((item, index) => <div key={item.key} className="grid sm:grid-cols-[1fr_120px_120px_auto] gap-3 border-b pb-4 items-end">
        <label>الصنف {index + 1} *<textarea className="block w-full mt-2" required maxLength={500} value={item.description} onChange={e => update(item.key, "description", e.target.value)} /></label>
        <label>الكمية *<input className="block w-full mt-2" type="number" inputMode="decimal" min="0.001" max="1000000" step="0.001" required value={item.quantity} onChange={e => update(item.key, "quantity", e.target.value)} /></label>
        <label>الوحدة *<input className="block w-full mt-2" required maxLength={40} value={item.unit} onChange={e => update(item.key, "unit", e.target.value)} /></label>
        <button type="button" className="text-red-700 border border-red-200" disabled={items.length === 1} aria-label={"حذف الصنف " + (index + 1)} onClick={() => setItems(current => current.filter(row => row.key !== item.key))}>حذف</button>
      </div>)}
      <button type="button" className="text-blue-700 border" disabled={items.length >= 100} onClick={() => { setItems(current => [...current, { key: nextKey, description: "", quantity: "1", unit: "قطعة" }]); setNextKey(current => current + 1); }}>+ إضافة صنف</button>
      <label className="block">ملاحظات<textarea className="block w-full mt-2" rows={3} name="notes" value={fields.notes} onChange={e => setFields(current => ({ ...current, notes: e.target.value }))} maxLength={2000} /></label>
    </fieldset>
    <p className="text-sm text-slate-600">راجع البيانات قبل الحفظ؛ الإذن المحفوظ مستند ثابت يمكن الرجوع إليه وإعادة طباعته.</p>
    <button type="submit" disabled={pending} className="bg-blue-700 text-white px-6 py-3">{pending ? "جارٍ الحفظ…" : "حفظ إذن التسليم"}</button>
  </form>;
}
