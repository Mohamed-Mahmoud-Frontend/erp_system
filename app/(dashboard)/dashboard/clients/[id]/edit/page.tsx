import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type ClientFormValues } from "@/lib/validations/client";
import ClientForm from "../../client-form";

export const metadata = {
  title: "تعديل بيانات العميل | نظام إدارة المصنع",
};

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clients/${id}`} className="text-slate-500 hover:text-slate-800 transition-colors">
          &rarr; عودة لبيانات العميل
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">تعديل بيانات العميل</h1>
      </div>
      
      <ClientForm initialData={client as unknown as Partial<ClientFormValues>} clientId={id} />
    </div>
  );
}
