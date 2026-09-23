"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import ArabicDatePicker from "../../arabic-date-picker";

export default function DateNavigation({ date }: { date: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <fieldset disabled={pending} className="max-w-sm" aria-busy={pending}>
    <ArabicDatePicker key={date} name="date" value={date} label="اليوم المختار" onChange={next => {
      startTransition(() => router.push(`/dashboard/workers/attendance?date=${next}`, { scroll: false }));
    }} />
    {pending && <p role="status" className="mt-2 text-sm text-slate-500">جارٍ عرض اليومية…</p>}
  </fieldset>;
}