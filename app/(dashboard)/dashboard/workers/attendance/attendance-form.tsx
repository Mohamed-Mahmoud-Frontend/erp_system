"use client";

import { useActionState } from "react";
import { useTransition, useState } from "react";
import { recordAttendanceAction } from "../actions";

export default function AttendanceForm({ workers }: { workers: { id: string; name: string }[] }) {
  const [state, action] = useActionState(recordAttendanceAction, null);
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<"present" | "absent" | "half_day">("present");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {state?.message && !state.success && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
            {state.message}
          </div>
        )}
        {state?.success && (
          <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm">
            {state.message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            العامل <span className="text-red-500">*</span>
          </label>
          <select
            name="worker_id"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- اختر العامل --</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          {state?.errors?.worker_id && (
            <p className="mt-1 text-sm text-red-600">{state.errors.worker_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            التاريخ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="work_date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {state?.errors?.work_date && (
            <p className="mt-1 text-sm text-red-600">{state.errors.work_date[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            حالة الحضور <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label
              className={`flex items-center justify-center px-2 py-3 border rounded-lg cursor-pointer transition-colors ${
                status === "present"
                  ? "bg-green-50 border-green-600 text-green-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="present"
                checked={status === "present"}
                onChange={() => setStatus("present")}
                className="sr-only"
              />
              حاضر
            </label>
            <label
              className={`flex items-center justify-center px-2 py-3 border rounded-lg cursor-pointer transition-colors ${
                status === "half_day"
                  ? "bg-orange-50 border-orange-600 text-orange-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="half_day"
                checked={status === "half_day"}
                onChange={() => setStatus("half_day")}
                className="sr-only"
              />
              نصف يوم
            </label>
            <label
              className={`flex items-center justify-center px-2 py-3 border rounded-lg cursor-pointer transition-colors ${
                status === "absent"
                  ? "bg-red-50 border-red-600 text-red-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="absent"
                checked={status === "absent"}
                onChange={() => setStatus("absent")}
                className="sr-only"
              />
              غائب
            </label>
          </div>
          {state?.errors?.status && (
            <p className="mt-1 text-sm text-red-600">{state.errors.status[0]}</p>
          )}
        </div>

        {status === "present" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              إنتاج إضافي (بالقطعة / الخزان)
            </label>
            <input
              type="number"
              name="extra_units"
              min="0"
              defaultValue="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              إذا قام العامل بإنتاج كميات إضافية تحسب كحوافز، أدخل العدد هنا.
            </p>
            {state?.errors?.extra_units && (
              <p className="mt-1 text-sm text-red-600">{state.errors.extra_units[0]}</p>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
          >
            {isPending ? "جاري الحفظ..." : "تسجيل اليومية"}
          </button>
        </div>
      </form>
    </div>
  );
}
