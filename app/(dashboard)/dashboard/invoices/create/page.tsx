import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InvoiceForm, { type OrderWithClient } from "./invoice-form";

export const metadata = {
  title: "إنشاء فاتورة | نظام إدارة المصنع",
};

export default async function CreateInvoicePage() {
  await requirePermission("sales");

  const supabase = await createClient();

  // 1. Fetch all clients
  const { data: clients, error: clientsError } = await supabase.from("clients").select("id, name, phone, type, price_tier").order("name");

  // 2. Fetch orders that do not have an invoice yet
  const { data: invoices, error: invoicesError } = await supabase.from("invoices").select("order_id");
  const invoicedOrderIds = new Set(invoices?.map((i) => i.order_id) || []);

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      quantity,
      product_spec,
      created_at,
      clients (
        name,
        type,
        price_tier
      )
    `)
    .order("created_at", { ascending: false });

  if (clientsError || invoicesError || error) {
    return (
      <div className="p-6">
        <p role="alert" className="p-6 text-red-700">تعذر تحميل البيانات. أعد المحاولة؛ لا يمكن الاعتماد على الملخص أو إتمام الإدخال حتى نجاح القراءة.</p>
      </div>
    );
  }

  const uninvoicedOrders = orders?.filter((o) => !invoicedOrderIds.has(o.id)) || [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices" className="text-slate-500 hover:text-slate-800 transition-colors">
          &rarr; عودة للفواتير
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">إنشاء فاتورة جديدة</h1>
      </div>
      
      <InvoiceForm 
        orders={uninvoicedOrders as unknown as OrderWithClient[]} 
        clients={clients || []} 
      />
    </div>
  );
}
