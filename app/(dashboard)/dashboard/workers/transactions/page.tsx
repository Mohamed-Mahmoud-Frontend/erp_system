import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WorkerTransactionForm from "./form";
export const metadata = { title: "السلف والمكافآت والخصومات" };
export default async function WorkerTransactionsPage() {
  await requirePermission("payroll");

  const supabase = await createClient();
  const { data, error } = await supabase.from("workers").select("id,name").order("name");
  return <div className="max-w-3xl mx-auto space-y-6"><h1 className="text-2xl font-bold">السلف والمكافآت والخصومات</h1><Link className="text-blue-700 underline" href="/dashboard/workers/payouts">كشف الرواتب الأسبوعية</Link>
    {error ? <p role="alert" className="text-red-700">تعذر تحميل العمال.</p> : <WorkerTransactionForm workers={data} />}
  </div>;
}
