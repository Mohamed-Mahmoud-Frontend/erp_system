import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "إدارة العملاء | نظام إدارة المصنع",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  await requirePermission("sales");

  const { q, type } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("clients").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  
  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data: clients, count, error } = await query;

  if (error) {
    return (
      <div className="p-6">
        <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          حدث خطأ في جلب بيانات العملاء: {error.message}
        </div>
      </div>
    );
  }

  const clientList = clients || [];
  const creditClientsCount = clientList.filter((c) => (c.credit_days || 0) > 0).length;
  const cashClientsCount = clientList.filter((c) => !c.credit_days || c.credit_days === 0).length;

  const typeLabels: Record<string, string> = {
    trader: "تاجر",
    contractor: "مقاول",
    individual: "فرد",
    company: "شركة",
    office: "مكتب",
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">سجل العملاء والشركاء</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            إدارة بيانات العملاء، فترات الائتمان، ومتابعة كشوف الحسابات وأوامر الشغل
          </p>
        </div>
        <Link 
          href="/dashboard/clients/new" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
        >
          + إضافة عميل جديد
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">إجمالي العملاء المسجلين</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{count ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-blue-700">عملاء بالآجل (فترة سماح)</p>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">{creditClientsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-emerald-700">عملاء الدفع النقدي الفوري</p>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{cashClientsCount}</p>
        </div>
      </div>

      {/* Table & Filters Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden w-full max-w-full min-w-0">
        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row gap-3">
          <form className="flex-1 flex flex-wrap gap-2">
            <input 
              type="text" 
              name="q" 
              defaultValue={q} 
              placeholder="🔍 بحث بالاسم أو جزء منه..." 
              className="flex-1 min-w-[140px] w-full sm:w-auto border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
            />
            <select 
              name="type" 
              defaultValue={type || "all"} 
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="all">كل التصنيفات</option>
              <option value="trader">تاجر</option>
              <option value="contractor">مقاول</option>
              <option value="company">شركة</option>
              <option value="office">مكتب</option>
              <option value="individual">فرد</option>
            </select>
            <button 
              type="submit"
              className="bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors shadow-xs"
            >
              بحث وتصفية
            </button>
            {(q || type) && (
              <Link 
                href="/dashboard/clients" 
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors flex items-center"
              >
                مسح التصفية
              </Link>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">اسم العميل</th>
                <th className="px-6 py-4 font-bold">التصنيف</th>
                <th className="px-6 py-4 font-bold">رقم الهاتف</th>
                <th className="px-6 py-4 font-bold">شروط الدفع والائتمان</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات السريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    لا يوجد عملاء مطابقين لمعايير البحث
                  </td>
                </tr>
              ) : (
                clientList.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200/50">
                          {client.name.charAt(0)}
                        </span>
                        <div>
                          <strong className="block text-slate-900 font-bold">{client.name}</strong>
                          <span className="text-[11px] text-slate-400 font-mono" dir="ltr">#{client.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {typeLabels[client.type] || client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-mono text-xs" dir="ltr">
                      {client.phone ? (
                        <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                          {client.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-sans">غير مسجل</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.credit_days > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          آجل ({client.credit_days} يوم)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          نقدي فوري ✓
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <Link 
                          href={`/dashboard/clients/${client.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                        >
                          كشف الحساب والطلبات
                        </Link>
                        <Link 
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                          title="تعديل بيانات العميل"
                        >
                          ✏️ تعديل
                        </Link>
                      </div>
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
