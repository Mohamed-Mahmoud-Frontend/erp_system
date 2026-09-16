import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { balanceLabel, isOverdue, money, statementSchema } from "@/lib/billing";

export default async function ClientStatement({ clientId }: { clientId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_client_statement", { p_client_id: clientId });
  const parsed = statementSchema.safeParse(data);
  if (error || !parsed.success) {
    console.error("Client statement read failed", error ?? parsed.error);
    return <p role="alert" className="p-4 bg-red-50 text-red-800">تعذر تحميل كشف الحساب. أعد تحميل الصفحة للمحاولة؛ الرصيد غير متاح الآن.</p>;
  }
  const statement = parsed.data;
  const methods: Record<string, string> = { cash: "نقدي", transfer: "تحويل بنكي", cheque: "شيك" };
  return <section className="space-y-4" aria-label="كشف حساب العميل">
    <h2 className="text-lg font-bold">كشف الحساب</h2>
    <p className="text-sm text-slate-500">الشيك المرفوض ظاهر بقيمته الأصلية ولا يُحتسب في السداد. الأرصدة تعكس حالة الشيك الحالية.</p>
    <div className="overflow-x-auto"><table className="w-full text-right text-sm">
      <thead className="bg-slate-50"><tr>{["التاريخ", "البيان / الفاتورة", "مدين", "دائن", "الرصيد الجاري"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
      <tbody>{statement.entries.map(entry => {
        const overdue = entry.kind === "invoice" && isOverdue(entry.due_date, entry.invoice_balance);
        return <tr key={`${entry.kind}-${entry.id}`} className={`border-t ${overdue ? "bg-red-50" : ""}`}>
          <td className="p-3 whitespace-nowrap">{entry.date}</td>
          <td className="p-3"><Link className="text-blue-700 underline" href={`/dashboard/invoices/${entry.invoice_id}`}>{entry.invoice_number}</Link>
            <p>{entry.kind === "invoice" ? "فاتورة بيع" : entry.kind === "return" ? `مرتجع بيع: ${entry.description}` : `دفعة ${methods[entry.description ?? ""] ?? entry.description}`}</p>
            {entry.kind === "invoice" && entry.due_date && <p className={overdue ? "text-red-700 font-bold" : "text-slate-500"}>استحقاق {entry.due_date}{overdue ? " — متأخرة السداد" : ""}</p>}
            {entry.bounced && <p className="text-red-700 font-bold">شيك مرفوض — {money(entry.original_amount)} ج.م غير محتسبة</p>}
          </td>
          <td className="p-3">{money(entry.debit)}</td><td className="p-3">{money(entry.credit)}</td>
          <td className="p-3 whitespace-nowrap">{balanceLabel(entry.running_balance)}</td>
        </tr>;
      })}</tbody>
    </table></div>
    {statement.entries.length === 0 && <p>لا توجد فواتير أو مدفوعات لهذا العميل.</p>}
    <p data-testid="client-balance" className="border-t pt-4 text-xl font-bold">الرصيد الحالي: {balanceLabel(statement.balance)}</p>
  </section>;
}
