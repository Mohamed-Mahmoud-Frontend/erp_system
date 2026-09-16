import { requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SpecEditor, { DeleteSpec } from "./editor";
export const metadata = { title: "وصفات المنتجات" };
export default async function ProductSpecsPage({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string }> }) {
  await requirePermission("admin");

  const params = await searchParams;
  const supabase = await createClient();
  const [specs, materials] = await Promise.all([
    supabase.from("product_specs").select("*,product_spec_materials(*)").order("name"),
    supabase.from("materials").select("id,type,unit").order("type"),
  ]);
  if (specs.error || materials.error) return <p role="alert" className="text-red-700">تعذر تحميل الوصفات أو الخامات. أعد المحاولة.</p>;
  const initial = specs.data.find(s => s.id === params.edit);
  return <div className="max-w-5xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">وصفات المنتجات</h1>
    <div className="flex gap-4"><Link className="text-blue-700 underline" href="/dashboard/product-specs">وصفة جديدة</Link><Link className="text-blue-700 underline" href="/dashboard/orders/new/recipe">إنشاء أوردر بوصفة</Link><Link className="text-blue-700 underline" href="/dashboard/materials">الخامات</Link></div>
    {params.saved === "1" && initial && <p role="status" className="text-green-700">تم حفظ الوصفة.</p>}
    {params.edit && !initial ? <p role="alert" className="text-red-700">الوصفة المطلوبة غير موجودة.</p> : <SpecEditor key={initial?.id ?? "new"} materials={materials.data} initial={initial} />}
    <section className="bg-white border rounded-xl divide-y">{specs.data.length === 0 && <p className="p-6">لا توجد وصفات بعد.</p>}{specs.data.map(spec => <div key={spec.id} data-spec-id={spec.id} className="p-4 flex justify-between gap-4"><div><Link className="font-bold text-blue-700 underline" href={`/dashboard/product-specs?edit=${spec.id}`}>{spec.name}</Link><p>{spec.active ? "نشطة" : "غير نشطة"} — {spec.product_spec_materials.length} خامة</p></div><DeleteSpec id={spec.id} /></div>)}</section>
  </div>;
}
