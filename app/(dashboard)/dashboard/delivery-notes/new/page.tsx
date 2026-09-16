import { randomUUID } from "node:crypto";
import Link from "next/link";
import { requirePermission } from "@/lib/access";
import { cairoToday } from "@/lib/delivery-notes";
import DeliveryForm from "./form";
export const metadata = { title: "إذن تسليم جديد" };
export default async function NewDeliveryNotePage() {
  await requirePermission(["sales", "production"]);
  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3"><h1>إذن تسليم جديد</h1><Link className="text-blue-700 underline" href="/dashboard/delivery-notes">سجل أذونات التسليم</Link></div>
    <p>إذن مستقل بدون فاتورة. أدخل الأصناف والكميات ثم احفظ الإذن لطباعته. لا يغيّر أرصدة الحسابات أو المخزون.</p>
    <DeliveryForm id={randomUUID()} today={cairoToday()} />
  </div>;
}
