import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "المخزون والمواد الخام | نظام إدارة المصنع",
};

export default async function MaterialsPage() {
  await requirePermission("production");

  const supabase = await createClient();

  const { data: materials, error } = await supabase
    .from("materials")
    .select("*")
    .order("type", { ascending: true });

  if (error) return <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">تعذر تحميل بيانات المواد الخام. أعد المحاولة.</p>;

  const materialList = materials || [];
  const lowStockCount = materialList.filter((m) => m.stock_qty <= m.min_threshold).length;
  const safeStockCount = materialList.length - lowStockCount;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">المخزون والمواد الخام</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            مراقبة أرصدة الخامات، حدود الأمان، وتسجيل حركات الإضافة والصرف
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/materials/movements/new"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            📦 تسجيل حركة مخزون
          </Link>
          <Link
            href="/dashboard/materials/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            + إضافة مادة جديدة
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">إجمالي أصناف المواد</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{materialList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-emerald-700">خامات في النطاق الآمن</p>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{safeStockCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-red-700">خامات تحت حد الطلب (حرجة)</p>
          <p className="text-xl font-black text-red-600 mt-1 font-mono">{lowStockCount}</p>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">اسم الخامة / المادة</th>
                <th className="px-6 py-4 font-bold text-center">الرصيد المتاح</th>
                <th className="px-6 py-4 font-bold text-center">وحدة القياس</th>
                <th className="px-6 py-4 font-bold text-center">الحد الأدنى الآمن</th>
                <th className="px-6 py-4 font-bold text-center">مؤشر المخزون</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات السريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    لا توجد مواد مضافة بعد في النظام
                  </td>
                </tr>
              ) : (
                materialList.map((material) => {
                  const isLowStock = material.stock_qty <= material.min_threshold;
                  
                  return (
                    <tr key={material.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            🏷️
                          </span>
                          <div>
                            <span className="block">{material.type}</span>
                            <span className="text-[11px] text-slate-400 font-mono" dir="ltr">#{material.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-mono font-black text-center text-base ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                        {Number(material.stock_qty).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs">
                          {material.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-slate-600 text-xs">
                        {Number(material.min_threshold).toLocaleString()} {material.unit}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                            ⚠️ تحت حد الطلب
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ متوفر وآمن
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href="/dashboard/materials/movements/new"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-xs"
                        >
                          تسجيل حركة ⇄
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
