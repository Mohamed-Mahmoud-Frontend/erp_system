import assert from 'node:assert/strict';
import {createTestDb} from './test-db.mjs';
import {moduleLoader} from './test-modules.mjs';
const db=await createTestDb();
try{
 await db.exec('SET ROLE authenticated');
 const id=(await db.query("INSERT INTO quotations(guest_name,status) VALUES('Old client','draft') RETURNING id")).rows[0].id;
 const client={from(table){assert.equal(table,'quotations');return {update(value){return {eq(column,key){assert.equal(column,'id');return {select(){return {async maybeSingle(){try{const result=await db.query('UPDATE quotations SET guest_name=$1,guest_phone=$2,details=$3,status=$4,parsed_items=$5::jsonb WHERE id=$6 RETURNING id',[value.guest_name,value.guest_phone,value.details,value.status,JSON.stringify(value.parsed_items),key]);return {data:result.rows[0]??null,error:null}}catch(error){return {data:null,error}}}}}}}}}}}};
 const {saveQuotation}=moduleLoader({'@/lib/supabase/server':{createClient:async()=>client},'next/cache':{revalidatePath(){}}})('app/(dashboard)/dashboard/quotations/[id]/actions.ts');
 const form=new FormData();for(const [key,value] of Object.entries({id,guest_name:'Corrected client',guest_phone:'01000000000',details:'Two tanks',status:'sent',transportation_cost:'50'}))form.set(key,value);
 for(const [key,value] of Object.entries({'capacity[]':'1000 لتر','quantity[]':'2','price[]':'100','material[]':'بولي إيثيلين'}))form.append(key,value);
 assert.equal((await saveQuotation(null,form)).success,true);
 const saved=(await db.query('SELECT guest_name,status,parsed_items FROM quotations WHERE id=$1',[id])).rows[0];assert.equal(saved.guest_name,'Corrected client');assert.equal(saved.status,'sent');assert.equal(saved.parsed_items.products[0].price,100);
 form.set('price[]','-1');assert.ok((await saveQuotation(null,form)).message);assert.equal((await db.query('SELECT parsed_items FROM quotations WHERE id=$1',[id])).rows[0].parsed_items.products[0].price,100);
 console.log('Quotation correction persists validated items and rejects negative prices: passed');
}finally{await db.close()}