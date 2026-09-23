import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { parse } from 'dotenv';
import { chromium, expect } from '@playwright/test';

// This suite verifies presentation and interactions against isolated fixture data.
// It never verifies or writes to the live Supabase service.
const env = parse(await readFile('.env.local'));
const user = { id: '10000000-0000-4000-8000-000000000099', aud: 'authenticated', role: 'authenticated', email: 'design-preview@example.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const worker = { id: '10000000-0000-4000-8000-000000000088', name: 'عامل المعاينة' };
const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 }, 'test'].map(x => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url')).join('.');
const api = createServer(async (req, res) => {
  for await (const chunk of req) void chunk;
  const path = new URL(req.url, 'http://localhost').pathname;
  let data = [];
  if (path.startsWith('/auth/')) data = path.endsWith('/user') ? user : { access_token: token, token_type: 'bearer', expires_in: 3600, refresh_token: 'preview', user };
  if (path.includes('/user_access')) data = [{ user_id: user.id, email: user.email, role: 'admin', permissions: [], active: true }];
  if (path.includes('/worker_directory')) data = [worker];
  if (path.includes('/attendance_status')) data = [
    { id: '10000000-0000-4000-8000-000000000077', worker_name: worker.name, status: 'present', extra_type: 'amount', extra_units: 50, week_paid: false },
    { id: '10000000-0000-4000-8000-000000000076', worker_name: 'عامل تجريبي', status: 'absent', extra_type: 'amount', extra_units: 0, week_paid: true },
  ];
  if (path.endsWith('/clients')) data = [{ id: '10000000-0000-4000-8000-000000000066', name: 'عميل المعاينة', type: 'company', credit_days: 14, phone: null }];

  if (req.headers.accept?.includes('vnd.pgrst.object') && Array.isArray(data)) data = data[0] ?? null;
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
});
await new Promise(r => api.listen(3112, '127.0.0.1', r));
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3111'], {
  windowsHide: true,
  stdio: 'ignore',
  env: { ...process.env, NODE_OPTIONS: `--import=${pathToFileURL(resolve('scripts/batch5-fetch-isolation.mjs')).href}`, BATCH5_SUPABASE_ORIGIN: env.NEXT_PUBLIC_SUPABASE_URL, BATCH5_TEST_GATEWAY: 'http://127.0.0.1:3112' },
});
let browser;
const errors = [];
const base = 'http://localhost:3111';
const viewports = [360, 390, 768, 1024, 1440];
try {
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(base + '/login')).ok) { ready = true; break; } } catch {}
    await delay(500);
  }
  if (!ready) throw Error('Preview server did not become ready');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => ['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort());
  await mkdir('audit/design', { recursive: true });
  const screenshot = async name => {
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      await document.fonts.ready;
      const focused = document.activeElement;
      if (focused instanceof HTMLElement) focused.blur();
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    return page.screenshot({ path: 'audit/design/' + name + '.png', fullPage: true });
  };
  const noOverflow = async label => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label).toBe(true);
  };

  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await screenshot('public-desktop');
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 950 });
    await noOverflow('Public site overflow at ' + width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot('public-mobile');
  await page.getByRole('button', { name: 'فتح القائمة الرئيسية' }).click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'فتح القائمة الرئيسية' })).toHaveAttribute('aria-expanded', 'false');

  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(base + '/login');
  await screenshot('login-desktop');
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill('preview-only');
  await page.locator('#login-submit').click();
  await page.waitForURL('**/dashboard');
  await expect(page.locator('h1')).toContainText('نظرة عامة');
  await screenshot('dashboard-desktop');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('textbox', { name: 'بحث في الأقسام', exact: true })).toBeFocused();
  await page.getByRole('textbox', { name: 'بحث في الأقسام', exact: true }).fill('قسم غير موجود');
  await expect(page.getByRole('status')).toContainText('لا يوجد قسم');
  await page.getByRole('textbox', { name: 'بحث في الأقسام', exact: true }).fill('');
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 950 });
    await noOverflow('Dashboard overflow at ' + width);
    const geometry = await page.locator('.erp-workspace').boundingBox();
    expect(geometry.x, 'Workspace must remain in the viewport').toBeGreaterThanOrEqual(0);
    expect(geometry.x + geometry.width).toBeLessThanOrEqual(width + 1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot('dashboard-mobile');
  await page.getByRole('button', { name: 'فتح القائمة', exact: true }).click();
  await expect(page.locator('#mobile-navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'فتح القائمة', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'فتح القائمة', exact: true }).click();
  await page.locator('#mobile-navigation').getByRole('link', { name: 'العملاء', exact: true }).click();
  await page.waitForURL('**/dashboard/clients');
  await expect(page.locator('#mobile-navigation')).not.toBeVisible();
  await noOverflow('Clients mobile overflow');
  await screenshot('clients-mobile');

  await page.goto(base + '/dashboard/workers/attendance');
  await expect(page.getByRole('heading', { name: 'الحضور واليوميات', exact: true })).toBeVisible();
  const form = page.getByRole('form', { name: 'تسجيل اليومية' });
  await form.locator('select[name=worker_id]').selectOption(worker.id);
  await form.getByRole('radio', { name: 'غائب', exact: true }).check();
  await expect(form.getByRole('radio', { name: 'غائب', exact: true })).toBeChecked();
  await expect(form.locator('input[name=extra_units]')).toHaveAttribute('type', 'hidden');
  expect(await form.evaluate(el => new FormData(el).get('status'))).toBe('absent');
  await form.getByRole('radio', { name: 'نصف يوم', exact: true }).check();
  await expect(form.getByLabel('قيمة الإضافة')).toBeVisible();
  expect(await form.evaluate(el => new FormData(el).get('status'))).toBe('half_day');
  await expect(page.getByRole('cell', { name: 'عامل تجريبي', exact: true })).toBeVisible();
  const tableScroller = page.locator('.overflow-x-auto').filter({ has: page.locator('table') }).last();
  expect(await tableScroller.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  await screenshot('attendance-mobile');
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 950 });
    await noOverflow('Attendance overflow at ' + width);
  }
  await screenshot('attendance-desktop');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.erp-sidebar')).not.toBeVisible();
  expect(await page.locator('.erp-workspace').evaluate(el => Math.round(el.getBoundingClientRect().width))).toBe(1440);
  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await page.goto(base + '/login');
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow('Login mobile overflow');
  await screenshot('login-mobile');
  if (errors.length) throw Error(errors.join('\n'));
  await writeFile('audit/design/verification.json', JSON.stringify({
    passed: true,
    scope: 'Isolated fixtures: visual, responsive, keyboard navigation, attendance form values, print. No live service verification or database writes.',
    viewports, pageErrors: errors,
  }, null, 2));
  console.log('PASS: public/login/dashboard/attendance responsive layouts, navigation, keyboard search, attendance values, print layout, and no browser exceptions. Fixture data only.');
} finally {
  await browser?.close();
  server.kill();
  api.closeAllConnections();
  await new Promise(r => api.close(r));
}
