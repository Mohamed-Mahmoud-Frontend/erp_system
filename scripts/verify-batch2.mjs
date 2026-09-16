import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createTestDb } from './test-db.mjs';
import { moduleLoader } from './test-modules.mjs';
import { renderToStaticMarkup } from 'react-dom/server';
const db = await createTestDb();
try {
  await db.exec('SET ROLE authenticated');
  await db.exec(await readFile('scripts/verify-batch2.sql', 'utf8'));
  console.log('SQL actual balances: 1000 -> cash 200 -> 800 -> return 100 -> 700 -> cheque 300 -> 400 -> bounced -> 700 -> cleared twice -> 400 -> transfer 400 -> 0 -> return 50 -> -50. All asserted, stock/movements unchanged, transaction rolled back.');
  const c = randomUUID();
  await db.query("INSERT INTO clients(id,name,type,credit_days) VALUES($1,'Batch2 terms','trader',14)", [c]);
  const { rows: [invoice] } = await db.query("SELECT create_direct_invoice_atomic($1,'','','',1,100,0) AS id", [c]);
  assert.equal((await db.query('SELECT due_date = current_date + 14 AS matches FROM invoice_balances WHERE id=$1', [invoice.id])).rows[0].matches, true);
  // All entries must survive a statement larger than the REST default limit.
  await db.query("INSERT INTO payments(invoice_id,amount,method,paid_at) SELECT $1,0.01,'cash',current_date FROM generate_series(1,1005)", [invoice.id]);
  const statement = (await db.query('SELECT get_client_statement($1) AS s', [c])).rows[0].s;
  assert.equal(statement.entries.length, 1006);
  assert.equal(Number(statement.balance), 89.95);
  assert.equal(Number(statement.entries.at(-1).running_balance), 89.95);
  await db.exec('SET ROLE anon');
  await assert.rejects(db.query('SELECT * FROM invoice_balances'), /permission denied/);
  await assert.rejects(db.query('SELECT get_client_statement($1)', [c]), /permission denied/);
  await assert.rejects(db.query("SELECT record_sales_return($1,1,'test')", [invoice.id]), /permission denied/);
  await db.exec('SET ROLE authenticated');
  const load = moduleLoader({
    '@/lib/supabase/server': { createClient: async () => ({ from: () => ({ update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }) }) },
    'next/cache': { revalidatePath() { throw Error('Missing client must not revalidate'); } },
    'next/navigation': { redirect() { throw Error('Missing client must not redirect'); } },
  });
  const { updateClientAction } = load('app/(dashboard)/dashboard/clients/actions.ts');
  const result = await updateClientAction(randomUUID(), null, new FormData());
  assert.ok(result.message);
  const form = new FormData(); form.set('name','عميل تجريبي'); form.set('type','trader'); form.set('credit_days','0');
  assert.match((await updateClientAction(randomUUID(), null, form)).message, /غير موجود/);
  const loadPage = moduleLoader({
    '@/lib/supabase/server': { createClient: async () => ({ from: table => ({ select: () => ({ eq: () => table === 'clients'
      ? { maybeSingle: async () => ({ data: { id: c, name: 'Fault injection', type: 'trader', credit_days: 14 }, error: null }) }
      : { order: () => ({ limit: async () => ({ data: null, error: { message: 'deliberate SELECT failure' } }) }) }
    }) }) }) },
    './statement': () => null,
    'next/navigation': { notFound() { throw Error('A read failure must not turn into 404'); } },
  });
  const page = await loadPage('app/(dashboard)/dashboard/clients/[id]/page.tsx').default({ params: Promise.resolve({ id: c }) });
  const html = renderToStaticMarkup(page);
  assert.match(html, /تعذر تحميل أحدث الطلبات/);
  assert.doesNotMatch(html, /لا يوجد طلبات سابقة/);
  console.log('14-day client terms honored; statement 1006 entries ends at 89.95; anonymous reads/RPCs denied; missing-client action gives a real error.');
  console.log('Injected recent-orders SELECT failure renders an alert, not an empty list.');
} finally { await db.close(); }
