import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';
import {parse} from 'dotenv';
import {createTestDb} from './test-db.mjs';
import {gateway} from './batch5-test-gateway.mjs';
const env=parse(await readFile('.env.local'));
const db=await createTestDb(),w=randomUUID(),a=randomUUID(),c=randomUUID(),o=randomUUID(),i=randomUUID();
const base='http://localhost:3105',week='2026-09-04',end='2026-09-10';
const evidence={started_at:new Date().toISOString(),database:'Isolated PostgreSQL/PGlite, actual migrations, authenticated RLS. Test Auth/REST adapter; factory network blocked.',steps:[],faults:[]};
await mkdir('audit/batch5',{recursive:true});
let browser,server,api;
const query=(sql,args=[])=>db.query(sql,args);
const net=async()=>Number((await query('SELECT net_amount FROM calculate_worker_week($1,$2)',[w,week])).rows[0].net_amount);
const money=n=>new Intl.NumberFormat('ar-EG',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
try {
 await query("INSERT INTO workers(id,name,daily_wage) VALUES($1,'Batch5 correction worker',400)",[w]);
 await query("INSERT INTO attendance(id,worker_id,work_date,status,extra_units) VALUES($1,$2,$3,'half_day',50)",[a,w,week]);
 await query("INSERT INTO clients(id,name,type,credit_days) VALUES($1,'Batch5 correction client','trader',0)",[c]);
 await query("INSERT INTO orders(id,client_id,quantity,product_spec) VALUES($1,$2,1,'{}')",[o,c]);
 await query("INSERT INTO invoices(id,order_id,invoice_number,total) VALUES($1,$2,'Batch5-isolated',1000)",[i,o]);
 const r=(await query("SELECT record_sales_return($1,100,'خطأ تجريبي') AS id",[i])).rows[0].id;
 assert.equal(await net(),250);
 api=await gateway(db,3106);
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3105'],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_OPTIONS:`--import=${pathToFileURL(resolve('scripts/batch5-fetch-isolation.mjs')).href}`,BATCH5_SUPABASE_ORIGIN:new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin,BATCH5_TEST_GATEWAY:'http://127.0.0.1:3106'}});
 let serverLog='';server.stdout.on('data',b=>{serverLog+=b;});server.stderr.on('data',b=>{serverLog+=b;});
 let ready=false;
 for(let n=0;n<60;n++){if(server.exitCode!==null)throw Error('Test Next exited: '+serverLog);try{if((await fetch(base+'/login')).ok){ready=true;break;}}catch{/* retry until explicit timeout */}await delay(500);}
 assert.ok(ready,'Test server startup timeout');
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:1000}});page.setDefaultTimeout(20000);
 await page.route('**/*',route=>{const u=new URL(route.request().url());return ['localhost','127.0.0.1'].includes(u.hostname)?route.continue():route.abort();});
 await page.goto(base+'/login');await page.locator('#email').fill(api.user.email);await page.locator('#password').fill('isolated-password');await page.locator('#login-submit').click();await page.waitForURL(base+'/dashboard');
 const detail=`${base}/dashboard/workers/${w}?week=${end}`;
 const payroll=`${base}/dashboard/workers/payouts?week=${end}&search=Batch5`;
 async function formSubmit(kind,fields){const form=page.locator(`[data-correction="${kind}"]`);for(const [name,value] of Object.entries(fields)){const input=form.locator(`[name="${name}"]`);if(name==='status'||name==='extra_type')await input.selectOption(value);else await input.fill(value);}if(kind!=='attendance')await form.locator('[name="confirm"]').check();await form.getByRole('button').click();if(kind==='payout'||kind==='return')await expect(form).toHaveCount(0);else await expect(form.getByRole('status')).toContainText('تم حفظ التصحيح');}
 await page.goto(detail);await formSubmit('wage',{daily_wage:'500'});assert.equal(await net(),300);evidence.steps.push({action:'wage400to500',before:250,after:300});
 await formSubmit('attendance',{status:'present',extra_type:'day_fraction',extra_units:'0.5'});assert.equal(await net(),750);evidence.steps.push({action:'unpaid attendance half+50 to present+0.5day',before:300,after:750});
 await page.goto(payroll);await expect(page.locator('[data-field="net_amount"]')).toHaveText(money(750));
 await page.getByRole('form',{name:'صرف الكل',exact:true}).getByRole('button').click();await expect(page.getByRole('form',{name:'صرف الكل',exact:true}).getByRole('status')).toContainText('تم حفظ صرف');
 const first=(await query('SELECT * FROM worker_payouts WHERE worker_id=$1',[w])).rows[0];assert.equal(Number(first.net_amount),750);
 await page.goto(detail);await expect(page.locator('[data-correction="attendance"]')).toHaveCount(0);await formSubmit('wage',{daily_wage:'600'});
 assert.equal(Number((await query('SELECT net_amount FROM worker_payouts WHERE id=$1',[first.id])).rows[0].net_amount),750);
 await assert.rejects(query("UPDATE attendance SET status='quarter_day' WHERE id=$1",[a]),/مصروف بالفعل/);
 evidence.steps.push({action:'paid snapshot after wage500to600',saved_net:750,saved_wage:500,current_calculation:await net(),paid_attendance_blocked:true});
 await formSubmit('payout',{reason:'تصحيح حضور خاطئ'});await page.reload();await expect(page.locator(`[data-payout-id="${first.id}"]`)).toContainText('ملغى: تصحيح حضور خاطئ');
 await formSubmit('attendance',{status:'quarter_day',extra_type:'amount',extra_units:'25'});assert.equal(await net(),175);
 await page.goto(payroll);await expect(page.locator('[data-field="net_amount"]')).toHaveText(money(175));await page.getByRole('form',{name:'صرف الكل',exact:true}).getByRole('button').click();await expect(page.getByRole('form',{name:'صرف الكل',exact:true}).getByRole('status')).toContainText('تم حفظ صرف');
 const history=(await query('SELECT * FROM worker_payouts WHERE worker_id=$1 ORDER BY paid_at',[w])).rows;assert.equal(history.length,2);assert.ok(history[0].voided_at);assert.equal(Number(history[1].net_amount),175);evidence.payout_history=history;
 await page.goto(detail);await expect(page.locator('[data-payout-id]')).toHaveCount(2);await page.screenshot({path:'audit/batch5/correction-history.png',fullPage:true});
 await page.goto(`${base}/dashboard/invoices/${i}`);await expect(page.getByTestId('invoice-balance')).toContainText(money(900));await formSubmit('return',{reason:'مرتجع مسجل بالخطأ'});await page.reload();await expect(page.getByTestId('invoice-balance')).toContainText(money(1000));await expect(page.getByText('ملغى — غير محتسب:',{exact:false})).toContainText('مرتجع مسجل بالخطأ');
 const originalReturn=(await query('SELECT * FROM sales_returns WHERE id=$1',[r])).rows[0];assert.ok(originalReturn.voided_at);evidence.return_history=originalReturn;
 await page.goto(`${base}/dashboard/clients/${c}`);await expect(page.getByText('ملغى:',{exact:false})).toContainText('مرتجع مسجل بالخطأ');
 for(const [route,table] of [['','materials'],['','quotations'],['/materials','materials'],['/materials/movements/new','materials'],['/materials/movements/new','supplier_directory'],['/suppliers','supplier_balances'],['/quotations','quotations'],['/invoices/create','clients'],['/invoices/create','invoices'],['/invoices/create','orders'],[`/clients/${c}/edit`,'clients'],[`/workers/${w}`,'workers'],[`/workers/${w}`,'attendance'],[`/workers/${w}`,'worker_payouts']]){
  api.fault(table);await page.goto(base+'/dashboard'+route);await expect(page.locator('main').getByRole('alert')).toBeVisible();if(table==='materials')await expect(page.getByText('المخزون بوضع ممتاز',{exact:false})).toHaveCount(0);evidence.faults.push({route,table,visible_error:true});api.fault(null);
 }
 await db.exec("SET ROLE postgres; INSERT INTO auth.users(id,email) VALUES('50000000-0000-4000-8000-000000000001','spare@test.example'); INSERT INTO user_access(user_id,email,role) VALUES('50000000-0000-4000-8000-000000000001','spare@test.example','admin'); UPDATE user_access SET role='employee',permissions=ARRAY['attendance'] WHERE user_id='10000000-0000-4000-8000-000000000099';");
 await page.goto(base+'/dashboard/workers');await page.waitForURL(base+'/dashboard?denied=1');await expect(page.getByRole('navigation').getByText('العمال والرواتب',{exact:true})).toHaveCount(0);
 await page.goto(base+'/dashboard/users');await page.waitForURL(base+'/dashboard?denied=1');
 await page.goto(base+'/dashboard/workers/attendance');await expect(page.getByRole('heading',{name:'الحضور وتصحيح اليومية'})).toBeVisible();await expect(page.getByRole('link',{name:'الرواتب',exact:true})).toHaveCount(0);
 api.fault('worker_directory');await page.reload();await expect(page.locator('main').getByRole('alert')).toContainText('تعذر تحميل العمال');api.fault('attendance_status');await page.reload();await expect(page.locator('main').getByRole('alert')).toContainText('تعذر تحميل الحضور');api.fault(null);
 await db.exec("SET ROLE postgres; UPDATE user_access SET active=false WHERE user_id='10000000-0000-4000-8000-000000000099';");await page.goto(base+'/dashboard');await expect(page.locator('main').getByRole('alert')).toContainText('الحساب غير مفعّل');
 evidence.role_navigation={attendance_only_denied_payroll_and_users:true,no_payroll_links:true,disabled_session_blocked:true,new_attendance_read_failures_visible:true};
 evidence.success=true;console.log('Browser: wage250->300, attendance300->750, paid snapshot750 retained, void + correct + repay175; BOTH history rows visible. Return900->1000, original retained in invoice and statement. All 14 read failures visible. No factory connection or financial DELETE.');
}finally {
 if(browser)await browser.close();if(server)server.kill();if(api)await api.close();await db.close();evidence.finished_at=new Date().toISOString();await writeFile('audit/batch5/browser.json',JSON.stringify(evidence,null,2));
}
