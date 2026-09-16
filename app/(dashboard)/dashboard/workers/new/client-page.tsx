"use client";

import { useActionState } from "react";
import { useTransition } from "react";
import Link from "next/link";
import { createWorkerAction } from "../actions";

export default function NewWorkerPage() {

  const [state, action] = useActionState(createWorkerAction, null);
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
          <h1 className="text-2xl font-bold text-slate-800">إضافة عامل جديد</h1>
          <p className="text-slate-500 mt-1">تسجيل بيانات عامل جديد في المصنع</p>
        </div>
        <Link
          href="/dashboard/workers"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة للعمال
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
              اسم العامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              الأجر اليومي <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="daily_wage"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                ج.م
              </div>
            </div>
            {state?.errors?.daily_wage && (
              <p className="mt-1 text-sm text-red-600">{state.errors.daily_wage[0]}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
            >
              {isPending ? "جاري الحفظ..." : "حفظ بيانات العامل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
