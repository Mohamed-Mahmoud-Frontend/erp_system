import { requirePermission } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { statusLabels } from "@/lib/manufacturing";
import { orderItemSchema } from "@/lib/validations/order";

export const metadata = {
  title: "الطلبات (أوامر الشغل) | نظام إدارة المصنع",
};

export default async function OrdersPage() {
  await requirePermission(["sales", "production"]);

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, clients(name, type, phone)")
    .order("created_at", { ascending: false });

  if (error) return <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">تعذر تحميل الطلبات. أعد المحاولة.</p>;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">الطلبات (أوامر الشغل)</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            متابعة مراحل تصنيع الخزانات من أمر الشغل وحتى التسليم وإصدار الفواتير
          </p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
        >
          + إضافة أمر تشغيل جديد
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">رقم الطلب</th>
                <th className="px-6 py-4 font-bold">تاريخ الطلب</th>
                <th className="px-6 py-4 font-bold">العميل</th>
                <th className="px-6 py-4 font-bold text-center">الكمية والمواصفات</th>
                <th className="px-6 py-4 font-bold text-center">حالة التشغيل</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    لا توجد طلبات تصنيع مسجلة حالياً.
                  </td>
                </tr>
              ) : (
                orders?.map((order) => {
                  const statusColor =
                    order.status === "pending"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : order.status === "in_production"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : order.status === "completed"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : order.status === "delivered"
                      ? "bg-slate-100 text-slate-700 border-slate-300"
                      : "bg-red-50 text-red-700 border-red-200";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50/60 px-2.5 py-1 rounded-lg border border-blue-200/50 inline-block text-xs"
                          dir="ltr"
                        >
                          #ORD-{order.id.slice(0, 8)}
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {new Date(order.created_at).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <strong className="block text-slate-900 font-bold">{order.clients?.name || "عميل غير محدد"}</strong>
                        <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-0.5">
                          {order.clients?.type === "trader"
                            ? "تاجر"
                            : order.clients?.type === "individual"
                            ? "فرد"
                            : "مقاول"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="font-mono font-bold text-slate-900 text-base">
                          {order.quantity} <small className="text-xs text-slate-500 font-normal">خزان</small>
                        </div>
                        {Array.isArray(order.product_spec) && order.product_spec.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                            {order.product_spec.map((item, i) => {
                              const parsed = orderItemSchema.safeParse(item);
                              return (
                                <span
                                  key={i}
                                  className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                                >
                                  {parsed.success ? `${parsed.data.quantity} × ${parsed.data.capacity}` : "بند مخصص"}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                          >
                            متابعة التصنيع
                          </Link>

                          <Link
                            href={`/dashboard/invoices/create?order_id=${order.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200"
                          >
                            إصدار فاتورة 🧾
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
