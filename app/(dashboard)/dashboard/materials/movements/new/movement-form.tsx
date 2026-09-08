"use client";

import { useActionState } from "react";
import { useTransition, useState } from "react";
import { recordMovementAction } from "../../actions";

type Material = {
  id: string;
  type: string;
  unit: string;
  stock_qty: number;
};

type Supplier = {
  id: string;
  name: string;
};

export default function MovementForm({
  materials,
  suppliers,
}: {
  materials: Material[];
  suppliers: Supplier[];
}) {
  const [state, action] = useActionState(recordMovementAction, null);
  const [isPending, startTransition] = useTransition();

  const [direction, setDirection] = useState<"in" | "out">("in");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

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
        {state?.message && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
            {state.message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            نوع الحركة <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                direction === "in"
                  ? "bg-green-50 border-green-600 text-green-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="direction"
                value="in"
                checked={direction === "in"}
                onChange={() => setDirection("in")}
                className="sr-only"
              />
              وارد (إضافة للمخزون)
            </label>
            <label
              className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                direction === "out"
                  ? "bg-red-50 border-red-600 text-red-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="direction"
                value="out"
                checked={direction === "out"}
                onChange={() => setDirection("out")}
                className="sr-only"
              />
              صادر (سحب من المخزون)
            </label>
          </div>
          {state?.errors?.direction && (
            <p className="mt-1 text-sm text-red-600">{state.errors.direction[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            المادة الخام <span className="text-red-500">*</span>
          </label>
          <select
            name="material_id"
            required
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- اختر المادة --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.type} (الرصيد: {m.stock_qty} {m.unit})
              </option>
            ))}
          </select>
          {state?.errors?.material_id && (
            <p className="mt-1 text-sm text-red-600">{state.errors.material_id[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              الكمية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="qty"
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                {selectedMaterial?.unit || "وحدة"}
              </div>
            </div>
            {state?.errors?.qty && (
              <p className="mt-1 text-sm text-red-600">{state.errors.qty[0]}</p>
            )}
          </div>

          {direction === "in" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                المورد (اختياري)
              </label>
              <select
                name="supplier_id"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- مخزون افتتاحي / غير محدد --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {direction === "in" && (
          <div>
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                name="is_return"
                value="true"
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">هذا المرتجع من طلب تصنيع سابق</span>
            </label>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50"
          >
            {isPending ? "جاري التسجيل..." : "تأكيد الحركة"}
          </button>
        </div>
      </form>
    </div>
  );
}
