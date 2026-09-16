import {requirePermission} from '@/lib/access';
import {createClient} from '@/lib/supabase/server';
export default async function IntegrationsPage(){
 await requirePermission('admin');const db=await createClient();const result=await db.from('integration_status').select('*').order('name');
 if(result.error)return <p role="alert">تعذر قراءة حالة النسخ والمزامنة.</p>;
 const google=result.data.find(row=>row.name==='google_drive');
 return <div className="max-w-3xl mx-auto space-y-5"><h1 className="text-2xl font-bold">النسخ ومزامنة Google Drive</h1><p>ملف مستقل لكل جدول، يعرض الحالة الحالية بما فيها حالات الشيكات والإلغاءات. التعديل يتم داخل النظام؛ التعديلات اليدوية في الملفات لا ترجع لقاعدة البيانات.</p><div className="surface-card integration-card"><h2 className="font-bold">حالة الربط</h2>{google?.last_success?<p>آخر اتصال ناجح: {new Date(google.last_success).toLocaleString('ar-EG',{timeZone:'Africa/Cairo'})}</p>:<p role="alert">لم يُثبت اتصال ناجح بحساب Google بعد.</p>}{google?.last_error&&<p role="alert" className="text-red-700">آخر محاولة فشلت: {google.last_error}</p>}<p>تاريخ نجاح قديم لا يعني أن المزامنة تعمل الآن. المهمة تحتاج جهاز التشغيل والاتصال بالإنترنت.</p></div><p>ملفات Google Sheets نسخة للمتابعة وليست وحدها نسخة استعادة كاملة. التصدير المشفر لقاعدة البيانات مستقل، ويحتاج مفتاح الاسترجاع المحفوظ لدى المدير.</p></div>;
}
