import { cairoToday } from "@/lib/payroll";
import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MovementForm from "./movement-form";

export const metadata = {
  title: "تسجيل حركة مخزون | نظام إدارة المصنع",
};

export default async function NewMovementPage() {
  await requirePermission("production");

  const supabase = await createClient();

  const [{ data: materials, error: materialsError }, { data: suppliers, error: suppliersError }] = await Promise.all([
    supabase.from("materials").select("id, type, unit, stock_qty").order("type"),
    supabase.from("supplier_directory").select("id, name").order("name"),
  ]);

  if (materialsError || suppliersError) return <p role="alert" className="p-6 text-red-700">تعذر تحميل البيانات. أعد المحاولة؛ لا يمكن الاعتماد على الملخص أو إتمام الإدخال حتى نجاح القراءة.</p>;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">تسجيل حركة مخزون</h1>
          <p className="text-slate-500 mt-1">إضافة أو سحب كميات من المخزون</p>
        </div>
        <Link
          href="/dashboard/materials"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة للمخزون
        </Link>
      </div>

      <MovementForm materials={materials || []} suppliers={suppliers || []} today={cairoToday()} />
    </div>
  );
}
