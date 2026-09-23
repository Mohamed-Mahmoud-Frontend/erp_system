"use client";

import { useState } from "react";

const weekdays = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
const iso = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
const parse = (value: string) => { const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); };

export default function ArabicDatePicker({ name, value, onChange, label = "التاريخ" }: {
  name: string; value: string; onChange: (value: string) => void; label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => { const d = parse(value); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const chosen = parse(value);
  const first = (month.getDay() + 1) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const formatted = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(chosen);
  return <div className="relative">
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <input type="hidden" name={name} value={value} />
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-right text-slate-800">{formatted} <span aria-hidden="true">▾</span></button>
    {open && <div className="absolute z-30 mt-1 w-[min(22rem,calc(100vw-2rem))] max-w-full rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-2"><button type="button" aria-label="الشهر السابق" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded border px-3 py-1">→</button><strong>{new Intl.DateTimeFormat("ar-EG-u-nu-latn", { month: "long", year: "numeric" }).format(month)}</strong><button type="button" aria-label="الشهر التالي" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded border px-3 py-1">←</button></div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">{weekdays.map(day => <span key={day} className="whitespace-nowrap py-2 text-[11px] font-bold text-slate-600">{day}</span>)}{Array.from({length:first},(_,i)=><span key={"empty"+i}/>)}
        {Array.from({length:days},(_,i)=>{const next=iso(new Date(month.getFullYear(),month.getMonth(),i+1));return <button key={next} type="button" aria-label={new Intl.DateTimeFormat("ar-EG",{weekday:"long",day:"numeric",month:"long"}).format(parse(next))} onClick={()=>{onChange(next);setOpen(false)}} className={next===value?"rounded-lg bg-blue-600 py-2 font-bold text-white":"rounded-lg py-2 hover:bg-blue-50"}>{i+1}</button>})}</div>
    </div>}
  </div>;
}