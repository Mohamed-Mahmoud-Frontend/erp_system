import { allowed, requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewOrderForm from "./new-order-form";

export const metadata = {
  title: "إضافة طلب جديد | نظام إدارة المصنع",
};

export default async function NewOrderPage() {
  const access=await requirePermission(["sales","production"]);

  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, phone, type, price_tier")
    .order("name");

  if (error) return <p role="alert" className="text-red-700">تعذر تحميل العملاء. أعد المحاولة.</p>;
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders" className="text-slate-500 hover:text-slate-800 transition-colors">
          &rarr; عودة للطلبات
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">إضافة طلب (أمر شغل) جديد</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Link href="/dashboard/orders/new/recipe" className="block mb-6 text-blue-700 underline">إنشاء أوردر بوصفة منتج واحتياجات خامات محسوبة</Link>
        <p className="mb-4 text-slate-600">النموذج التالي لأوردر مخصص بدون وصفة؛ الخامات تسجل يدويًا.</p>
        <NewOrderForm clients={clients || []} canCreateClient={allowed(access,"sales")} />
      </div>
    </div>
  );
}
