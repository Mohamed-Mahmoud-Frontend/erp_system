"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormValues, clientTypes } from "@/lib/validations/client";
import { useTransition, useState } from "react";
import { createClientAction, updateClientAction } from "./actions";

export default function ClientForm({ initialData, clientId }: { initialData?: Partial<ClientFormValues>; clientId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "individual",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      price_tier: initialData?.price_tier || "",
      credit_days: initialData?.credit_days || 0,
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      let result;
      if (clientId) {
        result = await updateClientAction(clientId, null, formData);
      } else {
        result = await createClientAction(null, formData);
      }

      if (result?.message) {
        setServerError(result.message);
      }
    });
  };

  const typeLabels: Record<string, string> = {
    trader: "تاجر",
    contractor: "مقاول",
    individual: "فرد",
    company: "شركة",
    office: "مكتب",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{serverError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">اسم العميل *</label>
          <input
            {...register("name")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="أدخل اسم العميل"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">النوع *</label>
          <select
            {...register("type")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {clientTypes.map((type) => (
              <option key={type} value={type}>{typeLabels[type]}</option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">الهاتف</label>
          <input
            {...register("phone")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>

        {/* Credit Days */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">فترة الائتمان (أيام) *</label>
          <input
            type="number"
            {...register("credit_days", { valueAsNumber: true })}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left"
            dir="ltr"
          />
          <p className="text-xs text-slate-500">ادخل 0 للعملاء النقديين</p>
          {errors.credit_days && <p className="text-red-500 text-xs">{errors.credit_days.message}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">العنوان</label>
          <input
            {...register("address")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="أدخل عنوان العميل"
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
        </div>

        {/* Price Tier */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">شريحة الأسعار</label>
          <input
            {...register("price_tier")}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="مثال: جملة، قطاعي، خصم خاص (اختياري)"
          />
          {errors.price_tier && <p className="text-red-500 text-xs">{errors.price_tier.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
        >
          {isPending ? "جاري الحفظ..." : "حفظ بيانات العميل"}
        </button>
      </div>
    </form>
  );
}
