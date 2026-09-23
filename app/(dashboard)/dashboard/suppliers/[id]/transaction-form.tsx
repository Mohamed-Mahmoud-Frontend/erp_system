"use client";
import {useActionState,useState} from "react";
import ArabicDatePicker from "../../arabic-date-picker";
import {recordSupplierTransactionAction} from "../actions";
export default function TransactionForm({id,today}:{id:string;today:string}){
 const [state,action,pending]=useActionState(recordSupplierTransactionAction,undefined);
 const [date,setDate]=useState(today);
 return <form action={action} className="space-y-4 rounded-xl border bg-white p-5"><input type="hidden" name="supplier_id" value={id}/><h2 className="text-lg font-bold">إضافة معاملة مورد</h2>
  <div className="grid gap-4 sm:grid-cols-3"><label>المعاملة<select name="type" className="mt-1 w-full rounded border p-2"><option value="invoice">فاتورة توريد — تزيد المستحق</option><option value="payment">سداد للمورد — يقلل المستحق</option></select></label><label>المبلغ بالجنيه<input name="amount" type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded border p-2"/></label><ArabicDatePicker name="occurred_on" value={date} onChange={setDate} label="تاريخ المعاملة"/></div>
  <label className="block">رقم الفاتورة أو المرجع<input name="reference" maxLength={100} className="mt-1 w-full rounded border p-2" placeholder="مثال: فاتورة 123"/></label><label className="block">تفاصيل الأصناف أو سبب السداد<textarea name="description" maxLength={2000} rows={3} className="mt-1 w-full rounded border p-2" placeholder="مثال: خامة بولي إيثيلين 500 كجم"/></label>
  {state?.message&&<p role={state.success?"status":"alert"} className={state.success?"text-green-700":"text-red-700"}>{state.message}</p>}<button disabled={pending} className="rounded bg-blue-700 px-5 py-2 text-white disabled:opacity-40">{pending?"جارٍ الحفظ…":"حفظ المعاملة"}</button>
 </form>;
}