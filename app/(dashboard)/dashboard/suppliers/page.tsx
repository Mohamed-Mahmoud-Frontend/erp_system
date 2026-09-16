import { requirePermission } from "@/lib/access";
import Decimal from "decimal.js";
import {money} from "@/lib/billing";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الموردين | نظام إدارة المصنع",
};

export default async function SuppliersPage() {
  await requirePermission("suppliers");

  const supabase = await createClient();

  const { data: suppliers, error } = await supabase
    .from("supplier_balances")
    .select("*")
    .order("name", { ascending: true });

  const totalOwed = suppliers?.reduce((sum, s) => sum.plus(s.balance), new Decimal(0)) ?? new Decimal(0);

  if (error) return <p role="alert" className="p-6 text-red-700">تعذر تحميل البيانات. أعد المحاولة؛ لا يمكن الاعتماد على الملخص أو إتمام الإدخال حتى نجاح القراءة.</p>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">حسابات الموردين</h1>
          <p className="text-slate-500 mt-1">إجمالي المستحقات للموردين: {money(totalOwed)} ج.م</p>
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
                      {money(supplier.balance)} ج.م
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link className="underline text-blue-700" href={`/dashboard/suppliers/${supplier.id}`}>كشف الحساب / تسجيل معاملة</Link>
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
