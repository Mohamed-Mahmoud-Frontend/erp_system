import {allowed,requirePermission} from '@/lib/access';
import {createClient} from '@/lib/supabase/server';
import {money} from '@/lib/billing';
import {cairoToday} from '@/lib/payroll';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import TransactionForm from './transaction-form';

type Activity = {id:string; date:string; kind:'money'|'material'; title:string; detail:string; amount?:number};
export default async function SupplierDetails({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{page?:string;filter?:string}>}){
 const access=await requirePermission('suppliers');
 const {id}=await params; const query=await searchParams;
 const page=Number(query.page??'1'); const filter=query.filter==='money'?'money':'all';
 if(!Number.isSafeInteger(page)||page<1)return <p role="alert">رقم صفحة غير صالح.</p>;
 const db=await createClient();
 const supplier=await db.from('supplier_balances').select('*').eq('id',id).maybeSingle();
 if(supplier.error)return <p role="alert">تعذر تحميل المورد.</p>;
 if(!supplier.data)notFound();
 const [transactions,movements]=await Promise.all([
  db.from('supplier_transactions').select('id,type,amount,created_at,occurred_on,reference,description').eq('supplier_id',id).order('created_at',{ascending:false}).limit(1000),
  filter==='all'&&allowed(access,'production')?db.from('material_movements').select('id,direction,is_return,qty,created_at,materials(type,unit)').eq('supplier_id',id).order('created_at',{ascending:false}).limit(1000):Promise.resolve({data:[],error:null}),
 ]);
 const purchases=Number(supplier.data.purchases);
 const payments=Number(supplier.data.payments); const activity:Activity[]=[];
 for(const row of transactions.data??[])activity.push({id:row.id,date:row.occurred_on,kind:'money',title:row.type==='invoice'?'فاتورة مورد':'سداد للمورد',detail:[row.reference,row.description].filter(Boolean).join(' — ')|| (row.type==='invoice'?'زيادة المستحق':'تخفيض المستحق'),amount:Number(row.amount)});
 for(const row of movements.data??[]){const material=Array.isArray(row.materials)?row.materials[0]:row.materials;activity.push({id:row.id,date:row.created_at,kind:'material',title:row.is_return?'مرتجع مادة':row.direction==='in'?'توريد مادة':'صرف مادة',detail:`${material?.type??'مادة غير معروفة'} — ${row.qty} ${material?.unit==='ton'?'طن':'كجم'}`});}
 activity.sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
 const shown=activity.slice((page-1)*50,page*50);
 const href=(next:number)=>`?filter=${filter}&page=${next}`;
 return <div className="max-w-5xl mx-auto space-y-5"><h1 className="text-2xl font-bold">حساب المورد: {supplier.data.name}</h1>
  <div className="grid gap-3 sm:grid-cols-2"><p className="rounded-xl border bg-white p-4">الرصيد الافتتاحي <strong>{money(supplier.data.opening_balance)} ج.م</strong></p><p className="rounded-xl border bg-white p-4">الرصيد الحالي: <strong>{supplier.data.balance>=0?'له':'عليه'} {money(Math.abs(supplier.data.balance))} ج.م</strong></p></div>
  <div className="grid gap-3 sm:grid-cols-3"><p className="rounded-xl border bg-white p-4">مشتريات مسجلة<br/><strong>{money(purchases)} ج.م</strong></p><p className="rounded-xl border bg-white p-4">مدفوع للمورد<br/><strong>{money(payments)} ج.م</strong></p><p className="rounded-xl border border-blue-300 bg-blue-50 p-4">الباقي الآن<br/><strong>{supplier.data.balance>=0?'علينا للمورد':'لنا عند المورد'} {money(Math.abs(supplier.data.balance))} ج.م</strong></p></div>
  <TransactionForm id={id} today={cairoToday()}/>
  <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">سجل المورد</h2><div className="flex gap-2"><Link href="?filter=all&page=1" aria-current={filter==='all'?'page':undefined} className="rounded border px-3 py-2">كل المعاملات</Link><Link href="?filter=money&page=1" aria-current={filter==='money'?'page':undefined} className="rounded border px-3 py-2">الفلوس فقط</Link></div></div>
  {filter==='all'&&!allowed(access,'production')&&<p className="text-sm text-amber-800">حركات الخامات تحتاج صلاحية الإنتاج؛ المعاملات المالية متاحة أدناه.</p>}  {(transactions.error||movements.error)&&<p role="alert">تعذر تحميل بعض معاملات المورد؛ السجل غير مكتمل حاليًا.</p>}
  <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right"><thead><tr><th className="p-3">التاريخ والوقت</th><th className="p-3">النوع</th><th className="p-3">التفاصيل</th><th className="p-3">المبلغ</th></tr></thead><tbody>{shown.map(row=><tr key={`${row.kind}-${row.id}`} className="border-t"><td className="p-3 whitespace-nowrap">{row.date.length===10?row.date:new Date(row.date).toLocaleString('ar-EG',{timeZone:'Africa/Cairo'})}</td><td className="p-3">{row.title}</td><td className="p-3">{row.detail}</td><td className="p-3 whitespace-nowrap">{row.amount===undefined?'—':`${money(row.amount)} ج.م`}</td></tr>)}</tbody></table>{shown.length===0&&<p className="p-4">لا توجد معاملات في هذه الصفحة.</p>}</div>
  <div className="flex gap-4">{page>1&&<Link className="underline" href={href(page-1)}>السابق</Link>}{activity.length>page*50&&<Link className="underline" href={href(page+1)}>التالي</Link>}</div>
  {activity.length>=1000&&<p className="text-amber-800">السجل طويل؛ المعروض أحدث 1000 معاملة من كل نوع.</p>}</section></div>;
}