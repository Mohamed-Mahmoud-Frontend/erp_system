import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { parse } from 'dotenv';
import { chromium, expect } from '@playwright/test';

// UI/print checks only. Supabase requests are redirected to fixture data.
const env = parse(await readFile('.env.local'));
const shareToken = '20000000-0000-4000-8000-000000000001';
const ids = [1, 2, 3, 4].map(n => '30000000-0000-4000-8000-' + String(n).padStart(12, '0'));
const item = { capacity: '10000 لتر', quantity: 5, price: 22000, material: 'بولي إيثيلين بيور 100% درجة أولى — 3 طبقات' };
const header = { guest_name: 'شركة نيوميكس للتجارة والمقاولات', guest_phone: '01000000000', created_at: '2026-09-17T10:00:00.000Z' };
const fixtures = new Map([
  [ids[0], { ...header, parsed_items: { products: [item], transportation_cost: 0 } }],
  [ids[1], { ...header, guest_name: 'عميل الاختبار الثاني', parsed_items: { products: [{ ...item, capacity: '1000 لتر', quantity: 3, price: 0.1 }, { ...item, capacity: '2000 لتر', quantity: 2, price: 1250.25 }], transportation_cost: 4500 } }],
  [ids[2], { ...header, parsed_items: { products: [], transportation_cost: 0 } }],
  [ids[3], { ...header, parsed_items: { products: Array.from({ length: 12 }, (_, i) => ({ ...item, capacity: (i + 1) * 500 + ' لتر', quantity: 1, price: 1000 })), transportation_cost: 500 } }],
]);
const gateway = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.endsWith('/quotations') && req.headers['x-quotation-token'] === shareToken) {
    const data = fixtures.get(url.searchParams.get('id')?.replace(/^eq\./, '')) ?? null;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end('null');
});
await new Promise(resolve => gateway.listen(3132, '127.0.0.1', resolve));
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3131'], {
  windowsHide: true, stdio: 'ignore',
  env: { ...process.env, NODE_OPTIONS: '--import=' + pathToFileURL(resolve('scripts/batch5-fetch-isolation.mjs')).href, BATCH5_SUPABASE_ORIGIN: env.NEXT_PUBLIC_SUPABASE_URL, BATCH5_TEST_GATEWAY: 'http://127.0.0.1:3132' },
});
const base = 'http://localhost:3131';
let browser;
try {
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(base + '/login', { signal: AbortSignal.timeout(3000) })).ok) { ready = true; break; } } catch {}
    await delay(500);
  }
  assert.ok(ready, 'Preview server is ready');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  const open = async id => {
    await page.goto(base + '/quote/' + id + '?token=' + shareToken);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
  };
  await mkdir('audit/quotation', { recursive: true });
  await open(ids[0]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('عرض سعر توريد خزان مياه بولي إيثيلين');
  await expect(page.getByTestId('grand-total')).toHaveText('110,000.00 جنيه');
  await expect(page.locator('.quote-document img')).toHaveCount(1);
  await expect(page.locator('.quotation-logo')).toHaveAttribute('src', '/quotations/poly.png');
  assert.ok(await page.locator('.quotation-logo').evaluate(img => img.complete && img.naturalWidth > 0));
  await expect(page.locator('body > header')).not.toBeVisible();
  await expect(page.locator('body > footer')).not.toBeVisible();
  assert.equal(await page.locator('.hero').evaluate(el => getComputedStyle(el).backgroundImage.includes('linear-gradient')), true);
  await page.screenshot({ path: 'audit/quotation/desktop.png', fullPage: true });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page overflow at ' + width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.locator('.quotation-table-scroll').evaluate(el => el.scrollWidth > el.clientWidth), 'Table scrolls within its card');
  await page.screenshot({ path: 'audit/quotation/mobile.png', fullPage: true });
  await page.evaluate(() => { window.__quotationPrintCalled = false; window.print = () => { window.__quotationPrintCalled = true; }; });
  await page.getByRole('button', { name: 'تصدير العرض بصيغة PDF' }).click();
  assert.ok(await page.evaluate(() => window.__quotationPrintCalled), 'Export opens the browser PDF/print workflow');

  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.quotation-export')).not.toBeVisible();
  assert.ok(await page.locator('table').evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Printed table is not horizontally clipped');
  const pdf = await page.pdf({ path: 'audit/quotation/quotation.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  assert.ok(pdf.subarray(0, 4).equals(Buffer.from('%PDF')));
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
  assert.ok(pages > 0 && pages <= 7, 'Reference quote fits a bounded set of A4 pages');
  await page.emulateMedia({ media: 'screen' });
  await open(ids[1]);
  await expect(page.getByTestId('items-total')).toHaveText('2,500.80 جنيه');
  await expect(page.getByTestId('transport-total')).toHaveText('4,500.00 جنيه');
  await expect(page.getByTestId('grand-total')).toHaveText('7,000.80 جنيه');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.locator('.sheet')).not.toContainText('نيوميكس');
  await expect(page.locator('.sheet')).not.toContainText('110,000');
  await expect(page.locator('.sheet')).not.toContainText('شامل مجاناً');
  await open(ids[2]);
  await expect(page.getByRole('status')).toHaveText('لم تُحدد بنود مسعّرة بعد.');
  await expect(page.getByTestId('grand-total')).toHaveText('0.00 جنيه');
  await open(ids[3]);
  await expect(page.locator('tbody tr')).toHaveCount(12);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: 'audit/quotation/multiple-items.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  assert.deepEqual(errors, []);
  await writeFile('audit/quotation/verification.json', JSON.stringify({ passed: true, scope: 'Isolated UI fixtures and local A4 PDF generation. No live integration verification.', viewports: [360, 390, 768, 1024, 1440], referencePdfPages: pages, browserErrors: errors }, null, 2));
  console.log('PASS: reference layout, single supplied logo, local fonts, 5 viewports, dynamic single/multiple/empty items, decimal totals and transport, print action, A4 PDFs, no browser errors. Fixture data only.');
} finally {
  await browser?.close();
  server.kill();
  gateway.closeAllConnections();
  await new Promise(resolve => gateway.close(resolve));
}
