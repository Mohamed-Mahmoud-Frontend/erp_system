"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteWorkerAction, toggleWorkerStatusAction } from "./actions";

export type WorkerItem = {
  id: string;
  name: string;
  daily_wage: number;
};

export default function WorkersTable({ workers }: { workers: WorkerItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "stopped">("all");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredWorkers = workers.filter((w) => {
    const isStopped = w.name.includes("(متوقف)");
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (filter === "active") return !isStopped;
    if (filter === "stopped") return isStopped;
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    const cleanName = name.replace(/\s*\(متوقف\)\s*$/, "");
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف أو إيقاف العامل "${cleanName}"؟`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteWorkerAction(id);
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(null), 5000);
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      const res = await toggleWorkerStatusAction(id);
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="ابحث باسم العامل…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1 shrink-0"
            >
              مسح
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filter === "all" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            الكل ({workers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filter === "active" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            على رأس العمل ({workers.filter((w) => !w.name.includes("(متوقف)")).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("stopped")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filter === "stopped" ? "bg-white text-slate-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            متوقف ({workers.filter((w) => w.name.includes("(متوقف)")).length})
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-bold flex items-center justify-between animate-fadeIn">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-xs underline text-blue-600">
            إغلاق
          </button>
        </div>
      )}

      {/* Modern Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">العامل</th>
                <th className="px-6 py-4 font-bold">الأجر اليومي</th>
                <th className="px-6 py-4 font-bold text-center">الحالة</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    لا يوجد عمال يطابقون خيارات البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => {
                  const isStopped = worker.name.includes("(متوقف)");
                  const cleanName = worker.name.replace(/\s*\(متوقف\)\s*$/, "").trim();

                  return (
                    <tr
                      key={worker.id}
                      className={`transition-colors ${
                        isStopped ? "bg-slate-50/50 hover:bg-slate-100/50" : "hover:bg-blue-50/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isStopped
                                ? "bg-slate-200 text-slate-600"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {cleanName.slice(0, 1)}
                          </div>
                          <div>
                            <strong className="block text-slate-900 font-bold">{cleanName}</strong>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {worker.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <strong className="font-mono font-bold text-slate-900 text-base">
                          {Number(worker.daily_wage).toLocaleString()}
                        </strong>
                        <span className="text-xs text-slate-500 mr-1">ج.م / يوم</span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isStopped ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            متوقف عن العمل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            على رأس العمل
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 flex-nowrap justify-center">
                          {/* Details & Correction Link */}
                          <Link
                            href={`/dashboard/workers/${worker.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200/60"
                          >
                            السجل والتصحيح
                          </Link>

                          {/* Advance / Bonus Shortcut */}
                          <Link
                            href="/dashboard/workers/transactions"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            سلفة / مكافأة
                          </Link>

                          {/* Toggle Active / Stopped status */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggle(worker.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200/60 cursor-pointer disabled:opacity-50"
                            title={isStopped ? "إعادة تفعيل العامل" : "إيقاف العامل مؤقتاً"}
                          >
                            {isStopped ? "تفعيل" : "إيقاف"}
                          </button>

                          {/* Delete Worker button */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDelete(worker.id, worker.name)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 transition-colors border border-red-200/60 cursor-pointer disabled:opacity-50"
                            title="حذف العامل نهائياً أو إيقافه"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
