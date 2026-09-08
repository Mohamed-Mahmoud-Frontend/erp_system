import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "المخزون والمواد | نظام إدارة المصنع",
};

export default async function MaterialsPage() {
  const supabase = await createClient();

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .order("type", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">المخزون والمواد الخام</h1>
          <p className="text-slate-500 mt-1">
            إجمالي الأصناف: {materials?.length || 0}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/materials/movements/new"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            تسجيل حركة مخزون
          </Link>
          <Link
            href="/dashboard/materials/new"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + إضافة مادة جديدة
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">المادة</th>
                <th className="px-6 py-4 font-semibold">الرصيد الحالي</th>
                <th className="px-6 py-4 font-semibold">وحدة القياس</th>
                <th className="px-6 py-4 font-semibold">الحد الأدنى</th>
                <th className="px-6 py-4 font-semibold text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد مواد مضافة بعد
                  </td>
                </tr>
              ) : (
                materials?.map((material) => {
                  const isLowStock = material.stock_qty <= material.min_threshold;
                  
                  return (
                    <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{material.type}</td>
                      <td className={`px-6 py-4 font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                        {material.stock_qty}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{material.unit}</td>
                      <td className="px-6 py-4 text-slate-600">{material.min_threshold}</td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            منخفض
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            جيد
                          </span>
                        )}
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
