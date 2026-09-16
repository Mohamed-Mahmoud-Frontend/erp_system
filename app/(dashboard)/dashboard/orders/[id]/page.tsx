import { allowed, requirePermission } from "@/lib/access";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { overridesSchema, requirementsSchema, statusLabels } from "@/lib/manufacturing";
import OrderStatusForm from "./status-form";
export const metadata = { title: "تفاصيل أمر الشغل" };
export default async function OrderDetailsPage({ params }: { params: Promise<{id:string}> }) {
  const access=await requirePermission(["sales","production"]);

  const { id } = await params;
  const supabase = await createClient();
  const { data: order, error } = await supabase.from("orders").select("*,clients(name)").eq("id",id).maybeSingle();
  if (error) return <p role="alert" className="text-red-700">تعذر قراءة الأوردر. أعد المحاولة.</p>;
  if (!order) notFound();
  const requirements = requirementsSchema.safeParse(order.material_requirements), overrides = overridesSchema.safeParse(order.material_overrides);
  const [movements, invoice] = await Promise.all([
    supabase.from("material_movements").select("*,materials(type,unit)").eq("order_id",id).order("created_at"),
    supabase.from("invoices").select("id,invoice_number").eq("order_id",id).maybeSingle(),
  ]);
  return <div className="max-w-5xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">أمر شغل {id.slice(0,8)}</h1>
    <Link className="text-blue-700 underline" href="/dashboard/orders">العودة للطلبات</Link>
    <p>{order.clients.name} — {order.quantity} وحدة — <strong data-testid="order-status">{statusLabels[order.status] ?? order.status}</strong></p>
    {order.product_spec_id && <Link className="block text-blue-700 underline" href={`/dashboard/product-specs?edit=${order.product_spec_id}`}>الوصفة الأصلية</Link>}
    {allowed(access,"production") && (requirements.success && overrides.success ? <OrderStatusForm id={id} status={order.status} requirements={requirements.data} overrides={overrides.data} /> : <p role="alert" className="text-red-700">بيانات احتياجات الأوردر غير صالحة؛ لا يمكن بدء التصنيع.</p>)}
    {allowed(access,"production") && <section className="bg-white border rounded-xl p-6 space-y-3"><h2 className="text-lg font-bold">حركات الخامات المرتبطة بالأوردر</h2>
      {movements.error ? <p role="alert" className="text-red-700">تعذر تحميل حركات الخامات.</p> : movements.data.length === 0 ? <p>لا توجد حركات خامات مسجلة.</p> : movements.data.map(m => <p key={m.id}>{m.materials.type}: {m.qty} {m.materials.unit} — {m.direction === "out" ? "صادر" : "وارد"}{m.is_return ? " — مرتجع" : ""}</p>)}
      <Link className="block text-blue-700 underline" href="/dashboard/materials/movements/new">تسجيل حركة خامات يدويًا</Link>
    </section>}
    {allowed(access,"sales") && (invoice.error ? <p role="alert" className="text-red-700">تعذر التحقق من فاتورة الأوردر.</p> : <Link className="text-blue-700 underline" href={invoice.data ? `/dashboard/invoices/${invoice.data.id}` : `/dashboard/invoices/create?order_id=${id}`}>{invoice.data ? `عرض الفاتورة ${invoice.data.invoice_number}` : "إصدار فاتورة"}</Link>)}
  </div>;
}
