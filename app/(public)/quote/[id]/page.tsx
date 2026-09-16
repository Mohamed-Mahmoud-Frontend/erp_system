import type { Metadata } from "next";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createPublicQuotationClient } from "@/lib/supabase/public-quotation";
import { parseQuotationItems } from "@/lib/quotations/items";
import { notFound } from "next/navigation";
import QuoteClient from "./QuoteClient";

export const metadata: Metadata = {
  title: "عرض سعر - بولي تكس",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

export default async function QuotePage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  if (token !== undefined && !z.uuid().safeParse(token).success) notFound();

  const supabase = typeof token === "string"
    ? createPublicQuotationClient(token)
    : await createClient();
  const { data: quotation, error } = await supabase.from("quotations")
    .select("guest_name, guest_phone, created_at, parsed_items")
    .eq("id", id).maybeSingle();

  if (error) throw new Error("تعذر تحميل عرض السعر");
  if (!quotation) notFound();

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <QuoteClient data={{ ...quotation, parsed_items: parseQuotationItems(quotation.parsed_items) }} />
    </div>
  );
}
