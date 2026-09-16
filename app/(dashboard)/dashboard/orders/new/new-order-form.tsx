"use client";

import { useActionState, useState } from "react";
import { useTransition } from "react";
import { createOrderAction } from "./actions";

type ClientSimple = {
  id: string;
  name: string;
  phone: string | null;
  type: string;
  price_tier: string | null;
};

export default function NewOrderForm({ clients, canCreateClient=true }: { clients: ClientSimple[]; canCreateClient?: boolean }) {
  const [state, action] = useActionState(createOrderAction, null);
  const [isPending, startTransition] = useTransition();

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const [items, setItems] = useState([{ id: 1 }]);

  const addItem = () => setItems([...items, { id: Date.now() }]);
  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (clientMode === "existing") {
      formData.set("client_id", selectedClientId);
    }
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state?.message && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          {state.message}
        </div>
      )}

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
            <input 
              type="radio" 
              checked={clientMode === "existing"} 
              onChange={() => setClientMode("existing")} 
              className="text-blue-600 focus:ring-blue-500"
            />
            اختيار عميل حالي
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
            <input 
              type="radio" 
              checked={clientMode === "new"} 
              disabled={!canCreateClient}
              onChange={() => setClientMode("new")} 
              className="text-blue-600 focus:ring-blue-500"
            />
            إضافة عميل جديد
          </label>
        </div>

        {clientMode === "existing" ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              العميل <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- اختر العميل --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === 'trader' ? 'تاجر' : c.type === 'contractor' ? 'مقاول' : c.type === 'company' ? 'شركة' : 'فرد'})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                اسم العميل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="client_name"
                required={clientMode === "new"}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                نوع العميل <span className="text-red-500">*</span>
              </label>
              <select
                name="client_type"
                required={clientMode === "new"}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">فرد</option>
                <option value="trader">تاجر</option>
                <option value="contractor">مقاول</option>
                <option value="company">شركة</option>
                <option value="office">مكتب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                name="client_phone"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">تفاصيل الطلب (الخزانات)</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors"
          >
            + إضافة سعة أخرى
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  السعة والمواصفات <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="capacity[]"
                  required
                  placeholder="مثال: خزان 500 لتر - 3 طبقات"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  الكمية <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity[]"
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
                />
              </div>
              <div className="pt-5">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف البند"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {state?.errors?.items && (
          <p className="mt-2 text-sm text-red-600">{state.errors.items[0]}</p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending || (clientMode === 'existing' && !selectedClientId)}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
        >
          {isPending ? "جاري الإضافة..." : "حفظ الطلب الجديد"}
        </button>
      </div>
    </form>
  );
}
