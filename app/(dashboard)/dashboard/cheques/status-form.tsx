"use client";
import { useActionState } from "react";
import { updateChequeAction } from "./actions";
export default function ChequeStatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(updateChequeAction, null);
  return <form action={action} className="space-y-2"><input name="id" type="hidden" value={id} />
    <div className="flex gap-2"><button name="status" value="cleared" disabled={pending || status === "cleared"} className="border rounded px-3 py-2 text-green-800 disabled:opacity-40">تم التحصيل</button>
      <button name="status" value="bounced" disabled={pending || status === "bounced"} className="border rounded px-3 py-2 text-red-800 disabled:opacity-40">رفض الشيك</button></div>
    {state && <p role={state.success ? "status" : "alert"} className={state.success ? "text-green-700" : "text-red-700"}>{state.message}</p>}
  </form>;
}
