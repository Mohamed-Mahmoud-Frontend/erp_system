// Built application + Chrome + linked Supabase. Fixtures use their own materials.
// No AI calls, production invoice numbering, or real-factory stock edits.
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const check = r => { if (r.error) throw r.error; return r.data; };
const tag = `Batch3-${randomUUID()}`, base = 'http://localhost:3103';
const a = randomUUID(), b = randomUUID(), raceMaterial = randomUUID();
const materialIds = [a,b,raceMaterial];
const evidence = { tag, started_at: new Date().toISOString(), steps: [], cleanup: false };
const before = check(await admin.from('materials').select('id,stock_qty').order('id'));
const beforeInvoices = check(await admin.from('invoice_balances').select('id,total,balance_due').order('id'));
const sequence = check(await admin.from('invoice_sequences').select('*').order('year'));
let server, browser, userId, clientId, specId;
await mkdir('audit/batch3', { recursive: true });
try {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','--port','3103'], { windowsHide: true, stdio: 'ignore', env: process.env });
  let ready = false;
  for (let attempt=0; attempt<60; attempt++) {
    if (server.exitCode !== null) throw Error('Next exited');
    try { if ((await fetch(`${base}/login`)).ok) { ready=true; break; } } catch { /* Startup retry, followed by a hard timeout. */ }
    await delay(500);
  }
  assert.ok(ready, 'Next startup timeout');
  const email = `${tag.toLowerCase()}@example.com`, password = randomBytes(24).toString('base64url');
  userId = check(await admin.auth.admin.createUser({ email,password,email_confirm:true })).user.id;
  clientId = randomUUID();
  check(await admin.from('clients').insert({ id:clientId,name:tag,type:'trader' }));
  check(await admin.from('materials').insert([
    { id:a,type:`${tag} resin`,unit:'kg',stock_qty:100 },
    { id:b,type:`${tag} pigment`,unit:'ton',stock_qty:10 },
    { id:raceMaterial,type:`${tag} race`,unit:'kg',stock_qty:10 },
  ]));
  browser = await chromium.launch({ channel:'chrome',headless:true });
  const page = await browser.newPage(); page.setDefaultTimeout(30000);
  await page.goto(`${base}/login`); await page.locator('#email').fill(email); await page.locator('#password').fill(password);
  await page.locator('#login-submit').click(); await page.waitForURL(`${base}/dashboard`);
  await page.goto(`${base}/dashboard/product-specs`);
  const form = page.getByRole('form',{name:'وصفة المنتج'});
  await form.locator('[name="name"]').fill(tag);
  await form.locator('[name="material_id"]').selectOption(a); await form.locator('[name="qty_per_unit"]').fill('3');
  await form.getByRole('button',{name:'إضافة خامة',exact:true}).click();
  await form.locator('[name="material_id"]').nth(1).selectOption(b); await form.locator('[name="qty_per_unit"]').nth(1).fill('0.5');
  await form.getByRole('button',{name:'حفظ الوصفة',exact:true}).click(); await page.waitForURL(/saved=1/);
  specId = new URL(page.url()).searchParams.get('edit');
  const master = check(await admin.from('product_spec_materials').select('*').eq('spec_id',specId).order('material_id'));
  assert.equal(master.length,2);
  async function stocks(expectedA, expectedB, stage) {
    const rows = check(await admin.from('materials').select('id,stock_qty').in('id',[a,b]));
    assert.equal(Number(rows.find(r=>r.id===a).stock_qty),expectedA);
    assert.equal(Number(rows.find(r=>r.id===b).stock_qty),expectedB);
    evidence.steps.push({ stage,resin:expectedA,pigment:expectedB });
    console.log(`${stage}: resin ${expectedA}, pigment ${expectedB}`);
  }
  async function order(quantity, override) {
    await page.goto(`${base}/dashboard/orders/new/recipe`);
    const f=page.getByRole('form',{name:'أوردر بوصفة'});
    await f.locator('[name="client_id"]').selectOption(clientId);
    await f.locator('[name="product_spec_id"]').selectOption(specId);
    await f.locator('[name="quantity"]').fill(String(quantity));
    await expect(f.locator(`[data-material-id="${a}"]`).getByTestId('default-requirement')).toContainText(String(quantity*3));
    if(override!==undefined) await f.locator(`[name="override:${a}"]`).fill(String(override));
    await f.getByRole('button',{name:'حفظ أوردر الوصفة',exact:true}).click();
    await page.waitForURL(/\/dashboard\/orders\/[0-9a-f-]+$/);
    return new URL(page.url()).pathname.split('/').at(-1);
  }
  async function start(id) {
    await page.goto(`${base}/dashboard/orders/${id}`);
    await page.getByRole('button',{name:'بدء التصنيع',exact:true}).click();
  }
  const first = await order(4);
  await stocks(100,10,'creation does not consume');
  await start(first); await expect(page.getByTestId('order-status')).toHaveText('جاري التصنيع');
  await stocks(88,8,'default consumption 12 kg / 2 ton');
  const movements = check(await admin.from('material_movements').select('material_id,direction,is_return,qty').eq('order_id',first));
  assert.equal(movements.length,2);
  assert.equal(Number(movements.find(m=>m.material_id===a).qty),12);
  assert.equal(Number(movements.find(m=>m.material_id===b).qty),2);
  assert.ok(movements.every(m=>m.direction==='out' && !m.is_return));
  check(await admin.from('orders').update({status:'in_production'}).eq('id',first));
  await stocks(88,8,'repeated start does not consume');
  const second = await order(2,9);
  await start(second); await expect(page.getByTestId('order-status')).toHaveText('جاري التصنيع');
  await stocks(79,7,'per-order override consumes 9 kg / 1 ton');
  assert.deepEqual(check(await admin.from('product_spec_materials').select('*').eq('spec_id',specId).order('material_id')),master);
  const secondMoves = check(await admin.from('material_movements').select('material_id,qty').eq('order_id',second));
  assert.equal(secondMoves.length,2); assert.equal(Number(secondMoves.find(m=>m.material_id===a).qty),9); assert.equal(Number(secondMoves.find(m=>m.material_id===b).qty),1);
  const blocked=await order(20); await start(blocked);
  const alert=page.getByRole('form',{name:'حالة التصنيع'}).getByRole('alert');
  await expect(alert).toContainText(`${tag} pigment`);
  await expect(alert).toContainText('المطلوب 10'); await expect(alert).toContainText('المتاح 7'); await expect(alert).toContainText('العجز 3');
  await expect(page.getByTestId('order-status')).toHaveText('قيد الانتظار');
  assert.equal(check(await admin.from('material_movements').select('id').eq('order_id',blocked)).length,0);
  await stocks(79,7,'shortage rejected: needed 10, available 7, short 3; zero movements');
  await page.screenshot({path:`audit/batch3/shortage-${tag}.png`,fullPage:true});
  await page.goto(`${base}/dashboard/orders/${first}`);
  await page.getByRole('button',{name:'إتمام التصنيع',exact:true}).click(); await expect(page.getByTestId('order-status')).toHaveText('مكتمل');
  await page.getByRole('button',{name:'تأكيد التسليم',exact:true}).click(); await expect(page.getByTestId('order-status')).toHaveText('تم التسليم');
  await stocks(79,7,'completion and delivery do not consume');
  // Direct table INSERT, no application invoice action or RPC.
  check(await admin.from('invoices').insert({order_id:first,invoice_number:`${tag}-raw1`,total:1000}));
  const duplicate=await admin.from('invoices').insert({order_id:first,invoice_number:`${tag}-raw2`,total:2000});
  assert.equal(duplicate.error?.code,'23505'); assert.match(duplicate.error.message,/invoices_order_id_key/);
  evidence.duplicate={code:duplicate.error.code,constraint:'invoices_order_id_key'};
  // Two independent live database requests contend for the same 10 kg stock.
  const raceSpec=check(await admin.rpc('save_product_spec',{p_id:null,p_name:`${tag}-race`,p_active:true,p_lines:[{material_id:raceMaterial,qty_per_unit:'7'}]}));
  const raceOrders=check(await admin.from('orders').insert([{client_id:clientId,quantity:1,product_spec_id:raceSpec},{client_id:clientId,quantity:1,product_spec_id:raceSpec}]).select('id'));
  const raced=await Promise.all(raceOrders.map(o=>admin.from('orders').update({status:'in_production'}).eq('id',o.id)));
  assert.equal(raced.filter(r=>!r.error).length,1); assert.equal(raced.filter(r=>r.error?.code==='P0001').length,1);
  assert.equal(Number(check(await admin.from('materials').select('stock_qty').eq('id',raceMaterial).single()).stock_qty),3);
  assert.equal(check(await admin.from('material_movements').select('id').in('order_id',raceOrders.map(o=>o.id))).length,1);
  evidence.race={before:10,each_needs:7,after:3,successful_starts:1,movements:1};
  // Edit and deactivate master via UI; existing snapshot stays unchanged.
  const oldSnapshot=check(await admin.from('orders').select('material_requirements').eq('id',blocked).single()).material_requirements;
  await page.goto(`${base}/dashboard/product-specs?edit=${specId}`);
  const edit=page.getByRole('form',{name:'وصفة المنتج'});
  const line=edit.locator('[data-recipe-line]').filter({has:page.locator(`option[value="${a}"]:checked`)});
  await line.locator('[name="qty_per_unit"]').fill('5');
  await edit.locator('[name="active"]').uncheck();
  await edit.getByRole('button',{name:'حفظ الوصفة',exact:true}).click(); await page.waitForURL(/saved=1/);
  assert.equal(check(await admin.from('product_specs').select('active').eq('id',specId).single()).active,false);
  assert.deepEqual(check(await admin.from('orders').select('material_requirements').eq('id',blocked).single()).material_requirements,oldSnapshot);
  await page.locator(`[data-spec-id="${specId}"]`).getByRole('button',{name:'حذف الوصفة',exact:true}).click();
  await expect(page.locator(`[data-spec-id="${specId}"]`).getByRole('alert')).toContainText('الوصفة مستخدمة في أوردر');
  // Delete a genuinely unused recipe through the same CRUD UI.
  const unused=check(await admin.rpc('save_product_spec',{p_id:null,p_name:`${tag}-unused`,p_active:true,p_lines:[{material_id:a,qty_per_unit:'1'}]}));
  await page.goto(`${base}/dashboard/product-specs`);
  await page.locator(`[data-spec-id="${unused}"]`).getByRole('button',{name:'حذف الوصفة',exact:true}).click();
  await expect(page.locator(`[data-spec-id="${unused}"]`)).toHaveCount(0);
  assert.equal(check(await admin.from('product_specs').select('id').eq('id',unused)).length,0);
  evidence.success=true; evidence.ids={clientId,specId,orders:[first,second,blocked,...raceOrders.map(o=>o.id)],materials:materialIds};
  console.log('Live CRUD, manufacturing, override, shortage, delivery, duplicate constraint, and concurrent starts verified.');
} finally {
  try {
    if(clientId) {
      const orders=check(await admin.from('orders').select('id').eq('client_id',clientId));
      if(orders.length) {
        const ids=orders.map(o=>o.id);
        check(await admin.from('material_movements').delete().in('order_id',ids));
        check(await admin.from('invoices').delete().in('order_id',ids));
        check(await admin.from('orders').delete().in('id',ids));
      }
      check(await admin.from('clients').delete().eq('id',clientId));
    }
    check(await admin.from('product_specs').delete().like('name',`${tag}%`));
    check(await admin.from('materials').delete().in('id',materialIds));
    if(userId) check(await admin.auth.admin.deleteUser(userId));
    assert.deepEqual(check(await admin.from('materials').select('id,stock_qty').order('id')),before);
    assert.deepEqual(check(await admin.from('invoice_balances').select('id,total,balance_due').order('id')),beforeInvoices);
    assert.deepEqual(check(await admin.from('invoice_sequences').select('*').order('year')),sequence);
    evidence.cleanup=true; evidence.sequence_unchanged=sequence;
    console.log('Fixtures deleted; original materials, invoice balances and invoice numbering unchanged.');
  } finally {
    if(browser) await browser.close(); if(server) server.kill();
    evidence.finished_at=new Date().toISOString();
    await writeFile(`audit/batch3/live-${tag}.json`,JSON.stringify(evidence,null,2));
  }
}
