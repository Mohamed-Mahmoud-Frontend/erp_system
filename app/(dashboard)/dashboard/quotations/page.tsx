import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "عروض الأسعار | نظام إدارة المصنع",
};

export default async function QuotationsPage() {
  const supabase = await createClient();

  const { data: quotations } = await supabase
    .from("quotations")
    .select("*, clients(name, phone)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">عروض الأسعار (الطلبات العامة)</h1>
          <p className="text-slate-500 mt-1">
            استعراض طلبات الأسعار الواردة من الموقع الخارجي أو المسجلة يدوياً
          </p>
        </div>
        <a
          href="/dashboard/quotations/whatsapp"
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>📱</span> محاكي الواتساب (AI)
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">التاريخ</th>
                <th className="px-6 py-4 font-semibold">مقدم الطلب</th>
                <th className="px-6 py-4 font-semibold">رقم الهاتف</th>
                <th className="px-6 py-4 font-semibold">التفاصيل</th>
                <th className="px-6 py-4 font-semibold text-center">الحالة</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    لا توجد عروض أسعار
                  </td>
                </tr>
              ) : (
                quotations?.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(q.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {q.guest_name || q.clients?.name || "عميل غير معروف"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm" dir="ltr">
                      {q.guest_phone || q.clients?.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate" title={q.details || ""}>
                      {q.details || "بدون تفاصيل"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        q.status === 'draft' ? 'bg-orange-100 text-orange-700' :
                        q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        q.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.status === 'draft' ? 'مسودة (طلب جديد)' :
                         q.status === 'sent' ? 'تم الإرسال' :
                         q.status === 'approved' ? 'موافق عليه' :
                         'مرفوض'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={`/quote/${q.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        📄 عرض الـ PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
