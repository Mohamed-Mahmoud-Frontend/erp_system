import {requirePermission} from '@/lib/access';
import {createClient} from '@/lib/supabase/server';
import {money} from '@/lib/billing';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import TransactionForm from './transaction-form';
export default async function SupplierDetails({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{page?:string}>}){
 await requirePermission('suppliers');const {id}=await params;const page=Number((await searchParams).page??'1');if(!Number.isSafeInteger(page)||page<1)return <p role="alert">رقم صفحة غير صالح.</p>;
 const db=await createClient();const supplier=await db.from('supplier_balances').select('*').eq('id',id).maybeSingle();if(supplier.error)return <p role="alert">تعذر تحميل المورد.</p>;if(!supplier.data)notFound();
 const tx=await db.from('supplier_transactions').select('*',{count:'exact'}).eq('supplier_id',id).order('created_at',{ascending:false}).order('id').range((page-1)*50,page*50-1);
 return <div className="max-w-4xl mx-auto space-y-5"><h1 className="text-2xl font-bold">حساب المورد: {supplier.data.name}</h1><p>الرصيد الافتتاحي {money(supplier.data.opening_balance)} ج.م</p><p className="text-xl font-bold">الرصيد الحالي: {supplier.data.balance>=0?'له':'عليه'} {money(Math.abs(supplier.data.balance))} ج.م</p><TransactionForm id={id}/><h2 className="font-bold">المعاملات — صفحة {page}</h2>{tx.error?<p role="alert">تعذر تحميل معاملات المورد.</p>:<>{tx.data.length===0&&<p>لا توجد معاملات في هذه الصفحة.</p>}{tx.data.map(row=><p className="border-t p-3" key={row.id}>{row.type==='invoice'?'فاتورة مورد +':'سداد −'} {money(row.amount)} ج.م — {new Date(row.created_at).toLocaleString('ar-EG',{timeZone:'Africa/Cairo'})}</p>)}<div className="flex gap-4">{page>1&&<Link className="underline" href={`?page=${page-1}`}>السابق</Link>}{(tx.count??0)>page*50&&<Link className="underline" href={`?page=${page+1}`}>التالي</Link>}</div></>}</div>;
}
