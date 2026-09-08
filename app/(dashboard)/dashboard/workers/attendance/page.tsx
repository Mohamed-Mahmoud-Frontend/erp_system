import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AttendanceForm from "./attendance-form";

export const metadata = {
  title: "تسجيل الحضور | نظام إدارة المصنع",
};

export default async function AttendancePage() {
  const supabase = await createClient();

  const { data: workers } = await supabase
    .from("workers")
    .select("id, name")
    .order("name", { ascending: true });

  // Get today's attendance to show a quick summary
  const today = new Date().toISOString().split("T")[0];
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*, workers(name)")
    .eq("work_date", today);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">تسجيل الحضور والانصراف</h1>
          <p className="text-slate-500 mt-1">تسجيل يوميات العمال والإنتاج الإضافي</p>
        </div>
        <Link
          href="/dashboard/workers"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة للعمال
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceForm workers={workers || []} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800">سجل اليوم ({new Date().toLocaleDateString("ar-EG")})</h2>
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {(!todayAttendance || todayAttendance.length === 0) ? (
              <div className="p-8 text-center text-slate-500">
                لم يتم تسجيل حضور أي عامل اليوم.
              </div>
            ) : (
              todayAttendance.map((record: { id: string, workers: { name: string } | null, extra_units: number, status: string }) => (
                <div key={record.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900">{record.workers?.name}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      إنتاج إضافي: <span className="font-medium text-slate-700">{record.extra_units} خزان</span>
                    </div>
                  </div>
                  <div>
                    {record.status === "present" ? (
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">حاضر</span>
                    ) : record.status === "half_day" ? (
                      <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm font-medium">نصف يوم</span>
                    ) : (
                      <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">غائب</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
