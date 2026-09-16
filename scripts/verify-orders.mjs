import assert from 'node:assert/strict';
import { createTestDb } from './test-db.mjs';
import { databaseClient, moduleLoader } from './test-modules.mjs';

const db = await createTestDb();
const client = databaseClient(db);
const load = moduleLoader({
  '@/lib/supabase/server': { createClient: async () => client },
  'next/cache': { revalidatePath() {} },
  'next/navigation': { redirect(path) { throw new Error(`REDIRECT:${path}`); } },
});
const { createOrderAction } = load('app/(dashboard)/dashboard/orders/new/actions.ts');
const { createDirectInvoiceAction } = load('app/(dashboard)/dashboard/invoices/actions.ts');
function form(fields) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  data.append('capacity[]', '1000 لتر');
  data.append('quantity[]', '2');
  return data;
}
try {
  const { rows: [existing] } = await db.query("INSERT INTO clients(name,type) VALUES ('Existing test client','trader') RETURNING id");
  await assert.rejects(createOrderAction(null, form({ client_id: existing.id })), /REDIRECT:\/dashboard\/orders/);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM orders WHERE client_id=$1', [existing.id])).rows[0].n, 1);
  await assert.rejects(createOrderAction(null, form({ client_name: 'Inline client', client_type: 'individual' })), /REDIRECT:/);
  await assert.rejects(createDirectInvoiceAction(null, form({ client_id: existing.id, total: '5000', paid_amount: '1200' })), /REDIRECT:\/dashboard\/invoices\//);
  await assert.rejects(createDirectInvoiceAction(null, form({ client_name: 'Direct new client', client_type: 'company', total: '3000', paid_amount: '1000' })), /REDIRECT:/);
  const { rows } = await db.query('SELECT total, balance_due FROM invoice_balances ORDER BY total');
  assert.deepEqual(rows.map(r => [Number(r.total), Number(r.balance_due)]), [[3000, 2000], [5000, 3800]]);
  const { rows: [counts] } = await db.query('SELECT (SELECT count(*)::int FROM clients) AS clients, (SELECT count(*)::int FROM orders) AS orders, (SELECT count(*)::int FROM payments) AS payments');
  assert.deepEqual(counts, { clients: 3, orders: 4, payments: 2 });
  const rejected = await createOrderAction(null, form({ client_name: 'Missing type' }));
  assert.ok(rejected.errors);
  const overpayment = await createDirectInvoiceAction(null, form({ client_id: existing.id, total: '100', paid_amount: '101' }));
  assert.ok(overpayment.errors.paid_amount);
  console.log('PASS real FormData -> actions -> validation -> PostgreSQL: existing and inline orders; existing and new direct sales; balances 3800/2000; no duplicate existing client; invalid input rejected.');
} finally {
  await db.close();
}
