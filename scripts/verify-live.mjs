// Explicit live verification: requires migrated Supabase + npm run build.
// Creates a uniquely named auth user/client/orders/quote, then deletes only
// those fixtures. One direct-sale invoice number is consumed (never rewound).
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const tag = `Batch1-${randomUUID()}`;
const email = `${tag.toLowerCase()}@example.com`;
const password = randomBytes(24).toString('base64url');
const quoteText = `${tag}: مطلوب خزانين سعة 1000 لتر، سعر الخزان الواحد 2250 جنيه، النقل 4500 جنيه.`;
const servers = [];
let browser;
let userId;
let clientId;
const cleanupErrors = [];
const sharingOnly = process.argv.includes('--sharing-only');
const aiOnly = process.argv.includes('--ai-only');

function check(result) {
  if (result.error) throw result.error;
  return result.data;
}
async function start(port, extraEnv = {}) {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', String(port)], {
    env: { ...process.env, ...extraEnv }, windowsHide: true, stdio: 'ignore',
  });
  servers.push(child);
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) throw new Error(`Test server ${port} exited`);
    try {
      const response = await fetch(`${base}/login`);
      if (response.ok) return base;
    } catch { /* Startup probe only; exhaustion below fails the test. */ }
    await delay(500);
  }
  throw new Error(`Test server ${port} did not start`);
}
try {
  const base = await start(3100);
  const failedBase = sharingOnly ? null : await start(3101, { DEEPSEEK_API_KEY: 'deliberately-invalid-batch1-verification' });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  const anonResponse = await context.request.post(`${base}/api/quotations/ai`, { data: { text: quoteText } });
  assert.equal(anonResponse.status(), 401);

  let quote;
  if (!sharingOnly) {
  userId = check(await admin.auth.admin.createUser({ email, password, email_confirm: true })).user.id;
  await page.goto(`${base}/login`);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#login-submit').click();
  await page.waitForURL(`${base}/dashboard`);
  console.log('PASS live browser login with temporary Supabase user.');

  if (!aiOnly) {
  clientId = check(await admin.from('clients').insert({ name: tag, type: 'trader' }).select('id').single()).id;
  await page.goto(`${base}/dashboard/orders/new`);
  await page.locator('select').first().selectOption(clientId);
  await page.locator('input[name="capacity[]"]').fill('1000 لتر');
  await page.locator('input[name="quantity[]"]').fill('2');
  await page.getByRole('button', { name: 'حفظ الطلب الجديد', exact: true }).click();
  await page.waitForURL(`${base}/dashboard/orders`);
  let orders = check(await admin.from('orders').select('id,quantity').eq('client_id', clientId));
  assert.equal(orders.length, 1);
  assert.equal(orders[0].quantity, 2);
  console.log('PASS live browser: select existing client -> saved order with quantity 2.');

  await page.goto(`${base}/dashboard/invoices/create`);
  await page.getByRole('button', { name: 'فاتورة بيع مباشر (بدون أمر شغل)', exact: true }).click();
  await page.locator('select').first().selectOption(clientId);
  await page.locator('input[name="capacity[]"]').fill('1000 لتر');
  await page.locator('input[name="quantity[]"]').fill('2');
  await page.locator('input[name="total"]').fill('5000');
  await page.locator('input[name="paid_amount"]').fill('1200');
  await page.getByRole('button', { name: 'حفظ وإصدار الفاتورة المباشرة', exact: true }).click();
  await page.waitForURL(/\/dashboard\/invoices\/[0-9a-f-]+$/);
  const invoiceId = new URL(page.url()).pathname.split('/').at(-1);
  const invoice = check(await admin.from('invoice_balances').select('total,balance_due').eq('id', invoiceId).single());
  assert.equal(Number(invoice.total), 5000);
  assert.equal(Number(invoice.balance_due), 3800);
  orders = check(await admin.from('orders').select('id').eq('client_id', clientId));
  assert.equal(orders.length, 2);
  console.log('PASS live browser direct sale: total 5000, payment 1200, remaining 3800.');
  }

  const failedResponse = await context.request.post(`${failedBase}/api/quotations/ai`, { data: { text: quoteText, name: tag }, timeout: 45_000 });
  assert.equal(failedResponse.status(), 502);
  assert.equal((await failedResponse.json()).success, undefined);
  assert.equal(check(await admin.from('quotations').select('id').eq('details', quoteText)).length, 0);
  console.log('PASS live authenticated AI with deliberately invalid key: 502, no quote inserted.');

  const goodResponse = await context.request.post(`${base}/api/quotations/ai`, { data: { text: quoteText, name: tag }, timeout: 45_000 });
  const goodBody = await goodResponse.json();
  assert.equal(goodResponse.status(), 200, `Live AI provider did not succeed: ${goodBody.error}`);
  assert.equal(goodBody.totals.grandTotal, 9000);
  quote = check(await admin.from('quotations').select('id,share_token,parsed_items').eq('id', goodBody.quotation.id).single());
  assert.equal(quote.parsed_items.transportation_cost, 4500);
  console.log('PASS live authenticated DeepSeek -> quote saved with shipping 4500, total 9000.');
  } else {
    // Explicit fixture for testing sharing alone. This is NOT an AI success test.
    quote = check(await admin.from('quotations').insert({
      guest_name: tag, details: quoteText, status: 'draft',
      parsed_items: { products: [{ capacity: '1000 لتر', quantity: 2, price: 2250 }], transportation_cost: 4500 },
    }).select('id,share_token,parsed_items').single());
    console.log('Sharing-only mode: explicit database fixture; AI success test is not run.');
  }

  const visitor = await browser.newContext();
  const sharePage = await visitor.newPage();
  const sharedResponse = await sharePage.goto(`${base}/quote/${quote.id}?token=${quote.share_token}`);
  assert.equal(sharedResponse.status(), 200);
  await sharePage.getByText('9,000 ج.م', { exact: true }).waitFor();
  const idOnly = await visitor.request.get(`${base}/quote/${quote.id}`);
  assert.equal(idOnly.status(), 404);
  const wrongToken = await visitor.request.get(`${base}/quote/${quote.id}?token=${randomUUID()}`);
  assert.equal(wrongToken.status(), 404);
  console.log('PASS live anonymous share: correct token renders total; id-only/wrong token -> 404.');
} finally {
  // Scope every cleanup query to fixture IDs or the full unique test marker.
  try { check(await admin.from('quotations').delete().eq('details', quoteText)); } catch (e) { cleanupErrors.push(e); }
  if (clientId) {
    try {
      const orders = check(await admin.from('orders').select('id').eq('client_id', clientId));
      if (orders.length) {
        const orderIds = orders.map(o => o.id);
        const invoices = check(await admin.from('invoices').select('id').in('order_id', orderIds));
        if (invoices.length) {
          const ids = invoices.map(i => i.id);
          check(await admin.from('payments').delete().in('invoice_id', ids));
          check(await admin.from('invoices').delete().in('id', ids));
        }
        check(await admin.from('orders').delete().in('id', orderIds));
      }
      check(await admin.from('clients').delete().eq('id', clientId));
    } catch (e) { cleanupErrors.push(e); }
  }
  if (userId) {
    try { check(await admin.auth.admin.deleteUser(userId)); } catch (e) { cleanupErrors.push(e); }
  }
  if (browser) await browser.close();
  for (const server of servers) server.kill();
  if (cleanupErrors.length) throw new AggregateError(cleanupErrors, `Fixture cleanup failed for ${tag}`);
  console.log(clientId
    ? 'Live fixtures removed; invoice sequence intentionally not rewound.'
    : 'Live fixtures removed; no invoice was created.');
}
