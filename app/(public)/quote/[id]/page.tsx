import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import QuoteClient from "./QuoteClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("quotations").select("guest_name").eq("id", id).single();
  
  return {
    title: `عرض سعر - ${data?.guest_name || "بولي تكس"}`,
  };
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quotation, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !quotation) {
    console.error("Quote fetch error:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <QuoteClient data={quotation} />
    </div>
  );
}
