import Link from 'next/link';
import {z} from 'zod';
import {requirePermission,allowed,getAccess} from '@/lib/access';
import {createClient} from '@/lib/supabase/server';
import {cairoToday} from '@/lib/payroll';
import AttendanceForm from './attendance-form';
import CorrectionForm from '../../corrections/form';
export default async function AttendancePage({searchParams}:{searchParams:Promise<{date?:string}>}){
 await requirePermission(['attendance','payroll']);const access=await getAccess();const chosen=(await searchParams).date??cairoToday();if(!z.iso.date().safeParse(chosen).success)return <p role="alert">تاريخ غير صالح.</p>;
 const db=await createClient();const [workers,attendance]=await Promise.all([db.from('worker_directory').select('id,name').order('name'),db.from('attendance_status').select('*').eq('work_date',chosen)]);
 const labels:Record<string,string>={present:'حاضر',half_day:'نصف يوم',quarter_day:'ربع يوم',absent:'غائب'};
 return <div className="max-w-5xl mx-auto space-y-6"><h1 className="text-2xl font-bold">الحضور وتصحيح اليومية</h1>{allowed(access,'payroll')&&<Link href="/dashboard/workers/payouts" className="underline text-blue-700">الرواتب</Link>}<form><input type="date" name="date" defaultValue={chosen} className="border p-2"/><button className="border p-2">عرض التاريخ</button></form><div className="grid lg:grid-cols-2 gap-6">{workers.error?<p role="alert">تعذر تحميل العمال.</p>:<AttendanceForm workers={workers.data} today={chosen}/>}<section className="space-y-3"><h2 className="font-bold">حضور {chosen}</h2>{attendance.error?<p role="alert">تعذر تحميل الحضور.</p>:attendance.data.length===0?<p>لا يوجد حضور مسجل.</p>:attendance.data.map(row=><article className="border rounded bg-white p-3" key={row.id}><h3>{row.worker_name} — {labels[row.status]}</h3><p>إضافة {row.extra_units} {row.extra_type==='amount'?'جنيه':'من اليومية'}</p>{row.week_paid?<p>الأسبوع مصروف؛ يتطلب تصحيحه إلغاء الصرف بواسطة المدير أولًا.</p>:<CorrectionForm kind="attendance" id={row.id} status={row.status} extraType={row.extra_type} extraUnits={row.extra_units}/>}</article>)}</section></div></div>;
}
