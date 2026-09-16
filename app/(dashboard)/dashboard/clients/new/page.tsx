import { requirePermission } from "@/lib/access";
import Link from "next/link";
import ClientForm from "../client-form";

export const metadata = {
  title: "إضافة عميل جديد | نظام إدارة المصنع",
};

export default async function NewClientPage() {
  await requirePermission("sales");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="text-slate-500 hover:text-slate-800 transition-colors">
          &rarr; عودة للعملاء
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">إضافة عميل جديد</h1>
      </div>
      
      <ClientForm />
    </div>
  );
}
