import { existsSync as hasCorrectionMigration } from 'node:fs';
if (hasCorrectionMigration('supabase/migrations/0021_correction_history.sql')) throw Error('This historical live fixture test requires deleting financial history. Disabled after Batch 5: use verify:batch5:browser and the rollback SQL tests instead.');
// Real browser payroll verification. Search limits Pay All to our named fixtures.
import assert from 'node:assert/strict';
import { randomUUID,randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { readFile,mkdir,writeFile } from 'node:fs/promises';
import { chromium,expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({path:'.env.local',quiet:true});
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const check=r=>{if(r.error)throw r.error;return r.data;};
const tag=`Batch4-${randomUUID()}`,base='http://localhost:3104',start='2026-09-04',end='2026-09-10';
const expected=JSON.parse(await readFile('audit/batch4/expected.json','utf8'));
const ids=[randomUUID(),randomUUID(),randomUUID(),randomUUID()];
const [worker,second,negative,raceWorker]=ids;
const evidence={tag,started_at:new Date().toISOString(),expected,cleanup:false};
const originals=check(await admin.from('workers').select('*').order('id'));
const originalPayouts=check(await admin.from('worker_payouts').select('*').order('id'));
let browser,server,userId;
await mkdir('audit/batch4',{recursive:true});
const money=n=>new Intl.NumberFormat('ar-EG',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
try {
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3104'],{windowsHide:true,stdio:'ignore',env:process.env});
 let ready=false;
 for(let i=0;i<60;i++) {if(server.exitCode!==null)throw Error('Next exited');try{if((await fetch(`${base}/login`)).ok){ready=true;break;}}catch{/* Startup retry only; timeout below fails. */}await delay(500);}
 assert.ok(ready,'Server startup timeout');
 const email=`${tag.toLowerCase()}@example.com`,password=randomBytes(24).toString('base64url');
 userId=check(await admin.auth.admin.createUser({email,password,email_confirm:true})).user.id;
 check(await admin.from('workers').insert([{id:worker,name:`${tag}-pay A`,daily_wage:400},{id:second,name:`${tag}-pay B`,daily_wage:200},{id:negative,name:`${tag}-negative`,daily_wage:100},{id:raceWorker,name:`${tag}-race`,daily_wage:100}]));
 check(await admin.from('attendance').insert([
   {worker_id:worker,work_date:'2026-09-03',status:'present',extra_units:9000},
   {worker_id:worker,work_date:'2026-09-06',status:'half_day'},
   {worker_id:worker,work_date:'2026-09-08',status:'absent'},
   {worker_id:worker,work_date:'2026-09-09',status:'present'},
   {worker_id:worker,work_date:'2026-09-10',status:'present'},
   {worker_id:worker,work_date:'2026-09-11',status:'present',extra_units:9000},
   {worker_id:second,work_date:start,status:'present'},
   {worker_id:raceWorker,work_date:start,status:'present'},
 ].map(row=>({extra_units:0,...row}))));
 check(await admin.from('worker_transactions').insert([
   {worker_id:worker,type:'bonus',amount:9000,created_at:'2026-09-03T23:59:59.999999+03:00'},
   {worker_id:worker,type:'bonus',amount:125,created_at:'2026-09-04T00:00:00+03:00'},
   {worker_id:worker,type:'deduction',amount:50,created_at:'2026-09-10T23:59:59.999999+03:00'},
   {worker_id:worker,type:'bonus',amount:9000,created_at:'2026-09-11T00:00:00+03:00'},
   {worker_id:negative,type:'advance',amount:50,created_at:'2026-09-07T12:00:00+03:00'},
 ]));
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});page.setDefaultTimeout(30000);
 await page.goto(`${base}/login`);await page.locator('#email').fill(email);await page.locator('#password').fill(password);await page.locator('#login-submit').click();await page.waitForURL(`${base}/dashboard`);
 for(const [date,status,type,value] of [['2026-09-04','present','amount','75'],['2026-09-05','present','day_fraction','0.5'],['2026-09-07','quarter_day','amount','0']]) {
   await page.goto(`${base}/dashboard/workers/attendance`);
   const form=page.getByRole('form',{name:'تسجيل اليومية'});
   await form.locator('[name="worker_id"]').selectOption(worker);await form.locator('[name="work_date"]').fill(date);
   await form.locator('[name="status"]').selectOption(status);await form.locator('[name="extra_type"]').selectOption(type);await form.locator('[name="extra_units"]').fill(value);
   await form.getByRole('button',{name:'تسجيل اليومية',exact:true}).click();await expect(form.getByRole('status')).toContainText('تم تسجيل الحضور');
 }
 await page.goto(`${base}/dashboard/workers/transactions`);
 const tx=page.getByRole('form',{name:'معاملة عامل'});await tx.locator('[name="worker_id"]').selectOption(worker);await tx.locator('[name="type"]').selectOption('advance');await tx.locator('[name="amount"]').fill('300');await tx.getByRole('button',{name:'حفظ المعاملة',exact:true}).click();await expect(tx.getByRole('status')).toContainText('تم التسجيل');
 // Fix only the fixture's transaction date, so this concrete-week test can be rerun later.
 check(await admin.from('worker_transactions').update({created_at:'2026-09-07T12:00:00+03:00'}).eq('worker_id',worker).eq('type','advance'));
 const dates=check(await admin.from('attendance').select('work_date').eq('worker_id',worker).gte('work_date',start).lte('work_date',end).order('work_date')).map(a=>a.work_date);
 assert.deepEqual(dates,expected.week_dates);assert.equal(new Set(dates).size,7);evidence.dates=dates;
 const preview=check(await admin.rpc('get_weekly_payroll',{p_week_start:start,p_search:`${tag}-pay`}));
 const mixed=preview.find(r=>r.worker_id===worker);assert.equal(preview.length,2);
 for(const field of ['days_present','daily_wage','attendance_bonus','transaction_bonus','advances','deductions','net_amount']) assert.equal(Number(mixed[field]),expected[field],field);
 evidence.system_before=mixed;
 const payrollUrl=`${base}/dashboard/workers/payouts?week=${end}&search=${encodeURIComponent(`${tag}-pay`)}`;
 await page.goto(payrollUrl);await expect(page.getByTestId('week-window')).toContainText(`${start} إلى الخميس ${end}`);
 const row=page.locator(`[data-worker-id="${worker}"]`);
 for(const [field,value] of Object.entries({base_pay:1900,attendance_bonus:275,transaction_bonus:125,advances:300,deductions:50,net_amount:1950})) await expect(row.locator(`[data-field="${field}"]`)).toHaveText(money(value));
 const countBefore=check(await admin.from('worker_transactions').select('id').in('worker_id',ids)).length;
 const all=page.getByRole('form',{name:'صرف الكل',exact:true});
 await all.getByRole('button',{name:'صرف الكل (2)',exact:true}).click();await expect(all.getByRole('status')).toContainText('تم حفظ صرف 2 عامل');
 const payouts=check(await admin.from('worker_payouts').select('*').in('worker_id',[worker,second]));assert.equal(payouts.length,2);
 const paid=payouts.find(p=>p.worker_id===worker);
 for(const field of ['days_present','daily_wage','attendance_bonus','transaction_bonus','advances','deductions','net_amount']) assert.equal(Number(paid[field]),expected[field],field);
 assert.equal(paid.week_start,start);assert.equal(paid.week_end,end);assert.ok(paid.paid_at);
 assert.equal(Number(payouts.find(p=>p.worker_id===second).net_amount),200);
 assert.equal(check(await admin.from('worker_transactions').select('id').in('worker_id',ids)).length,countBefore);
 evidence.persisted=payouts;
 await page.screenshot({path:`audit/batch4/payroll-${tag}.png`,fullPage:true});
 await all.getByRole('button',{name:'صرف الكل (2)',exact:true}).click();await expect(all.getByRole('alert')).toContainText(`سبق صرف العامل ${tag}-pay`);await expect(all.getByRole('alert')).toContainText(start);
 assert.equal(check(await admin.from('worker_payouts').select('id').in('worker_id',[worker,second])).length,2);
 const duplicate=await admin.from('worker_payouts').insert({worker_id:worker,week_start:start});assert.equal(duplicate.error?.code,'23505');assert.match(duplicate.error.message,/worker_payouts_worker_week_key/);
 evidence.duplicate={code:duplicate.error.code,constraint:'worker_payouts_worker_week_key'};
 await page.goto(`${base}/dashboard/workers/payouts?week=${end}&search=${encodeURIComponent(`${tag}-negative`)}`);
 await page.getByRole('form',{name:'صرف الكل',exact:true}).getByRole('button').click();await expect(page.getByRole('form',{name:'صرف الكل',exact:true}).getByRole('alert')).toContainText('الصافي سالب');
 assert.equal(check(await admin.from('worker_payouts').select('id').eq('worker_id',negative)).length,0);evidence.negative_blocked=-50;
 const race=await Promise.all([admin.rpc('pay_workers_week',{p_worker_ids:[raceWorker],p_week_start:start}),admin.rpc('pay_workers_week',{p_worker_ids:[raceWorker],p_week_start:start})]);
 assert.equal(race.filter(r=>!r.error).length,1);assert.equal(race.filter(r=>r.error?.code==='23505').length,1);assert.equal(check(await admin.from('worker_payouts').select('id').eq('worker_id',raceWorker)).length,1);evidence.concurrent_successes=1;
 check(await admin.from('workers').update({daily_wage:500}).eq('id',worker));
 assert.equal(Number(check(await admin.rpc('calculate_worker_week',{p_worker_id:worker,p_week_start:start}))[0].net_amount),2475);
 await page.goto(payrollUrl);await expect(page.locator(`[data-worker-id="${worker}"] [data-field="net_amount"]`)).toHaveText(money(1950));
 evidence.after_wage_change={current_calculation:2475,persisted:1950};
 evidence.success=true;evidence.worker_ids=ids;
 console.log('Live UI: 7 dates, current wage 400, 4.75 days, base 1900 + attendance extras 275 + transaction bonus 125 - advance 300 - deduction 50 = 1950.');
 console.log('Pay All saved 1950 and 200; duplicate UI and direct insert rejected; negative -50 blocked; concurrent payout one success; stored 1950 unchanged after wage 500.');
} finally {
 try {
   check(await admin.from('worker_payouts').delete().in('worker_id',ids));check(await admin.from('attendance').delete().in('worker_id',ids));check(await admin.from('worker_transactions').delete().in('worker_id',ids));check(await admin.from('workers').delete().in('id',ids));
   if(userId)check(await admin.auth.admin.deleteUser(userId));
   assert.deepEqual(check(await admin.from('workers').select('*').order('id')),originals);assert.deepEqual(check(await admin.from('worker_payouts').select('*').order('id')),originalPayouts);
   evidence.cleanup=true;console.log('Temporary workers, attendance, transactions, payouts and auth user removed. Original workers and payouts unchanged.');
 } finally {
   if(browser)await browser.close();if(server)server.kill();evidence.finished_at=new Date().toISOString();await writeFile(`audit/batch4/live-${tag}.json`,JSON.stringify(evidence,null,2));
 }
}
