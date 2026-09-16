import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/billing";
import ChequeStatusForm from "./status-form";
export const metadata = { title: "الشيكات" };
export default async function ChequesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePermission("sales");

  const { status } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("cheques").select("*,payments(amount,invoice_id,invoices(invoice_number,orders(clients(name))))").order("due_date").order("id");
  if (status && ["pending", "cleared", "bounced"].includes(status)) query = query.eq("status", status);
  const { data, error } = await query;
  return <div className="space-y-6 max-w-6xl mx-auto"><h1 className="text-2xl font-bold">الشيكات</h1>
    <nav className="flex flex-wrap gap-4" aria-label="تصفية حالة الشيكات">{[["", "الكل"], ["pending", "قيد الانتظار"], ["cleared", "تم التحصيل"], ["bounced", "مرفوض"]].map(([value, label]) => <Link key={value} className="text-blue-700 underline" href={`/dashboard/cheques${value ? `?status=${value}` : ""}`}>{label}</Link>)}</nav>
    {error ? <p role="alert" className="text-red-700">تعذر تحميل الشيكات. أعد المحاولة.</p> : <div className="bg-white border rounded-xl overflow-x-auto"><table className="w-full text-sm text-right">
      <thead><tr>{["الفاتورة / العميل", "المبلغ", "الاستحقاق", "الحالة", "الإجراءات"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
      <tbody>{data.map(cheque => <tr key={cheque.id} data-cheque-id={cheque.id} className="border-t">
        <td className="p-4"><Link className="text-blue-700 underline" href={`/dashboard/invoices/${cheque.payments.invoice_id}`}>{cheque.payments.invoices.invoice_number}</Link><p>{cheque.payments.invoices?.orders?.clients?.name ?? "عميل غير محدد"}</p></td>
        <td className="p-4">{money(cheque.payments.amount)} ج.م</td><td className="p-4">{cheque.due_date}</td>
        <td className={`p-4 ${cheque.status === "bounced" ? "text-red-700" : cheque.status === "cleared" ? "text-green-700" : "text-amber-700"}`}>{cheque.status === "pending" ? "قيد الانتظار" : cheque.status === "cleared" ? "تم التحصيل" : "مرفوض"}</td>
        <td className="p-4"><ChequeStatusForm id={cheque.id} status={cheque.status} /></td>
      </tr>)}</tbody></table>{data.length === 0 && <p className="p-6">لا توجد شيكات بهذه الحالة.</p>}</div>}
  </div>;
}
