import assert from 'node:assert/strict';
import {createTestDb} from './test-db.mjs';
import {databaseClient,moduleLoader} from './test-modules.mjs';
const db=await createTestDb();
const base=databaseClient(db);
const client={...base,from(table){
 assert.equal(table,'workers');
 return {select(columns){assert.equal(columns,'daily_wage');return {eq(column,id){assert.equal(column,'id');return {async single(){
  const result=await db.query('SELECT daily_wage FROM workers WHERE id=$1',[id]);
  return {data:result.rows[0]??null,error:null};
 }}}}}};
}};
const load=moduleLoader({'@/lib/supabase/server':{createClient:async()=>client},'next/cache':{revalidatePath(){}},'next/navigation':{redirect(){throw new Error('Unexpected redirect')}}});
const {recordWorkerDayAction}=load('app/(dashboard)/dashboard/workers/actions.ts');
try{
 await db.exec('SET ROLE authenticated');
 const date=(await db.query('SELECT CURRENT_DATE::text AS date')).rows[0].date;
 const makeWorker=async(wage=400)=>(await db.query("INSERT INTO workers(name,daily_wage) VALUES('اختبار السلفة',$1) RETURNING id",[wage])).rows[0].id;
 const form=(id,mode,value)=>{
  const data=new FormData();
  for(const [key,entry] of Object.entries({worker_id:id,work_date:date,status:'present',extra_type:'amount',extra_units:'0',advance_mode:mode,advance:mode==='days'?'999999':value,advance_days:value,bonus:'0',deduction:'0'}))data.set(key,entry);
  return data;
 };
 for(const [days,expected] of [['0.25',100],['0.5',200],['0.75',300],['1',400],['1.25',500]]){
  const id=await makeWorker();
  const result=await recordWorkerDayAction(null,form(id,'days',days));
  assert.equal(result.success,true,result.message);
  assert.equal(Number((await db.query('SELECT amount FROM worker_transactions WHERE worker_id=$1',[id])).rows[0].amount),expected);
  await db.query('UPDATE workers SET daily_wage=800 WHERE id=$1',[id]);
  assert.equal(Number((await db.query('SELECT amount FROM worker_transactions WHERE worker_id=$1',[id])).rows[0].amount),expected);
 }
 const cash=await makeWorker();
 assert.equal((await recordWorkerDayAction(null,form(cash,'amount','0.29'))).success,true);
 assert.equal(Number((await db.query('SELECT amount FROM worker_transactions WHERE worker_id=$1',[cash])).rows[0].amount),0.29);
 for(const invalid of ['-1','0.3','31','NaN']){
  const id=await makeWorker();
  assert.equal((await recordWorkerDayAction(null,form(id,'days',invalid))).success,false);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM attendance WHERE worker_id=$1',[id])).rows[0].count,0);
 }
 const zero=await makeWorker(0);
 assert.equal((await recordWorkerDayAction(null,form(zero,'days','1'))).success,false);
 console.log('PASS advance day fractions, authoritative wage, saved amount stability, cash decimals, and invalid/zero-wage rejection.');
}finally{await db.close()}