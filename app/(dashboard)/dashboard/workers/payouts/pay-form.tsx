"use client";
import { useActionState } from "react";
import { payWorkersAction } from "./actions";
export default function PayForm({ workers, weekStart, all = false }: { workers: string[]; weekStart: string; all?: boolean }) {
  const [state, action, pending] = useActionState(payWorkersAction, null);
  return <form action={action} aria-label={all ? "صرف الكل" : "صرف العامل"} className="space-y-2">
    <input type="hidden" name="week_start" value={weekStart} />{workers.map(id => <input key={id} type="hidden" name="worker_id" value={id} />)}
    <button disabled={pending || workers.length === 0} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40">{pending ? "جارٍ التسجيل…" : all ? `صرف الكل (${workers.length})` : "صرف العامل"}</button>
    {state && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
  </form>;
}
