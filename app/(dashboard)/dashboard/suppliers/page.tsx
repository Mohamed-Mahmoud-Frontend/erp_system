import { requirePermission } from "@/lib/access";
import Decimal from "decimal.js";
import { money } from "@/lib/billing";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الموردون والحسابات | نظام إدارة المصنع",
};

export default async function SuppliersPage() {
  await requirePermission("suppliers");

  const supabase = await createClient();

  const { data: suppliers, error } = await supabase
    .from("supplier_balances")
    .select("*")
    .order("name", { ascending: true });

  const supplierList = suppliers || [];
  const totalOwed = supplierList.reduce(
    (sum, s) => sum.plus(s.balance),
    new Decimal(0)
  );

  if (error) {
    return (
      <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
        تعذر تحميل بيانات الموردين. أعد المحاولة.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">سجل الموردين والمشتريات</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            متابعة أرصدة موردي الخامات وقطع الغيار وكشوف الحسابات والدفعات
          </p>
        </div>
        <Link
          href="/dashboard/suppliers/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
        >
          + إضافة مورد جديد
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">عدد الموردين المسجلين</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {supplierList.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-red-700">إجمالي المستحقات للموردين</p>
          <p className="text-xl font-black text-red-600 mt-1 font-mono">
            {money(totalOwed)} <span className="text-xs font-normal font-sans text-slate-500">ج.م</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">اسم المورد</th>
                <th className="px-6 py-4 font-bold">الرصيد المستحق (له)</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    لا يوجد موردين مسجلين حالياً
                  </td>
                </tr>
              ) : (
                supplierList.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                          🏢
                        </span>
                        <span>{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-red-600 text-base">
                      {money(supplier.balance)} <span className="text-xs font-normal font-sans text-slate-500">ج.م</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                        href={`/dashboard/suppliers/${supplier.id}`}
                      >
                        كشف الحساب / تسجيل معاملة 📄
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
