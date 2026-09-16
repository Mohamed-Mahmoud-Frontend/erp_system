"use client";

import { useActionState, useState } from "react";
import { recordAttendanceAction } from "../actions";

export default function AttendanceForm({
  workers,
  today,
}: {
  workers: { id: string; name: string }[];
  today: string;
}) {
  const [state, action, pending] = useActionState(recordAttendanceAction, null);
  const [status, setStatus] = useState("present");

  const isPresent = status !== "absent";

  return (
    <form action={action} aria-label="تسجيل اليومية" className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">العامل *</label>
        <select
          name="worker_id"
          required
          className="block border border-slate-300 rounded-xl p-3 w-full bg-slate-50 focus:bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="">اختر العامل من القائمة</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ يوم العمل *</label>
          <input
            name="work_date"
            type="date"
            required
            defaultValue={today}
            className="block border border-slate-300 rounded-xl p-3 w-full bg-slate-50 focus:bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">حالة الحضور *</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block border border-slate-300 rounded-xl p-3 w-full bg-slate-50 focus:bg-white text-slate-800 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="present">حاضر (يوم كامل)</option>
            <option value="half_day">نصف يوم عمل</option>
            <option value="quarter_day">ربع يوم عمل</option>
            <option value="absent">غائب</option>
          </select>
        </div>
      </div>

      {/* Overtime / Extra section: ONLY visible when worker is present, half_day, or quarter_day */}
      {isPresent ? (
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-4 transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-sm">⚡ إضافات العمل والإنتاج (اختياري):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الإضافة</label>
              <select
                name="extra_type"
                className="block border border-slate-300 rounded-xl p-2.5 w-full bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="amount">مبلغ بالجنيه (مباشر)</option>
                <option value="day_fraction">جزء من اليومية (مثل: 0.5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">قيمة الإضافة</label>
              <input
                name="extra_units"
                type="number"
                min="0"
                step="any"
                defaultValue="0"
                required
                className="block border border-slate-300 rounded-xl p-2.5 w-full bg-white text-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            * المبلغ بالجنيه يُضاف كقيمة نقدية ثابتة. جزء من اليومية (مثلاً 0.5) يُحسب بنصف يومية إضافية للعامل.
          </p>
        </div>
      ) : (
        <>
          <input type="hidden" name="extra_type" value="amount" />
          <input type="hidden" name="extra_units" value="0" />
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <span>ℹ️</span>
            <span>تم تسجيل العامل كـ <strong>غائب</strong> (لا يتم احتساب أي إضافات أو يومية لهذا اليوم).</span>
          </div>
        </>
      )}

      {state && (
        <div
          role={state.success ? "status" : "alert"}
          className={`p-4 rounded-xl text-sm font-medium border ${
            state.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        disabled={pending}
        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {pending ? "جارٍ تسجيل اليومية…" : "تسجيل يومية العمل"}
      </button>
    </form>
  );
}
