import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import Link from "next/link";

export const metadata: Metadata = {
  title: ar.nav.dashboard,
};

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch low stock materials
  const { data: materials } = await supabase.from("materials").select("*");
  const lowStockMaterials = materials?.filter((m) => m.stock_qty <= m.min_threshold) || [];

  // Fetch incoming quotations (draft)
  const { data: quotes } = await supabase
    .from("quotations")
    .select("*")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          لوحة القيادة (Dashboard)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          مرحباً، {user?.email} — إليك ملخص سريع لنظام إدارة المصنع
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
        {[
          { label: "العملاء", icon: "👥", href: "/dashboard/clients" },
          { label: "الفواتير", icon: "🧾", href: "/dashboard/invoices" },
          { label: "الطلبات", icon: "📦", href: "/dashboard/orders" },
          { label: "الخامات", icon: "🏭", href: "/dashboard/materials" },
          { label: "الموردين", icon: "🚚", href: "/dashboard/suppliers" },
          { label: "العمال", icon: "👷", href: "/dashboard/workers" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md hover:bg-slate-50"
          >
            <span className="text-3xl">{card.icon}</span>
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">
              {card.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-red-50/50 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-lg font-bold text-red-900">نواقص المخزون</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockMaterials.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                المخزون بوضع ممتاز، لا توجد نواقص.
              </div>
            ) : (
              lowStockMaterials.map((m) => (
                <div key={m.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900">{m.type}</div>
                    <div className="text-sm text-slate-500">
                      الحد الأدنى: {m.min_threshold} {m.unit}
                    </div>
                  </div>
                  <div className="text-left font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    {m.stock_qty} {m.unit}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <h2 className="text-lg font-bold text-slate-900">طلبات عروض الأسعار الجديدة</h2>
            </div>
            <Link href="/dashboard/quotations" className="text-sm text-blue-600 font-bold hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {quotes?.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                لا توجد طلبات جديدة من الموقع.
              </div>
            ) : (
              quotes?.map((q) => (
                <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-slate-900">{q.guest_name || "عميل غير مسجل"}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(q.created_at).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                  {q.guest_phone && (
                    <div className="text-sm text-slate-600 mb-2">
                      📞 <span dir="ltr">{q.guest_phone}</span>
                    </div>
                  )}
                  <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                    {q.details}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
