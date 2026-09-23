import { allowed, getAccess, requirePermission } from "@/lib/access";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { payrollWeek } from "@/lib/payroll";
import { money } from "@/lib/billing";
import Decimal from "decimal.js";
import CorrectionForm from "../../corrections/form";
export default async function WorkerDetails({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{week?:string;txPage?:string}>}) {
  await requirePermission("payroll");

  const access=await getAccess();
  const {id}=await params;
  const query=await searchParams; const txPage=Number(query.txPage??"1");
  if(!Number.isSafeInteger(txPage)||txPage<1)return <p role="alert">صفحة المعاملات غير صالحة.</p>;
  let week;
  try { week=payrollWeek(query.week); } catch { return <p role="alert">تاريخ الأسبوع غير صالح.</p>; }
  const db=await createClient();
  const {data:worker,error}=await db.from("workers").select("*").eq("id",id).maybeSingle();
  if(error) return <p role="alert">تعذر تحميل العامل.</p>;
  if(!worker) notFound();
  const [attendance,payouts,transactions,weekBalance]=await Promise.all([
    db.from("attendance").select("*").eq("worker_id",id).gte("work_date",week.start).lte("work_date",week.end).order("work_date"),
    db.from("worker_payouts").select("*").eq("worker_id",id).eq("week_start",week.start).order("paid_at"),
    db.from("worker_transactions").select("id,type,amount,created_at",{count:"exact"}).eq("worker_id",id).order("created_at",{ascending:false}).range((txPage-1)*50,txPage*50-1),
    db.rpc("calculate_worker_week",{p_worker_id:id,p_week_start:week.start}),
  ]);
  if(attendance.error || payouts.error || transactions.error || weekBalance.error) return <p role="alert">تعذر تحميل الحضور أو تاريخ الصرف؛ التصحيح غير متاح حتى نجاح القراءة.</p>;
  const paid=payouts.data.some(row=>!row.voided_at);
  const net=weekBalance.data?.[0]?.net_amount??0;
  return <div className="max-w-5xl mx-auto space-y-6"><h1 className="text-2xl font-bold">تصحيح بيانات العامل: {worker.name}</h1><Link className="underline text-blue-700" href="/dashboard/workers">العمال</Link>
    <section><h2 className="text-xl font-bold">تعديل اليومية: {money(worker.daily_wage)} ج.م</h2>{allowed(access,"admin") && <CorrectionForm kind="wage" id={id} wage={worker.daily_wage}/>}</section>
    <form><label>يوم داخل الأسبوع<input type="date" name="week" defaultValue={week.end} className="border p-2"/></label><button className="border p-2">عرض</button></form><p>من {week.start} إلى {week.end}</p>
    <section className={`rounded-xl border p-5 ${new Decimal(net).isNegative()?"border-red-300 bg-red-50":"bg-white"}`}><h2 className="font-bold">حساب الأسبوع</h2><p className="text-2xl font-bold">الصافي: {money(net)} ج.م</p>{new Decimal(net).isNegative()&&<p role="alert" className="font-bold text-red-800">العامل عليه {money(new Decimal(net).abs())} ج.م؛ السلفة أو الخصم تجاوز رصيد الأسبوع.</p>}</section>
    <section className="space-y-3"><h2 className="text-xl font-bold">السلف والمكافآت والخصومات — السجل الكامل</h2>{transactions.data.length===0&&<p>لا توجد معاملات في هذه الصفحة.</p>}<div className="divide-y rounded-xl border bg-white">{transactions.data.map(row=><div key={row.id} className="flex flex-wrap justify-between gap-3 p-3"><span>{row.type==='advance'?'سلفة':row.type==='bonus'?'مكافأة':'خصم'} — {new Date(row.created_at).toLocaleString('ar-EG',{timeZone:'Africa/Cairo'})}</span><strong className={row.type==='bonus'?'text-green-700':'text-red-700'}>{row.type==='bonus'?'+':'−'} {money(row.amount)} ج.م</strong></div>)}</div><div className="flex gap-4">{txPage>1&&<Link className="underline" href={`?week=${week.end}&txPage=${txPage-1}`}>السابق</Link>}{(transactions.count??0)>txPage*50&&<Link className="underline" href={`?week=${week.end}&txPage=${txPage+1}`}>التالي</Link>}</div></section>    <section className="space-y-3"><h2 className="text-xl font-bold">الحضور المحفوظ</h2>{paid && <p>الأسبوع مصروف: ألغ الصرف أدناه قبل تعديل الحضور.</p>}{attendance.data.length===0 && <p>لا يوجد حضور مسجل في هذا الأسبوع.</p>}{attendance.data.map(row=>{const statusAr:Record<string,string>={present:'حاضر',half_day:'نصف يوم',quarter_day:'ربع يوم',absent:'غائب'};return <article key={row.id} className="border rounded p-3"><h3>{row.work_date}</h3>{paid ? <p>{statusAr[row.status]??row.status} — إضافة {row.extra_units} {row.extra_type === "amount" ? "جنيه" : "من اليومية"}</p> : <CorrectionForm kind="attendance" id={row.id} status={row.status} extraType={row.extra_type} extraUnits={row.extra_units}/>}</article>;})}</section>
    <section className="space-y-3"><h2 className="text-xl font-bold">تاريخ الصرف — السجلات الأصلية والإلغاءات</h2>{payouts.data.length===0 && <p>لم يُصرف هذا الأسبوع.</p>}{payouts.data.length>=1000 && <p role="alert">التاريخ كبير؛ المعروض أول 1000 سجل فقط. اطلب استخراجًا كاملًا للمراجعة.</p>}{payouts.data.map(row=><article key={row.id} data-payout-id={row.id} className="border rounded p-4 space-y-2"><p>الصافي {money(row.net_amount)} ج.م — اليومية المحفوظة {money(row.daily_wage)} — الأيام {row.days_present}</p><p>إضافات حضور {money(row.attendance_bonus)} + مكافآت {money(row.transaction_bonus)} − سلف {money(row.advances)} − خصومات {money(row.deductions)}</p><p>صُرف: {new Date(row.paid_at).toLocaleString("ar-EG",{timeZone:"Africa/Cairo"})}</p>{row.voided_at ? <p className="text-red-700">ملغى: {row.voided_reason} — {new Date(row.voided_at).toLocaleString("ar-EG",{timeZone:"Africa/Cairo"})}</p> : allowed(access,"admin") ? <CorrectionForm kind="payout" id={row.id}/> : <p>إلغاء الصرف متاح للمدير.</p>}</article>)}</section>
    <Link className="underline text-blue-700" href={`/dashboard/workers/payouts?week=${week.end}`}>مراجعة الحساب وصرف الأسبوع</Link>
  </div>;
}
