import { allowed, getAccess, requirePermission } from "@/lib/access";
import Link from "next/link";
import { notFound } from "next/navigation";
import Decimal from "decimal.js";
import { createClient } from "@/lib/supabase/server";
import { balanceLabel, isOverdue, money } from "@/lib/billing";
import PaymentForm from "./payment-form";
import CorrectionForm from "../../corrections/form";
import ReturnForm from "./return-form";
export const metadata = { title: "تفاصيل الفاتورة" };
export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("sales");

  const access=await getAccess();
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice, error } = await supabase.from("invoice_balances").select("*").eq("id", id).maybeSingle();
  if (error) return <p role="alert" className="p-6 text-red-700">تعذر تحميل الفاتورة. أعد المحاولة.</p>;
  if (!invoice) notFound();
  const { data: history, error: historyError } = await supabase.from("invoices").select("payments(*,cheques(*)),sales_returns(*)").eq("id", id).single();
  const overdue = isOverdue(invoice.due_date, invoice.balance_due);
  const status = invoice.balance_due < 0 ? "رصيد دائن للعميل" : invoice.balance_due === 0 ? "مسددة / مسواة" : overdue ? "متأخرة السداد" : "مستحقة السداد";
  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><h1 className="text-2xl font-bold">تفاصيل الفاتورة: <span dir="ltr">{invoice.invoice_number}</span></h1><Link className="text-blue-700 underline" href="/dashboard/invoices">العودة للفواتير</Link></div>
    <div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-6">
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <p className={`font-bold ${overdue ? "text-red-700" : "text-blue-700"}`}>{status}</p>
        <dl className="grid sm:grid-cols-2 gap-4">
          <div><dt>العميل</dt><dd><Link className="text-blue-700 underline" href={`/dashboard/clients/${invoice.client_id}`}>{invoice.client_name}</Link></dd></div>
          <div><dt>الكمية</dt><dd>{invoice.quantity} خزان</dd></div>
          <div><dt>تاريخ الإصدار</dt><dd>{new Date(invoice.created_at).toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo" })}</dd></div>
          <div><dt>تاريخ الاستحقاق</dt><dd>{invoice.due_date ?? "—"}</dd></div>
        </dl>
        <div className="border-t pt-4 space-y-2"><p>الإجمالي: {money(invoice.total)} ج.م</p><p>المدفوع المحتسب: {money(invoice.paid_amount)} ج.م</p><p>مرتجعات البيع: {money(invoice.returned_amount)} ج.م</p>
          <p data-testid="invoice-balance" className="text-2xl font-bold">الرصيد: {balanceLabel(invoice.balance_due)}</p></div>
      </section>
      {historyError ? <p role="alert" className="p-6 text-red-700">تعذر تحميل المدفوعات والمرتجعات. أعد المحاولة.</p> : <>
        <section className="bg-white border rounded-xl p-6 space-y-4"><h2 className="font-bold text-lg">سجل المدفوعات</h2>
          {history.payments.length === 0 && <p>لم يتم تسجيل أي مدفوعات بعد.</p>}
          {[...history.payments].sort((a, b) => a.paid_at.localeCompare(b.paid_at) || a.created_at.localeCompare(b.created_at)).map(payment => <div key={payment.id} className="border-t pt-3">
            <p>{money(payment.amount)} ج.م — {payment.method === "cash" ? "نقدي" : payment.method === "transfer" ? "تحويل بنكي" : "شيك"} — {payment.paid_at}</p>
            {payment.method === "cheque" && payment.cheques.map(cheque => <p key={cheque.id} className={cheque.status === "bounced" ? "text-red-700" : "text-slate-600"}>استحقاق {cheque.due_date} — {cheque.status === "bounced" ? "مرفوض — غير محتسب في السداد" : cheque.status === "cleared" ? "تم التحصيل" : "قيد الانتظار"} <Link className="underline text-blue-700" href="/dashboard/cheques">إدارة الشيك</Link></p>)}
          </div>)}
        </section>
        <section className="bg-white border rounded-xl p-6 space-y-4"><h2 className="font-bold text-lg">مرتجعات البيع</h2>
          {history.sales_returns.length === 0 && <p>لا توجد مرتجعات مسجلة.</p>}
          {[...history.sales_returns].sort((a, b) => a.created_at.localeCompare(b.created_at)).map(item => <div key={item.id} className="border-t pt-3"><p>{money(item.amount)} ج.م — {new Date(item.created_at).toLocaleDateString("ar-EG")} — {item.condition}</p>{item.note && <p className="text-slate-600">{item.note}</p>}{item.voided_at ? <p className="text-red-700">ملغى — غير محتسب: {item.voided_reason} — {new Date(item.voided_at).toLocaleString("ar-EG",{timeZone:"Africa/Cairo"})}</p> : allowed(access,"admin") ? <CorrectionForm kind="return" id={item.id}/> : <p>إلغاء المرتجع متاح للمدير.</p>}</div>)}
        </section>
      </>}
    </div><div className="space-y-6"><PaymentForm invoiceId={id} balanceDue={invoice.balance_due} /><ReturnForm invoiceId={id} maxAmount={new Decimal(invoice.total).minus(invoice.returned_amount).toNumber()} /></div></div>
  </div>;
}
