import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/access";
import { deliveryItemSchema, deliveryNumber } from "@/lib/delivery-notes";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./print-button";
import BrandLogo from "../../../brand-logo";
import styles from "./print.module.css";
export const metadata = { title: "إذن تسليم" };
export default async function DeliveryNoteDetails({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(["sales", "production"]);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const db = await createClient();
  const { data: note, error } = await db.from("delivery_notes").select("*").eq("id", id).maybeSingle();
  if (error) return <p role="alert">تعذر تحميل إذن التسليم. أعد المحاولة.</p>;
  if (!note) notFound();
  const items = z.array(deliveryItemSchema).min(1).max(100).safeParse(note.items);
  if (!items.success) return <p role="alert">بيانات أصناف الإذن غير صالحة. تواصل مع مسؤول النظام.</p>;
  return <div className={styles.page}>
    <div className={styles.toolbar + " flex flex-wrap justify-between gap-3 mb-6"}><Link className="text-blue-700 underline" href="/dashboard/delivery-notes">العودة لأذونات التسليم</Link><PrintButton /></div>
    <article className={styles.document} dir="rtl">
      <header className={styles.heading}><div className="document-identity"><BrandLogo className="document-logo" eager /><p>مميز · إدارة المصنع</p><h1>إذن تسليم</h1><p>مستند تسليم أصناف</p></div><div><strong dir="ltr">{deliveryNumber(note.note_number)}</strong><p>تاريخ التسليم: {note.delivery_date}</p></div></header>
      <dl className={styles.details}>
        <div><dt>العميل / جهة التسليم</dt><dd>{note.customer_name}</dd></div>
        <div><dt>اسم المستلم</dt><dd>{note.recipient_name}</dd></div>
        <div><dt>هاتف المستلم</dt><dd>{note.recipient_phone || "—"}</dd></div>
        <div><dt>عنوان التسليم</dt><dd>{note.delivery_address || "—"}</dd></div>
        <div><dt>اسم السائق</dt><dd>{note.driver_name || "—"}</dd></div>
        <div><dt>رقم السيارة</dt><dd>{note.vehicle_number || "—"}</dd></div>
      </dl>
      <table className={styles.items}><thead><tr><th>م</th><th>الصنف / البيان</th><th>الكمية</th><th>الوحدة</th></tr></thead><tbody>{items.data.map((item, index) => <tr key={index}><td>{index + 1}</td><td>{item.description}</td><td>{item.quantity.toLocaleString("ar-EG", { maximumFractionDigits: 3 })}</td><td>{item.unit}</td></tr>)}</tbody></table>
      {note.notes && <section className={styles.notes}><h2>ملاحظات</h2><p>{note.notes}</p></section>}
      <section className={styles.signatures}><p>أقر باستلام الأصناف والكميات المبينة أعلاه.</p><div><span>المسلّم<br /><br />التوقيع: ....................</span><span>المستلم: {note.recipient_name}<br /><br />التوقيع: ....................</span><span>ختم المصنع<br /><br />....................</span></div></section>
      <footer className={styles.footer}>إذن تسليم مستقل · لا يُعد فاتورة أو إيصال سداد</footer>
    </article>
  </div>;
}
