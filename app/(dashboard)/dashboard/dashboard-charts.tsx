"use client";

import { useState } from "react";
import Link from "next/link";
import UiIcon from "../ui-icon";

export type OrderStats = {
  total: number;
  pending: number;
  in_production: number;
  completed: number;
  delivered: number;
};

export type MaterialStat = {
  id: string;
  type: string;
  stock_qty: number;
  min_threshold: number;
  unit: string;
};

export type InvoiceStats = {
  totalCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paidCount: number;
  overdueCount: number;
  pendingCount: number;
};

export default function DashboardCharts({
  orderStats,
  materialStats,
  invoiceStats,
}: {
  orderStats?: OrderStats | null;
  materialStats?: MaterialStat[] | null;
  invoiceStats?: InvoiceStats | null;
}) {
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "finance">("orders");

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">مؤشرات الأداء ورسوم بيانية تفاعلية</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">تحليل فوري لحركة الإنتاج، أرصدة المخزون، والتدفقات المالية</p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UiIcon name="factory" />
            <span>أوامر التشغيل ({orderStats?.total ?? 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "inventory"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UiIcon name="box" />
            <span>مستويات المخزون ({materialStats?.length ?? 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("finance")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "finance"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UiIcon name="file" />
            <span>الفواتير والتحصيل</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Orders & Production Flow */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
              <span className="text-xs font-bold text-amber-800 block">قيد الانتظار</span>
              <strong className="text-2xl font-black text-amber-900 font-mono">{orderStats?.pending ?? 0}</strong>
              <small className="text-[10px] text-amber-700 block mt-1">بانتظار بدء التشغيل</small>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
              <span className="text-xs font-bold text-blue-800 block">قيد التصنيع</span>
              <strong className="text-2xl font-black text-blue-900 font-mono">{orderStats?.in_production ?? 0}</strong>
              <small className="text-[10px] text-blue-700 block mt-1">على خط الإنتاج حالياً</small>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
              <span className="text-xs font-bold text-emerald-800 block">تم التصنيع</span>
              <strong className="text-2xl font-black text-emerald-900 font-mono">{orderStats?.completed ?? 0}</strong>
              <small className="text-[10px] text-emerald-700 block mt-1">جاهزة للتسليم للعميل</small>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">تم التسليم</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">{orderStats?.delivered ?? 0}</strong>
              <small className="text-[10px] text-slate-500 block mt-1">تم إصدار إذن تسليمها</small>
            </div>
          </div>

          {/* Visual SVG Progress Bar / Chart */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
              <span>توزيع دورة التشغيل (إجمالي {orderStats?.total ?? 0} أمر)</span>
              <span>نسبة الإنجاز الكلي: {orderStats?.total ? Math.round(((orderStats.completed + orderStats.delivered) / orderStats.total) * 100) : 0}%</span>
            </div>

            {/* Stacked Percentage Bar */}
            <div className="h-6 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              {orderStats && orderStats.total > 0 ? (
                <>
                  <div
                    style={{ width: `${(orderStats.pending / orderStats.total) * 100}%` }}
                    className="bg-amber-400 h-full transition-all hover:opacity-85 relative group cursor-pointer"
                    title={`قيد الانتظار: ${orderStats.pending}`}
                  />
                  <div
                    style={{ width: `${(orderStats.in_production / orderStats.total) * 100}%` }}
                    className="bg-blue-500 h-full transition-all hover:opacity-85 relative group cursor-pointer"
                    title={`قيد التصنيع: ${orderStats.in_production}`}
                  />
                  <div
                    style={{ width: `${(orderStats.completed / orderStats.total) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all hover:opacity-85 relative group cursor-pointer"
                    title={`مكتمل: ${orderStats.completed}`}
                  />
                  <div
                    style={{ width: `${(orderStats.delivered / orderStats.total) * 100}%` }}
                    className="bg-slate-600 h-full transition-all hover:opacity-85 relative group cursor-pointer"
                    title={`مسلّم: ${orderStats.delivered}`}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  لا توجد أوامر مسجلة حالياً
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-2">
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400" /> قيد الانتظار</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" /> قيد التصنيع</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> جاهز للتسليم</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-600" /> تم التسليم</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/dashboard/orders" className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
              <span>الانتقال لجدول أوامر الشغل ومتابعة التصنيع</span>
              <UiIcon name="arrow" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Material Inventory & Thresholds */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>مقارنة الرصيد الحالي مقابل الحد الأدنى الآمن للأصناف</span>
              <span className="text-slate-400">تحديث فوري</span>
            </div>

            {materialStats && materialStats.length > 0 ? (
              <div className="space-y-3.5 pt-2">
                {materialStats.slice(0, 6).map((item) => {
                  const isLow = item.stock_qty <= item.min_threshold;
                  const ratio = item.min_threshold > 0 ? Math.min(100, Math.round((item.stock_qty / (item.min_threshold * 2)) * 100)) : 100;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isLow
                          ? "bg-red-50/50 border-red-200"
                          : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-bold text-sm">{item.type}</strong>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                              عند الحد الأدنى
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 font-mono text-xs">
                          <strong className={isLow ? "text-red-700 font-bold" : "text-slate-900"}>{item.stock_qty}</strong>
                          <span className="text-slate-400"> / الحد الأدنى: {item.min_threshold} {item.unit}</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(5, ratio)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLow ? "bg-red-500" : item.stock_qty <= item.min_threshold * 1.5 ? "bg-amber-400" : "bg-emerald-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-sm text-slate-400">لا توجد خامات مسجلة بالمخزون حالياً.</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-4 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> رصيد آمن</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> يقترب من الحد الأدنى</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> حرج (يحتاج توريد)</span>
            </div>

            <Link href="/dashboard/materials" className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
              <span>جدول الخامات وحركات المخزون</span>
              <UiIcon name="arrow" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Collections & Invoices */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي الفواتير الصادرة</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">
                {invoiceStats?.totalAmount?.toLocaleString() ?? 0} <small className="text-xs font-normal">ج.م</small>
              </strong>
              <span className="text-[11px] text-slate-500 block mt-1">عدد الفواتير: {invoiceStats?.totalCount ?? 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-800 block mb-1">المحصل الفعلي (السيولة)</span>
              <strong className="text-2xl font-black text-emerald-700 font-mono">
                {invoiceStats?.paidAmount?.toLocaleString() ?? 0} <small className="text-xs font-normal">ج.م</small>
              </strong>
              <span className="text-[11px] text-emerald-600 block mt-1">فواتير مسددة: {invoiceStats?.paidCount ?? 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80">
              <span className="text-xs font-bold text-red-800 block mb-1">المتبقي لدى العملاء (آجل)</span>
              <strong className="text-2xl font-black text-red-700 font-mono">
                {invoiceStats?.balanceDue?.toLocaleString() ?? 0} <small className="text-xs font-normal">ج.م</small>
              </strong>
              <span className="text-[11px] text-red-600 block mt-1">فواتير متأخرة: {invoiceStats?.overdueCount ?? 0}</span>
            </div>
          </div>

          {/* Collection Ratio Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700">معدل التحصيل النقدي</span>
              <span className="text-emerald-700 font-mono">
                {invoiceStats?.totalAmount && invoiceStats.totalAmount > 0
                  ? Math.round((invoiceStats.paidAmount / invoiceStats.totalAmount) * 100)
                  : 0}%
              </span>
            </div>

            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${
                    invoiceStats?.totalAmount && invoiceStats.totalAmount > 0
                      ? Math.min(100, Math.round((invoiceStats.paidAmount / invoiceStats.totalAmount) * 100))
                      : 0
                  }%`,
                }}
                className="bg-emerald-500 h-full transition-all duration-500"
              />
              <div
                style={{
                  width: `${
                    invoiceStats?.totalAmount && invoiceStats.totalAmount > 0
                      ? Math.min(100, Math.round((invoiceStats.balanceDue / invoiceStats.totalAmount) * 100))
                      : 0
                  }%`,
                }}
                className="bg-red-400 h-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/dashboard/invoices" className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
              <span>الانتقال لجدول الفواتير والتحصيلات والشيكات</span>
              <UiIcon name="arrow" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
