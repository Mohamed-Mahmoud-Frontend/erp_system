import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentForm from "./payment-form";

export async function generateMetadata() {
  return {
    title: `تفاصيل الفاتورة | نظام إدارة المصنع`,
  };
}

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch invoice with related data
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      orders (
        quantity,
        created_at,
        clients (
          name,
          type,
          phone,
          address
        )
      ),
      payments (
        id,
        amount,
        method,
        paid_at,
        created_at,
        cheques (
          status,
          due_date
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !invoice) {
    notFound();
  }

  const isPaid = invoice.balance_due === 0;
  const isOverdue = !isPaid && invoice.due_date && new Date(invoice.due_date) < new Date();
  const paidAmount = invoice.total - invoice.balance_due;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">تفاصيل الفاتورة: <span dir="ltr">{invoice.invoice_number}</span></h1>
          <p className="text-slate-500 mt-1">عرض حالة الفاتورة وتسجيل المدفوعات</p>
        </div>
        <Link
          href="/dashboard/invoices"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة للفواتير
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right side: Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">بيانات الفاتورة</h2>
              {isPaid ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                  مدفوعة بالكامل
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                  متأخرة السداد
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                  مستحقة السداد
                </span>
              )}
            </div>
            
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="block text-sm text-slate-500 mb-1">العميل</span>
                <span className="font-bold text-slate-900">{invoice.orders?.clients?.name || "غير محدد"}</span>
                {invoice.orders?.clients?.type && (
                  <span className="block text-xs text-slate-500 mt-1">{invoice.orders.clients.type}</span>
                )}
              </div>
              <div>
                <span className="block text-sm text-slate-500 mb-1">تاريخ الإصدار</span>
                <span className="font-medium text-slate-900">{new Date(invoice.created_at).toLocaleDateString("ar-EG")}</span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 mb-1">تاريخ الاستحقاق</span>
                <span className="font-medium text-slate-900">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("ar-EG") : "-"}</span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 mb-1">الكمية المباعة</span>
                <span className="font-medium text-slate-900">{invoice.orders?.quantity} خزان</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 font-medium">الإجمالي:</span>
                <span className="text-xl font-bold text-slate-900">{invoice.total.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 font-medium">تم سداده:</span>
                <span className="text-lg font-bold text-green-600">{paidAmount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4">
                <span className="text-slate-800 font-bold">المتبقي للدفع:</span>
                <span className="text-2xl font-black text-red-600">{invoice.balance_due.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-800">سجل المدفوعات</h2>
            </div>
            
            {(!invoice.payments || invoice.payments.length === 0) ? (
              <div className="p-8 text-center text-slate-500">
                لم يتم تسجيل أي مدفوعات لهذه الفاتورة بعد.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoice.payments.map((payment: { id: string, amount: number, method: string, paid_at: string, cheques: { status: string, due_date: string }[] }) => (
                  <div key={payment.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 mb-1">{payment.amount.toLocaleString()} ج.م</div>
                      <div className="text-sm text-slate-500">
                        {payment.method === "cash" ? "نقدي" : payment.method === "transfer" ? "تحويل بنكي" : "شيك"} 
                        {" • "} 
                        {new Date(payment.paid_at).toLocaleDateString("ar-EG")}
                      </div>
                    </div>
                    {payment.method === "cheque" && payment.cheques?.[0] && (
                      <div className="text-left text-sm">
                        <div className="text-slate-600 mb-1">تاريخ الشيك: <span className="font-medium text-slate-900">{new Date(payment.cheques[0].due_date).toLocaleDateString("ar-EG")}</span></div>
                        <div>
                          {payment.cheques[0].status === "pending" ? (
                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">قيد الانتظار</span>
                          ) : payment.cheques[0].status === "cleared" ? (
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">تم التحصيل</span>
                          ) : (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">مرفوض</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Left side: Payment Form */}
        <div>
          <PaymentForm invoiceId={invoice.id} balanceDue={invoice.balance_due} />
        </div>
      </div>
    </div>
  );
}
