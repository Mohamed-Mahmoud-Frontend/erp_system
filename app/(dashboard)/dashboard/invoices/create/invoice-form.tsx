"use client";

import { useActionState } from "react";
import { useTransition, useState } from "react";
import { createInvoiceAction, createDirectInvoiceAction } from "../actions";

export type OrderWithClient = {
  id: string;
  quantity: number;
  created_at: string;
  clients: {
    name: string;
    type: string;
    price_tier: string | null;
  } | null;
};

export type ClientSimple = {
  id: string;
  name: string;
  phone: string | null;
  type: string;
  price_tier: string | null;
};

export default function InvoiceForm({ orders, clients }: { orders: OrderWithClient[], clients: ClientSimple[] }) {
  const [tab, setTab] = useState<"existing" | "direct">("existing");
  
  const [existingState, existingAction] = useActionState(createInvoiceAction, null);
  const [isExistingPending, startExistingTransition] = useTransition();

  const [directState, directAction] = useActionState(createDirectInvoiceAction, null);
  const [isDirectPending, startDirectTransition] = useTransition();

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Direct Sale Toggle
  const [directClientMode, setDirectClientMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Direct Sale Items
  const [items, setItems] = useState([{ id: 1 }]);
  const addItem = () => setItems([...items, { id: Date.now() }]);
  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmitExisting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startExistingTransition(() => {
      existingAction(formData);
    });
  };

  const handleSubmitDirect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (directClientMode === "existing") {
      formData.set("client_id", selectedClientId);
    }
    startDirectTransition(() => {
      directAction(formData);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("existing")}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${tab === "existing" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
        >
          فاتورة بناءً على أمر شغل
        </button>
        <button
          type="button"
          onClick={() => setTab("direct")}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${tab === "direct" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
        >
          فاتورة بيع مباشر (بدون أمر شغل)
        </button>
      </div>

      <div className="p-6">
        {tab === "existing" && (
          orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500 mb-4">لا يوجد طلبات (أوامر شغل) معلقة بانتظار الفوترة.</p>
              <button onClick={() => setTab("direct")} className="text-blue-600 font-bold hover:underline">
                إنشاء فاتورة بيع مباشر بدلاً من ذلك؟
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitExisting} className="space-y-6">
              {existingState?.message && (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
                  {existingState.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الطلب <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="order_id"
                    required
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- اختر الطلب --</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.clients?.name} - {order.quantity} خزان الإجمالي - {new Date(order.created_at).toLocaleDateString("ar-EG")}
                      </option>
                    ))}
                  </select>
                  {existingState?.errors?.order_id && (
                    <p className="mt-1 text-sm text-red-600">{existingState.errors.order_id[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    السعر الإجمالي <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="total"
                      required
                      step="0.01"
                      min="0"
                      placeholder="مثال: 50000"
                      className="w-full px-4 py-2 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                      ج.م
                    </div>
                  </div>
                  {existingState?.errors?.total && (
                    <p className="mt-1 text-sm text-red-600">{existingState.errors.total[0]}</p>
                  )}
                </div>
              </div>

              {selectedOrder && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">تفاصيل الطلب المختار</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block mb-1">العميل</span>
                      <span className="font-medium">{selectedOrder.clients?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">شريحة السعر</span>
                      <span className="font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {selectedOrder.clients?.price_tier || "غير محدد"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">الكمية الإجمالية</span>
                      <span className="font-medium">{selectedOrder.quantity} خزان</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">تاريخ الطلب</span>
                      <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isExistingPending}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
                >
                  {isExistingPending ? "جاري الحفظ..." : "حفظ وإصدار الفاتورة"}
                </button>
              </div>
            </form>
          )
        )}

        {tab === "direct" && (
          <form onSubmit={handleSubmitDirect} className="space-y-6">
            {directState?.message && (
              <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
                {directState.message}
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                  <input 
                    type="radio" 
                    checked={directClientMode === "existing"} 
                    onChange={() => setDirectClientMode("existing")} 
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  اختيار عميل حالي
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                  <input 
                    type="radio" 
                    checked={directClientMode === "new"} 
                    onChange={() => setDirectClientMode("new")} 
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  إضافة عميل جديد
                </label>
              </div>

              {directClientMode === "existing" ? (
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
                      required={directClientMode === "new"}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {directState?.errors?.client_name && (
                      <p className="mt-1 text-sm text-red-600">{directState.errors.client_name[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      نوع العميل <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="client_type"
                      required={directClientMode === "new"}
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

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">الأصناف (الخزانات المباعة)</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  + إضافة صنف آخر
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
                        placeholder="مثال: خزان 500 لتر"
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
                          title="حذف الصنف"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {directState?.errors?.items && (
                <p className="mt-2 text-sm text-red-600">{directState.errors.items[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  السعر الإجمالي للجميع <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="total"
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                    ج.م
                  </div>
                </div>
                {directState?.errors?.total && (
                  <p className="mt-1 text-sm text-red-600">{directState.errors.total[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  المبلغ المدفوع (نقداً) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="paid_amount"
                    required
                    step="0.01"
                    min="0"
                    defaultValue={0}
                    className="w-full px-4 py-2 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                    ج.م
                  </div>
                </div>
                {directState?.errors?.paid_amount && (
                  <p className="mt-1 text-sm text-red-600">{directState.errors.paid_amount[0]}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isDirectPending || (directClientMode === 'existing' && !selectedClientId)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
              >
                {isDirectPending ? "جاري الحفظ..." : "حفظ وإصدار الفاتورة المباشرة"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
