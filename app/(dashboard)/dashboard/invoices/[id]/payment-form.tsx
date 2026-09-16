"use client";

import { useActionState, useEffect } from "react";
import { useTransition, useState } from "react";
import { recordPaymentAction } from "./actions";

export default function PaymentForm({ invoiceId, balanceDue }: { invoiceId: string, balanceDue: number }) {
  const [state, action] = useActionState(recordPaymentAction, null);
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState("cash");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  useEffect(() => {
    if (state?.success) {
      // Form resets naturally if we unmount, or we can just show success.
      // Next.js revalidatePath will refresh the page and pass new balanceDue down.
    }
  }, [state]);

  if (balanceDue <= 0) {
    return (
      <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-200 text-center">
        <h3 className="text-lg font-bold mb-2">لا توجد دفعة مستحقة</h3>
        <p>لا يوجد رصيد مستحق على هذه الفاتورة.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6">تسجيل دفعة جديدة</h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="invoice_id" value={invoiceId} />

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
            طريقة الدفع
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["cash", "transfer", "cheque"].map((m) => (
              <label
                key={m}
                className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                  method === m
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  className="sr-only"
                />
                {m === "cash" ? "نقدي" : m === "transfer" ? "تحويل بنكي" : "شيك"}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            المبلغ المدفوع (المتبقي: {balanceDue.toLocaleString()} ج.م)
          </label>
          <div className="relative">
            <input
              type="number"
              name="amount"
              required
              step="0.01"
              min="0.01"
              max={balanceDue}
              defaultValue={balanceDue}
              className="w-full px-4 py-2 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
              ج.م
            </div>
          </div>
          {state?.errors?.amount && (
            <p className="mt-1 text-sm text-red-600">{state.errors.amount[0]}</p>
          )}
        </div>

        {method === "cheque" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              تاريخ استحقاق الشيك <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="cheque_due_date"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {state?.errors?.cheque_due_date && (
              <p className="mt-1 text-sm text-red-600">{state.errors.cheque_due_date[0]}</p>
            )}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
          >
            {isPending ? "جاري التسجيل..." : "تأكيد الدفع"}
          </button>
        </div>
      </form>
    </div>
  );
}
