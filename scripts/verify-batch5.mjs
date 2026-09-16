import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createTestDb} from './test-db.mjs';
import {moduleLoader} from './test-modules.mjs';
import {renderToStaticMarkup} from 'react-dom/server';
const db=await createTestDb();
try {
 await db.exec('SET ROLE authenticated');
 await db.exec(await readFile('scripts/verify-batch5.sql','utf8'));
 console.log('SQL: 250 -> wage edit 300 -> attendance correction 750; paid snapshot 750/500 preserved; void + correct ->175 repaid; original retained. Return900 -> void1000; original statement row retained with credit0. Raw duplicate, paid attendance, unvoid and DELETE rejected.');
 const cases=[['page.tsx','materials'],['page.tsx','quotations'],['materials/page.tsx','materials'],['materials/movements/new/page.tsx','materials'],['materials/movements/new/page.tsx','supplier_directory'],['suppliers/page.tsx','supplier_balances'],['quotations/page.tsx','quotations'],['invoices/create/page.tsx','clients'],['invoices/create/page.tsx','invoices'],['invoices/create/page.tsx','orders'],['clients/[id]/edit/page.tsx','clients']];
 const evidence=[];
 for(const [file,failingTable] of cases){
  const client={auth:{getUser:async()=>({data:{user:{email:'test@example.com'}},error:null})},from(table){let q;const result={data:table===failingTable?null:[],error:table===failingTable?{message:'Deliberate SELECT failure'}:null};q=new Proxy({}, {get(_,key){if(key==='then')return (yes,no)=>Promise.resolve(result).then(yes,no);return ()=>q;}});return q;}};
  const load=moduleLoader({'@/lib/supabase/server':{createClient:async()=>client},'next/navigation':{notFound(){throw Error('Failure incorrectly became 404');}},'./invoice-form':()=>null,'../../client-form':()=>null,'./movement-form':()=>null});
  const html=renderToStaticMarkup(await load(`app/(dashboard)/dashboard/${file}`).default({params:Promise.resolve({id:'10000000-0000-4000-8000-000000000001'}),searchParams:Promise.resolve({})}));
  assert.match(html,/role="alert"/);if(failingTable==='materials')assert.doesNotMatch(html,/المخزون بوضع ممتاز/);
  evidence.push({file:`app/(dashboard)/dashboard/${file}`,failed_query:failingTable,visible_error:true});
 }
 await mkdir('audit/batch5',{recursive:true});await writeFile('audit/batch5/select-failures.json',JSON.stringify({verified_at:new Date().toISOString(),cases:evidence},null,2));
 console.log(`${evidence.length} deliberate SELECT failures across 7 fixed screens: all visible, no success/empty fallback.`);
}catch(error){console.error(error.message,error.code??'');process.exitCode=1;}finally{await db.close();}
