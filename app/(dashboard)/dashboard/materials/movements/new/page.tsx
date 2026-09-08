import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MovementForm from "./movement-form";

export const metadata = {
  title: "تسجيل حركة مخزون | نظام إدارة المصنع",
};

export default async function NewMovementPage() {
  const supabase = await createClient();

  const [{ data: materials }, { data: suppliers }] = await Promise.all([
    supabase.from("materials").select("id, type, unit, stock_qty").order("type"),
    supabase.from("suppliers").select("id, name").order("name"),
  ]);

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

      <MovementForm materials={materials || []} suppliers={suppliers || []} />
    </div>
  );
}
