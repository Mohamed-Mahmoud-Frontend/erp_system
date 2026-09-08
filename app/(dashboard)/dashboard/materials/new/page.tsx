"use client";

import { useActionState } from "react";
import { useTransition } from "react";
import Link from "next/link";
import { createMaterialAction } from "../actions";

export default function NewMaterialPage() {
  const [state, action] = useActionState(createMaterialAction, null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إضافة مادة جديدة</h1>
          <p className="text-slate-500 mt-1">تعريف مادة خام جديدة في المخزون</p>
        </div>
        <Link
          href="/dashboard/materials"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة للمخزون
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {state?.message && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
              {state.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              اسم / نوع المادة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="type"
              required
              placeholder="مثال: بودرة بولي إيثيلين"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {state?.errors?.type && (
              <p className="mt-1 text-sm text-red-600">{state.errors.type[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                وحدة القياس <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="kg">كيلوجرام (kg)</option>
                <option value="ton">طن (ton)</option>
              </select>
              {state?.errors?.unit && (
                <p className="mt-1 text-sm text-red-600">{state.errors.unit[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الحد الأدنى للتنبيه <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="min_threshold"
                required
                min="0"
                step="any"
                defaultValue="0"
                placeholder="مثال: 0.25 (ربع طن) أو 250 (كجم)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {state?.errors?.min_threshold && (
                <p className="mt-1 text-sm text-red-600">{state.errors.min_threshold[0]}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
            >
              {isPending ? "جاري الحفظ..." : "حفظ المادة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
