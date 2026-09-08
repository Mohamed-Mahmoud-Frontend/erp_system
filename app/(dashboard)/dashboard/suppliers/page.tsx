import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الموردين | نظام إدارة المصنع",
};

export default async function SuppliersPage() {
  const supabase = await createClient();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  const totalOwed = suppliers?.reduce((sum, s) => sum + Number(s.balance), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">حسابات الموردين</h1>
          <p className="text-slate-500 mt-1">إجمالي المستحقات للموردين: {totalOwed.toLocaleString()} ج.م</p>
        </div>
        <Link
          href="/dashboard/suppliers/new"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + إضافة مورد جديد
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">اسم المورد</th>
                <th className="px-6 py-4 font-semibold">الرصيد المستحق (له)</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد موردين حالياً
                  </td>
                </tr>
              ) : (
                suppliers?.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      {supplier.balance.toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Would link to supplier details or payment modal */}
                      <span className="text-sm text-slate-400">تحت التطوير</span>
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
