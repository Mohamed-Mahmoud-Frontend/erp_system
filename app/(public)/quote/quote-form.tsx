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
      <div className="text-center py-10 sm:py-12">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-inner">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">تم استلام طلبك بنجاح</h3>
        <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          {state.message || "شكراً لتواصلك معنا. سيقوم فريق المبيعات بمراجعة التفاصيل والتواصل معك هاتفياً في أقرب وقت."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {state?.message && !state.success && (
        <div role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl text-sm border border-red-200">
          {state.message}
        </div>
      )}

      {/* Honeypot field (hidden) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website URL</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="guest_name" className="block text-sm font-bold text-slate-700 mb-2">
          الاسم بالكامل أو اسم الشركة <span className="text-red-500">*</span>
        </label>
        <input
          id="guest_name"
          type="text"
          name="guest_name"
          required
          placeholder="اكتب اسمك أو اسم شركتك"
          className="w-full px-4 py-3 text-base text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white placeholder:text-slate-400 min-h-[46px]"
        />
        {state?.errors?.guest_name && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{state.errors.guest_name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="guest_phone" className="block text-sm font-bold text-slate-700 mb-2">
          رقم الهاتف / الواتساب <span className="text-red-500">*</span>
        </label>
        <input
          id="guest_phone"
          type="tel"
          name="guest_phone"
          required
          dir="ltr"
          placeholder="01xxxxxxxxx"
          className="w-full px-4 py-3 text-base text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white placeholder:text-slate-400 text-right min-h-[46px]"
        />
        {state?.errors?.guest_phone && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{state.errors.guest_phone[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-bold text-slate-700 mb-2">
          تفاصيل الخزانات والمواصفات المطلوبة <span className="text-red-500">*</span>
        </label>
        <textarea
          id="details"
          name="details"
          required
          rows={4}
          placeholder="اذكر السعة المطلوبة (مثلاً: 1000 لتر أو 2000 لتر)، الكمية، مكان التوصيل، وأي مواصفات خاصة..."
          className="w-full px-4 py-3 text-base text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white placeholder:text-slate-400 resize-none leading-relaxed"
        />
        {state?.errors?.details && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{state.errors.details[0]}</p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[48px] px-6 py-3.5 bg-blue-600 text-white font-bold text-base rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>جارٍ إرسال الطلب…</span>
            </>
          ) : (
            <span>إرسال طلب عرض السعر الآن</span>
          )}
        </button>
      </div>
    </form>
  );
}
