import Link from "next/link";
import { requirePermission } from "@/lib/access";
import { deliveryNumber } from "@/lib/delivery-notes";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "أذونات التسليم" };
export default async function DeliveryNotesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission(["sales", "production"]);
  const params = await searchParams;
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const db = await createClient();
  const { data, error, count } = await db.from("delivery_notes")
    .select("id,note_number,delivery_date,customer_name,recipient_name", { count: "exact" })
    .order("note_number", { ascending: false }).range((page - 1) * 30, page * 30 - 1);
  return <div className="space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3"><h1>أذونات التسليم</h1><Link className="bg-blue-700 text-white px-5 py-3 rounded-lg" href="/dashboard/delivery-notes/new">+ إذن تسليم جديد</Link></div>
    <p>سجل أذونات تسليم الأصناف المستقلة عن الفواتير، مع بيانات المستلم ونسخة قابلة للطباعة.</p>
    {error ? <p role="alert">تعذر تحميل أذونات التسليم. أعد المحاولة أو تواصل مع مسؤول النظام.</p> : <>
      {!data.length ? <div className="bg-white border rounded-xl p-8">لا توجد أذونات تسليم في هذه الصفحة.</div> : <div className="overflow-x-auto bg-white border rounded-xl"><table>
        <thead><tr><th>رقم الإذن</th><th>تاريخ التسليم</th><th>العميل / الجهة</th><th>المستلم</th><th>التفاصيل</th></tr></thead>
        <tbody>{data.map(note => <tr key={note.id}><td dir="ltr">{deliveryNumber(note.note_number)}</td><td>{note.delivery_date}</td><td>{note.customer_name}</td><td>{note.recipient_name}</td><td><Link className="text-blue-700 underline" href={"/dashboard/delivery-notes/" + note.id}>عرض وطباعة</Link></td></tr>)}</tbody>
      </table></div>}
      <nav aria-label="صفحات أذونات التسليم" className="flex gap-4 items-center">
        {page > 1 && <Link className="text-blue-700 underline" href={"/dashboard/delivery-notes?page=" + (page - 1)}>السابق</Link>}
        <span>صفحة {page} · {count ?? 0} إذن</span>
        {page * 30 < (count ?? 0) && <Link className="text-blue-700 underline" href={"/dashboard/delivery-notes?page=" + (page + 1)}>التالي</Link>}
      </nav>
    </>}
  </div>;
}
