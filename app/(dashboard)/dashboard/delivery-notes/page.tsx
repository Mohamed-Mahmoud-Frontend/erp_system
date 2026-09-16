import Link from "next/link";
import { requirePermission } from "@/lib/access";
import { deliveryNumber } from "@/lib/delivery-notes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "أذونات التسليم | نظام إدارة المصنع",
};

export default async function DeliveryNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission(["sales", "production"]);
  const params = await searchParams;
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const db = await createClient();
  const { data, error, count } = await db
    .from("delivery_notes")
    .select("id,note_number,delivery_date,customer_name,recipient_name", { count: "exact" })
    .order("note_number", { ascending: false })
    .range((page - 1) * 30, page * 30 - 1);

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">أذونات التسليم والشحن</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            سجل أذونات تسليم الأصناف المستقلة عن الفواتير مع بيانات المستلم وطباعة الإذن
          </p>
        </div>
        <Link
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
          href="/dashboard/delivery-notes/new"
        >
          + إذن تسليم جديد
        </Link>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
          تعذر تحميل أذونات التسليم. أعد المحاولة أو تواصل مع مسؤول النظام.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden w-full max-w-full min-w-0">
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold">رقم الإذن</th>
                    <th className="px-6 py-4 font-bold">تاريخ التسليم</th>
                    <th className="px-6 py-4 font-bold">العميل / الجهة</th>
                    <th className="px-6 py-4 font-bold">المستلم</th>
                    <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!data || data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        لا توجد أذونات تسليم في هذه الصفحة.
                      </td>
                    </tr>
                  ) : (
                    data.map((note) => (
                      <tr key={note.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900" dir="ltr">
                          <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                            {deliveryNumber(note.note_number)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {note.delivery_date}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {note.customer_name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {note.recipient_name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                            href={`/dashboard/delivery-notes/${note.id}`}
                          >
                            عرض وطباعة 🖨️
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <nav aria-label="صفحات أذونات التسليم" className="flex justify-between items-center px-2">
            <span className="text-xs text-slate-500 font-medium">
              صفحة {page} · إجمالي {count ?? 0} إذن تسليم
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                  href={`/dashboard/delivery-notes?page=${page - 1}`}
                >
                  السابق
                </Link>
              )}
              {page * 30 < (count ?? 0) && (
                <Link
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                  href={`/dashboard/delivery-notes?page=${page + 1}`}
                >
                  التالي
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
