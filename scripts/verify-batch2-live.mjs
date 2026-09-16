import { existsSync as hasCorrectionMigration } from 'node:fs';
if (hasCorrectionMigration('supabase/migrations/0021_correction_history.sql')) throw Error('This historical live fixture test requires deleting financial history. Disabled after Batch 5: use verify:batch5:browser and the rollback SQL tests instead.');
// Real browser -> Server Actions -> linked Supabase. No AI calls or invoice sequence use.
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
const tag = `Batch2-${randomUUID()}`;
const evidence = { tag, started_at: new Date().toISOString(), balances: [], cleanup: false };
const check = result => { if (result.error) throw result.error; return result.data; };
const base = 'http://localhost:3102';
let server, browser, userId, clientId;
const invoiceIds = [], orderIds = [];
const money = n => new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const before = check(await admin.from('invoice_balances').select('id,total,balance_due').order('id'));
const sequence = check(await admin.from('invoice_sequences').select('*').order('year'));
const stock = check(await admin.from('materials').select('id,stock_qty').order('id'));
const movementCount = (await admin.from('material_movements').select('id', { count: 'exact', head: true }));
check(movementCount);
async function createInvoice(total, dueDate, suffix) {
  const orderId = randomUUID(); orderIds.push(orderId);
  check(await admin.from('orders').insert({ id: orderId, client_id: clientId, quantity: 2 }));
  const id = randomUUID(); invoiceIds.push(id);
  check(await admin.from('invoices').insert({ id, order_id: orderId, invoice_number: `${tag}-${suffix}`, total, due_date: dueDate, created_at: '2026-01-01T10:00:00Z' }));
  return id;
}
try {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3102'], { windowsHide: true, stdio: 'ignore', env: process.env });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw Error('Next server exited');
    try { if ((await fetch(`${base}/login`)).ok) { ready = true; break; } } catch { /* Retry startup; fail on timeout. */ }
    await delay(500);
  }
  assert.ok(ready, 'Next server startup timed out');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage(); page.setDefaultTimeout(30000);
  const email = `${tag.toLowerCase()}@example.com`, password = randomBytes(24).toString('base64url');
  userId = check(await admin.auth.admin.createUser({ email, password, email_confirm: true })).user.id;
  clientId = randomUUID();
  check(await admin.from('clients').insert({ id: clientId, name: tag, type: 'trader', credit_days: 14 }));
  const invoiceId = await createInvoice(1000, '2026-01-15', 'overdue');
  evidence.client_id = clientId; evidence.invoice_ids = invoiceIds;
  await page.goto(`${base}/login`);
  await page.locator('#email').fill(email); await page.locator('#password').fill(password);
  await page.locator('#login-submit').click(); await page.waitForURL(`${base}/dashboard`);
  async function balance(stage, expected, clientExpected = expected) {
    const row = check(await admin.from('invoice_balances').select('*').eq('id', invoiceId).single());
    assert.equal(Number(row.balance_due), expected, stage);
    await page.goto(`${base}/dashboard/invoices/${invoiceId}`);
    await expect(page.getByTestId('invoice-balance')).toContainText(`${expected < 0 ? 'له' : expected > 0 ? 'عليه' : 'متوازن'} ${money(Math.abs(expected))}`);
    await page.goto(`${base}/dashboard/clients/${clientId}`);
    await expect(page.getByTestId('client-balance')).toContainText(`${clientExpected < 0 ? 'له' : clientExpected > 0 ? 'عليه' : 'متوازن'} ${money(Math.abs(clientExpected))}`);
    const statement = check(await admin.rpc('get_client_statement', { p_client_id: clientId }));
    assert.equal(Number(statement.balance), clientExpected);
    assert.equal(Number(statement.entries.at(-1).running_balance), clientExpected);
    evidence.balances.push({ stage, total: row.total, valid_paid: row.paid_amount, returned: row.returned_amount, invoice_balance: expected, client_balance: clientExpected, running: statement.entries.map(e => ({ kind: e.kind, credit: e.credit, balance: e.running_balance, bounced: e.bounced })) });
    console.log(`${stage}: invoice ${expected}, client ${clientExpected}`);
  }
  async function payment(amount, method) {
    await page.goto(`${base}/dashboard/invoices/${invoiceId}`);
    const form = page.locator('form').filter({ has: page.locator('input[name="method"]') });
    await form.locator(`input[name="method"][value="${method}"]`).check({ force: true });
    await form.locator('input[name="amount"]').fill(String(amount));
    if (method === 'cheque') await form.locator('input[name="cheque_due_date"]').fill('2026-12-01');
    await form.getByRole('button', { name: 'تأكيد الدفع', exact: true }).click();
    await expect.poll(async () => check(await admin.from('payments').select('id').eq('invoice_id', invoiceId).eq('method', method)).length).toBe(1);
  }
  async function salesReturn(amount) {
    await page.goto(`${base}/dashboard/invoices/${invoiceId}`);
    await page.locator('summary').filter({ hasText: 'تسجيل مرتجع بيع' }).click();
    const form = page.getByRole('form', { name: 'تسجيل مرتجع بيع' });
    await form.locator('[name="amount"]').fill(String(amount));
    await form.locator('[name="condition"]').fill('معطوب/اسكراب');
    await form.locator('[name="note"]').fill(tag);
    await form.getByRole('button', { name: 'حفظ المرتجع', exact: true }).click();
    await expect(form.getByRole('status')).toContainText('تم تسجيل مرتجع البيع');
  }
  await balance('initial', 1000);
  await expect(page.getByText(/متأخرة السداد/)).toBeVisible();
  await payment(200, 'cash'); await balance('cash 200', 800);
  await salesReturn(100); await balance('return 100', 700);
  await expect(page.getByText('مرتجع بيع: معطوب/اسكراب', { exact: false })).toBeVisible();
  await payment(300, 'cheque'); await balance('pending cheque 300', 400);
  const paymentId = check(await admin.from('payments').select('id').eq('invoice_id', invoiceId).eq('method', 'cheque').single()).id;
  const chequeId = check(await admin.from('cheques').select('id').eq('payment_id', paymentId).single()).id;
  evidence.cheque_id = chequeId;
  for (const [status, label, expected] of [['bounced', 'رفض الشيك', 700], ['cleared', 'تم التحصيل', 400]]) {
    await page.goto(`${base}/dashboard/cheques`);
    await page.locator(`[data-cheque-id="${chequeId}"]`).getByRole('button', { name: label, exact: true }).click();
    await expect.poll(async () => check(await admin.from('cheques').select('status').eq('id', chequeId).single()).status).toBe(status);
    await balance(status, expected);
    if (status === 'bounced') await expect(page.getByText(/شيك مرفوض/)).toBeVisible();
  }
  await payment(400, 'transfer'); await balance('fully settled', 0);
  await salesReturn(50); await balance('return after settlement', -50);
  const currentId = await createInvoice(25, '2099-12-31', 'current');
  await balance('additional current invoice 25', -50, -25);
  await expect(page.locator('tr').filter({ has: page.locator(`a[href="/dashboard/invoices/${currentId}"]`) })).not.toContainText('متأخرة السداد');
  // Real missing-row action: delete only our fixture after loading its edit form.
  const missingId = randomUUID();
  check(await admin.from('clients').insert({ id: missingId, name: `${tag}-missing`, type: 'trader' }));
  try {
    await page.goto(`${base}/dashboard/clients/${missingId}/edit`);
    check(await admin.from('clients').delete().eq('id', missingId));
    await page.locator('form').filter({ has: page.locator('[name="name"]') }).locator('button[type="submit"]').click();
    await expect(page.getByText('العميل غير موجود أو لم يعد متاحًا للتعديل.')).toBeVisible();
    assert.ok(page.url().endsWith('/edit'));
  } finally { check(await admin.from('clients').delete().eq('id', missingId)); }
  assert.deepEqual(check(await admin.from('materials').select('id,stock_qty').order('id')), stock);
  const afterMovements = await admin.from('material_movements').select('id', { count: 'exact', head: true }); check(afterMovements);
  assert.equal(afterMovements.count, movementCount.count);
  evidence.stock_unchanged = true; evidence.movement_count = movementCount.count;
  evidence.success = true;
} finally {
  try {
    if (invoiceIds.length) {
      const payments = check(await admin.from('payments').select('id').in('invoice_id', invoiceIds));
      if (payments.length) check(await admin.from('cheques').delete().in('payment_id', payments.map(p => p.id)));
      check(await admin.from('payments').delete().in('invoice_id', invoiceIds));
      check(await admin.from('sales_returns').delete().in('invoice_id', invoiceIds));
      check(await admin.from('invoices').delete().in('id', invoiceIds));
    }
    if (orderIds.length) check(await admin.from('orders').delete().in('id', orderIds));
    if (clientId) check(await admin.from('clients').delete().eq('id', clientId));
    if (userId) check(await admin.auth.admin.deleteUser(userId));
    assert.deepEqual(check(await admin.from('invoice_balances').select('id,total,balance_due').order('id')), before);
    assert.deepEqual(check(await admin.from('invoice_sequences').select('*').order('year')), sequence);
    assert.equal(check(await admin.from('clients').select('id').like('name', `${tag}%`)).length, 0);
    evidence.cleanup = true; evidence.invoice_sequences_unchanged = sequence;
    console.log('Exact test rows and auth user deleted. Existing invoice balances and invoice sequence unchanged.');
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
    evidence.finished_at = new Date().toISOString();
    await mkdir('audit/batch2', { recursive: true });
    await writeFile(`audit/batch2/live-${tag}.json`, JSON.stringify(evidence, null, 2));
  }
}
