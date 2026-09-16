import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "العمال | نظام إدارة المصنع",
};

export default async function WorkersPage() {
  await requirePermission("payroll");

  const supabase = await createClient();

  const { data: workers, error } = await supabase
    .from("workers")
    .select("*")
    .order("name", { ascending: true });

  if (error) return <p role="alert" className="text-red-700">تعذر تحميل العمال. أعد المحاولة.</p>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة العمال</h1>
          <p className="text-slate-500 mt-1">
            إجمالي العمال: {workers?.length || 0}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/workers/attendance"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            تسجيل الحضور والانصراف
          </Link>
          <Link
            href="/dashboard/workers/payouts"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            الرواتب الأسبوعية
          </Link>
          <Link
            href="/dashboard/workers/new"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + إضافة عامل جديد
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">اسم العامل</th>
                <th className="px-6 py-4 font-semibold">الأجر اليومي</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workers?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد عمال مضافين بعد
                  </td>
                </tr>
              ) : (
                workers?.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900"><Link className="underline text-blue-700" href={`/dashboard/workers/${worker.id}`}>{worker.name} — تصحيح / تاريخ الصرف</Link></td>
                    <td className="px-6 py-4 text-slate-600">{worker.daily_wage.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-center">
                      <Link href="/dashboard/workers/transactions" className="text-blue-700 underline">تسجيل سلفة / خصم / مكافأة</Link>
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
