import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "العملاء | نظام إدارة المصنع",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
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
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">حدث خطأ في جلب بيانات العملاء: {error.message}</div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    trader: "تاجر",
    contractor: "مقاول",
    individual: "فرد",
    company: "شركة",
    office: "مكتب",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة العملاء</h1>
          <p className="text-sm text-slate-500 mt-1">إجمالي العملاء: {count}</p>
        </div>
        <Link 
          href="/dashboard/clients/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + إضافة عميل جديد
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <form className="flex-1 flex gap-2">
            <input 
              type="text" 
              name="q" 
              defaultValue={q} 
              placeholder="بحث بالاسم..." 
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              name="type" 
              defaultValue={type || "all"} 
              className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">كل الأنواع</option>
              <option value="trader">تاجر</option>
              <option value="contractor">مقاول</option>
              <option value="company">شركة</option>
              <option value="office">مكتب</option>
              <option value="individual">فرد</option>
            </select>
            <button 
              type="submit"
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              تصفية
            </button>
            {(q || type) && (
              <Link 
                href="/dashboard/clients" 
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors flex items-center"
              >
                مسح
              </Link>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">الاسم</th>
                <th className="px-6 py-4 font-semibold">النوع</th>
                <th className="px-6 py-4 font-semibold">الهاتف</th>
                <th className="px-6 py-4 font-semibold">فترة الائتمان</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد عملاء مطاقين للبحث
                  </td>
                </tr>
              ) : (
                clients?.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeLabels[client.type] || client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600" dir="ltr">{client.phone || "-"}</td>
                    <td className="px-6 py-4 text-slate-600">{client.credit_days > 0 ? `${client.credit_days} يوم` : "نقدي"}</td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/dashboard/clients/${client.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        عرض التفاصيل
                      </Link>
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
