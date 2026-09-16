import { requirePermission } from "@/lib/access";
import ClientStatement from "./statement";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { statusLabels } from "@/lib/manufacturing";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("sales");

  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return <p role="alert" className="p-6 text-red-700">تعذر تحميل بيانات العميل. أعد المحاولة.</p>;
  if (!client) {
    notFound();
  }

  // Fetch recent orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const typeLabels: Record<string, string> = {
    trader: "تاجر",
    contractor: "مقاول",
    individual: "فرد",
    company: "شركة",
    office: "مكتب",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients" className="text-slate-500 hover:text-slate-800 transition-colors">
            &rarr; عودة للعملاء
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {typeLabels[client.type] || client.type}
          </span>
        </div>
        <Link 
          href={`/dashboard/clients/${client.id}/edit`}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          تعديل البيانات
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">بيانات العميل</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500 mb-1">الهاتف</p>
              <p className="font-medium text-slate-900" dir="ltr">{client.phone || "غير مسجل"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">العنوان</p>
              <p className="font-medium text-slate-900">{client.address || "غير مسجل"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">شريحة الأسعار</p>
              <p className="font-medium text-slate-900">{client.price_tier || "الافتراضية"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">فترة الائتمان</p>
              <p className="font-medium text-slate-900">{client.credit_days > 0 ? `${client.credit_days} يوم` : "نقدي"}</p>
            </div>
          </div>
        </div>

        {/* Balance & Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 space-y-4">
           <ClientStatement clientId={id} />
        </div>
      </div>

      {/* Orders History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">أحدث الطلبات</h2>
        </div>
        <div className="overflow-x-auto">
          {ordersError ? <p role="alert" className="p-6 text-red-700">تعذر تحميل أحدث الطلبات. أعد المحاولة.</p> : <>
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">رقم الطلب</th>
                <th className="px-6 py-4 font-semibold">التاريخ</th>
                <th className="px-6 py-4 font-semibold">الكمية</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    لا يوجد طلبات سابقة لهذا العميل
                  </td>
                </tr>
              ) : (
                orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.quantity} خزان</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'in_production' ? 'bg-amber-100 text-amber-800' : 
                          'bg-slate-100 text-slate-800'}
                      `}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></>}
        </div>
      </div>
    </div>
  );
}
