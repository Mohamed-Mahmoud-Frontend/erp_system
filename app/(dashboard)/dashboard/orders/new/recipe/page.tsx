import { allowed, requirePermission } from "@/lib/access";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RecipeOrderForm from "./form";
export const metadata = { title: "أوردر بوصفة منتج" };
export default async function NewRecipeOrderPage() {
  const access=await requirePermission(["sales","production"]);

  const supabase = await createClient();
  const [clients, specs] = await Promise.all([
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("product_specs").select("id,name,product_spec_materials(material_id,qty_per_unit,materials(type,unit))").eq("active",true).order("name"),
  ]);
  if (clients.error || specs.error) return <p role="alert" className="text-red-700">تعذر تحميل العملاء أو الوصفات. أعد المحاولة.</p>;
  return <div className="max-w-4xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">إنشاء أوردر بوصفة منتج</h1>
    <div className="flex gap-4"><Link className="text-blue-700 underline" href="/dashboard/orders/new">أوردر مخصص بدون وصفة</Link>{allowed(access,"admin")&&<Link className="text-blue-700 underline" href="/dashboard/product-specs">إدارة الوصفات</Link>}{allowed(access,"sales")&&<Link className="text-blue-700 underline" href="/dashboard/clients/new">عميل جديد</Link>}</div>
    <RecipeOrderForm clients={clients.data} specs={specs.data} />
  </div>;
}
