import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WorkersTable from "./workers-table";

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

  if (error) {
    return <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">تعذر تحميل العمال. أعد المحاولة.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة العمال وفريق العمل</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            متابعة العمال، اليوميات، الحضور والانصراف، وصرف الرواتب الأسبوعية
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard/workers/attendance"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            تسجيل الحضور
          </Link>
          <Link
            href="/dashboard/workers/payouts"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            الرواتب الأسبوعية
          </Link>
          <Link
            href="/dashboard/workers/new"
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            + إضافة عامل جديد
          </Link>
        </div>
      </div>

      {/* Workers Interactive Table */}
      <WorkersTable workers={workers || []} />
    </div>
  );
}
