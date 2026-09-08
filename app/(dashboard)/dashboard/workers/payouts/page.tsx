import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الرواتب الأسبوعية | نظام إدارة المصنع",
};

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const supabase = await createClient();

  // Determine date range (default: last 7 days ending on Thursday, but simple approach is last 7 days)
  const today = new Date();
  const endDate = searchParams.week ? new Date(searchParams.week) : today;
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Fetch workers
  const { data: workers } = await supabase.from("workers").select("*");

  // Fetch attendance in range
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .gte("work_date", startStr)
    .lte("work_date", endStr);

  // Fetch transactions in range
  const { data: transactions } = await supabase
    .from("worker_transactions")
    .select("*")
    .gte("created_at", startStr)
    .lte("created_at", endStr + "T23:59:59.999Z");

  const payouts = workers?.map((worker) => {
    const workerAttendance = attendance?.filter((a) => a.worker_id === worker.id) || [];
    const workerTransactions = transactions?.filter((t) => t.worker_id === worker.id) || [];

    const presentDays = workerAttendance.filter((a) => a.status === "present").length;
    const halfDays = workerAttendance.filter((a) => a.status === "half_day").length;
    
    // Total days equivalent
    const totalDaysWorked = presentDays + (halfDays * 0.5);
    const baseWage = totalDaysWorked * worker.daily_wage;

    const totalBonus = workerTransactions
      .filter((t) => t.type === "bonus")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDeductions = workerTransactions
      .filter((t) => t.type === "deduction")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netPayout = baseWage + totalBonus - totalDeductions;

    return {
      worker,
      presentDays,
      halfDays,
      baseWage,
      totalBonus,
      totalDeductions,
      netPayout,
    };
  });

  const totalWeeklyPayroll = payouts?.reduce((sum, p) => sum + p.netPayout, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الرواتب الأسبوعية</h1>
          <p className="text-slate-500 mt-1">
            الفترة من {startStr} إلى {endStr}
          </p>
        </div>
        <Link
          href="/dashboard/workers"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة للعمال
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">إجمالي المطلوب دفعه: <span className="text-blue-600 text-2xl">{totalWeeklyPayroll.toLocaleString()} ج.م</span></h2>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            دفع الكل (Pay All)
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">اسم العامل</th>
                <th className="px-6 py-4 font-semibold text-center">أيام الحضور</th>
                <th className="px-6 py-4 font-semibold text-center">الأجر الأساسي</th>
                <th className="px-6 py-4 font-semibold text-center text-green-600">الحوافز (+)</th>
                <th className="px-6 py-4 font-semibold text-center text-red-600">الخصومات (-)</th>
                <th className="px-6 py-4 font-semibold text-center text-blue-700">الصافي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد عمال
                  </td>
                </tr>
              ) : (
                payouts?.map((p) => (
                  <tr key={p.worker.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.worker.name}</td>
                    <td className="px-6 py-4 text-center">
                      {p.presentDays + (p.halfDays * 0.5)} يوم
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {p.baseWage.toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-medium">
                      {p.totalBonus > 0 ? `+${p.totalBonus.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-red-600 font-medium">
                      {p.totalDeductions > 0 ? `-${p.totalDeductions.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-blue-700 text-lg bg-blue-50/30">
                      {p.netPayout.toLocaleString()} ج.م
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
