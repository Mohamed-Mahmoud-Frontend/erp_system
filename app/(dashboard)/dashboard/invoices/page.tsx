import { requirePermission } from "@/lib/access";
import { balanceLabel, isOverdue as overdue } from "@/lib/billing";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الفواتير | نظام إدارة المصنع",
};

export default async function InvoicesPage() {
  await requirePermission("sales");

  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoice_balances")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">حدث خطأ في جلب بيانات الفواتير: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الفواتير</h1>
          <p className="text-sm text-slate-500 mt-1">إجمالي الفواتير: {invoices?.length || 0}</p>
        </div>
        <Link 
          href="/dashboard/invoices/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + إنشاء فاتورة جديدة
        </Link>
      </div>

      <Link href="/dashboard/cheques" className="inline-block text-blue-700 underline">إدارة الشيكات</Link>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">رقم الفاتورة</th>
                <th className="px-6 py-4 font-semibold">العميل</th>
                <th className="px-6 py-4 font-semibold">تاريخ الإصدار</th>
                <th className="px-6 py-4 font-semibold">تاريخ الاستحقاق</th>
                <th className="px-6 py-4 font-semibold">الإجمالي</th>
                <th className="px-6 py-4 font-semibold">المدفوع</th>
                <th className="px-6 py-4 font-semibold">المتبقي</th>
                <th className="px-6 py-4 font-semibold text-center">الحالة</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد فواتير حالياً
                  </td>
                </tr>
              ) : (
                invoices?.map((invoice) => {
                  const isPaid = invoice.balance_due <= 0;
                  const isOverdue = overdue(invoice.due_date, invoice.balance_due);
                  const paidAmount = invoice.paid_amount;
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900" dir="ltr">{invoice.invoice_number}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {invoice.client_name || "غير معروف"}
                        {invoice.client_type && (
                          <span className="text-xs text-slate-500 mr-2">({invoice.client_type})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(invoice.created_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("ar-EG") : "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {invoice.total.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        {paidAmount.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 font-medium text-red-600">
                        {balanceLabel(invoice.balance_due)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {invoice.balance_due < 0 ? "رصيد دائن للعميل" : "مسددة / مسواة"}
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            متأخرة
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            مستحقة
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                          عرض / دفع
                        </Link>
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
