"use client";

import { useActionState } from "react";
import { useTransition } from "react";
import { submitQuoteAction } from "./actions";
import Link from "next/link";

export default function QuoteForm() {
  const [state, action] = useActionState(submitQuoteAction, null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">تم الإرسال بنجاح</h3>
        <p className="text-slate-600 mb-8">{state.message}</p>
        <Link
          href="/"
          className="inline-flex px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state?.message && !state.success && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          {state.message}
        </div>
      )}

      {/* Honeypot field (hidden) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website URL</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          الاسم بالكامل <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="guest_name"
          required
          placeholder="اكتب اسمك أو اسم شركتك"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white"
        />
        {state?.errors?.guest_name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.guest_name[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          رقم الهاتف <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="guest_phone"
          required
          dir="ltr"
          placeholder="01xxxxxxxxx"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white text-right"
        />
        {state?.errors?.guest_phone && (
          <p className="mt-1 text-sm text-red-600">{state.errors.guest_phone[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          تفاصيل الطلب <span className="text-red-500">*</span>
        </label>
        <textarea
          name="details"
          required
          rows={5}
          placeholder="اذكر السعة المطلوبة، الكمية، وأي مواصفات خاصة..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white resize-none"
        />
        {state?.errors?.details && (
          <p className="mt-1 text-sm text-red-600">{state.errors.details[0]}</p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
        >
          {isPending ? "جاري الإرسال..." : "إرسال طلب عرض السعر"}
        </button>
      </div>
    </form>
  );
}
