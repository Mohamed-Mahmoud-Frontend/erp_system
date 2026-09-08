import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "الطلبات (أوامر الشغل) | نظام إدارة المصنع",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, clients(name, type, phone)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الطلبات (أوامر الشغل)</h1>
          <p className="text-slate-500 mt-1">
            متابعة أوامر الشغل تحت التنفيذ والمنجزة
          </p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + إضافة طلب جديد
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">رقم الطلب</th>
                <th className="px-6 py-4 font-semibold">تاريخ الطلب</th>
                <th className="px-6 py-4 font-semibold">العميل</th>
                <th className="px-6 py-4 font-semibold text-center">الكمية</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
                <th className="px-6 py-4 font-semibold text-center">إصدار فاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    لا توجد طلبات تصنيع حالياً
                  </td>
                </tr>
              ) : (
                orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900" dir="ltr">
                      ...{order.id.split("-")[0]}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.clients?.name}</div>
                      <div className="text-xs text-slate-500">{order.clients?.type === 'trader' ? 'تاجر' : order.clients?.type === 'individual' ? 'فرد' : 'مقاول'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-slate-800 text-lg">{order.quantity}</div>
                      {Array.isArray(order.product_spec) && order.product_spec.length > 0 && (
                        <div className="mt-2 text-xs text-slate-500 text-right space-y-1">
                          {order.product_spec.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-1 rounded border border-slate-100">
                              {item.quantity} × {item.capacity}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'in_production' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'pending' ? 'قيد الانتظار' :
                         order.status === 'in_production' ? 'جاري التصنيع' :
                         order.status === 'completed' ? 'مكتمل' :
                         'ملغي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/dashboard/invoices/create?order_id=${order.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        إصدار فاتورة 🧾
                      </Link>
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
