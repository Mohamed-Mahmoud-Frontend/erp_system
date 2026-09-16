"use client";
import { useActionState } from "react";
import { correctAction } from "./actions";
type Props = { id:string } & ({ kind:"wage"; wage:number } | { kind:"attendance"; status:string; extraType:string; extraUnits:number } | {kind:"payout" | "return"});
export default function CorrectionForm(props:Props) {
  const [state,action,pending] = useActionState(correctAction,undefined);
  return <form action={action} className="space-y-3 border rounded p-3" data-correction={props.kind}>
    <input type="hidden" name="kind" value={props.kind}/><input type="hidden" name="id" value={props.id}/>
    {props.kind === "wage" && <><label className="block">اليومية الجديدة بالجنيه<input className="block border rounded p-2" name="daily_wage" type="number" min="0" step="0.01" required defaultValue={props.wage}/></label><p>الصرف السابق يحتفظ باليومية المحفوظة. الأسابيع غير المصروفة تستخدم اليومية الجديدة.</p></>}
    {props.kind === "attendance" && <><label>الحالة<select className="border rounded p-2" name="status" defaultValue={props.status}><option value="present">حاضر</option><option value="half_day">نصف يوم</option><option value="quarter_day">ربع يوم</option><option value="absent">غائب</option></select></label><label>نوع الإضافة<select className="border rounded p-2" name="extra_type" defaultValue={props.extraType}><option value="amount">مبلغ بالجنيه</option><option value="day_fraction">جزء من اليومية الحالية</option></select></label><label>قيمة الإضافة<input className="border rounded p-2" name="extra_units" type="number" min="0" step="any" defaultValue={props.extraUnits} required/></label></>}
    {(props.kind === "payout" || props.kind === "return") && <><p>الإلغاء يستبعد المبلغ من الحساب ويحفظ الأصل في التاريخ. لا يمثل استردادًا نقديًا؛ راجع التسوية الفعلية قبل إعادة الصرف.</p><label className="block">سبب الإلغاء<input className="block border rounded p-2" name="reason" required maxLength={2000}/></label></>}
    {props.kind !== "attendance" && <label className="block"><input name="confirm" type="checkbox" value="yes" required/> أؤكد مراجعة هذا التصحيح</label>}
    {state?.message && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
    <button disabled={pending} className="border rounded bg-blue-700 text-white px-4 py-2">{pending ? "جارٍ الحفظ…" : props.kind === "payout" ? "إلغاء الصرف" : props.kind === "return" ? "إلغاء المرتجع" : "حفظ التصحيح"}</button>
  </form>;
}
