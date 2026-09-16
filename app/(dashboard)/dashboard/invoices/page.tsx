import { requirePermission } from "@/lib/access";
import { balanceLabel, isOverdue as overdue } from "@/lib/billing";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الفواتير والتحصيل | نظام إدارة المصنع",
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
        <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          حدث خطأ في جلب بيانات الفواتير: {error.message}
        </div>
      </div>
    );
  }

  const invoiceList = invoices || [];
  const totalInvoicesSum = invoiceList.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalPaidSum = invoiceList.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
  const totalRemainingDue = invoiceList.reduce(
    (sum, inv) => sum + Math.max(0, Number(inv.balance_due) || 0),
    0
  );

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">الفواتير وحسابات المبيعات</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            إدارة فواتير العملاء، متابعة التحصيل، الأرصدة المستحقة والدفعات
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/cheques"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            📋 حافظة الشيكات
          </Link>
          <Link
            href="/dashboard/invoices/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            + إنشاء فاتورة جديدة
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">إجمالي قيمة الفواتير ({invoiceList.length})</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {totalInvoicesSum.toLocaleString()} <span className="text-xs font-normal font-sans text-slate-500">ج.م</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-emerald-700">إجمالي المبالغ المحصلة</p>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {totalPaidSum.toLocaleString()} <span className="text-xs font-normal font-sans text-slate-500">ج.م</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-amber-700">إجمالي المستحق المتبقي</p>
          <p className="text-xl font-black text-amber-600 mt-1 font-mono">
            {totalRemainingDue.toLocaleString()} <span className="text-xs font-normal font-sans text-slate-500">ج.م</span>
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">رقم الفاتورة</th>
                <th className="px-6 py-4 font-bold">العميل</th>
                <th className="px-6 py-4 font-bold">تاريخ الإصدار</th>
                <th className="px-6 py-4 font-bold">الاستحقاق</th>
                <th className="px-6 py-4 font-bold">الإجمالي</th>
                <th className="px-6 py-4 font-bold">المدفوع</th>
                <th className="px-6 py-4 font-bold">المتبقي</th>
                <th className="px-6 py-4 font-bold text-center">حالة السداد</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoiceList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    لا توجد فواتير مسجلة حالياً
                  </td>
                </tr>
              ) : (
                invoiceList.map((invoice) => {
                  const isPaid = invoice.balance_due <= 0;
                  const isOverdue = overdue(invoice.due_date, invoice.balance_due);
                  const paidAmount = invoice.paid_amount;

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900" dir="ltr">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                          {invoice.invoice_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        <strong className="block text-slate-900 font-bold">{invoice.client_name || "غير معروف"}</strong>
                        {invoice.client_type && (
                          <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-0.5">
                            {invoice.client_type}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {new Date(invoice.created_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("ar-EG") : "-"}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {invoice.total.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                        {paidAmount.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-red-600">
                        {balanceLabel(invoice.balance_due)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {invoice.balance_due < 0 ? "رصيد دائن" : "مسددة بالكامل ✓"}
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            متأخرة عن موعدها ⚠️
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            مستحقة للدفع
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                        >
                          عرض وتفاصيل 👁️
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
