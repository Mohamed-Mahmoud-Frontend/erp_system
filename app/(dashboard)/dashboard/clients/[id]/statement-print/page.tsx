import Link from "next/link";
import {requirePermission} from "@/lib/access";
import ClientStatement from "../statement";
import PrintButton from "./print-button";
export const metadata={title:"طباعة كشف حساب العميل"};
export default async function StatementPrintPage({params}:{params:Promise<{id:string}>}){
 await requirePermission("sales"); const {id}=await params;
 return <div className="client-statement-print mx-auto max-w-5xl space-y-5 bg-white p-6"><div className="flex items-center justify-between gap-3 print:hidden"><Link className="underline" href={`/dashboard/clients/${id}`}>العودة للعميل</Link><PrintButton/></div><ClientStatement clientId={id}/></div>;
}