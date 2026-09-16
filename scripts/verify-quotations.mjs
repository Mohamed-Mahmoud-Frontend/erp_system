import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createTestDb } from './test-db.mjs';
import { databaseClient, moduleLoader } from './test-modules.mjs';

const db = await createTestDb();
const sqlClient = databaseClient(db);
let user = null;
let providerMode = 'success';
let providerCalls = 0;
const output = {
  guest_name: 'Quotation test', guest_phone: '01000000000', transportation_cost: 4500,
  products: [{ capacity: '1000 لتر', quantity: 2, price: 2250, material: 'بولي إيثيلين' }],
};
// Only external provider and session lookup are controlled. The real route,
// schemas, rate limiter, totals, SQL INSERT and database RLS execute unchanged.
class TestProvider {
  chat = { completions: { create: async () => {
    providerCalls++;
    if (providerMode === 'failure') throw new Error('Deliberate provider outage');
    return { choices: [{ finish_reason: 'stop', message: { content:
      providerMode === 'malformed' ? '{bad JSON' : JSON.stringify(providerMode === 'invalid' ? { products: [] } : output),
    } }] };
  } } };
}
const load = moduleLoader({
  '@/lib/supabase/server': { createClient: async () => ({
    ...sqlClient, auth: { getUser: async () => ({ data: { user }, error: null }) },
  }) },
  openai: TestProvider,
});
const { POST } = load('app/api/quotations/ai/route.ts');
const { parseQuotationItems, quotationTotals } = load('lib/quotations/items.ts');
const previousKey = process.env.DEEPSEEK_API_KEY;
process.env.DEEPSEEK_API_KEY = 'isolated-test-key';
const request = (body = JSON.stringify({ text: 'خزانين 1000 لتر، سعر الواحد 2250 والنقل 4500' })) =>
  new Request('http://localhost/api/quotations/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
try {
  const unauth = await POST(request());
  assert.equal(unauth.status, 401);
  assert.equal(providerCalls, 0);

  user = { id: randomUUID() };
  await db.exec('SET ROLE authenticated');
  const success = await POST(request());
  assert.equal(success.status, 200);
  const result = await success.json();
  assert.equal(result.success, true);
  const { rows: [saved] } = await db.query('SELECT * FROM quotations WHERE id=$1', [result.quotation.id]);
  assert.equal(saved.parsed_items.transportation_cost, 4500);
  assert.equal(quotationTotals(parseQuotationItems(saved.parsed_items)).grandTotal, 9000);
  assert.equal(result.totals.grandTotal, 9000);
  assert.ok(result.quotation.share_token);

  providerMode = 'failure';
  const failed = await POST(request());
  assert.equal(failed.status, 502);
  assert.equal((await failed.json()).success, undefined);
  providerMode = 'malformed';
  assert.equal((await POST(request())).status, 502);
  providerMode = 'invalid';
  assert.equal((await POST(request())).status, 422);
  assert.equal((await POST(request('{'))).status, 400);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n, 1);

  user = { id: randomUUID() };
  providerMode = 'failure';
  for (let i = 0; i < 10; i++) assert.equal((await POST(request())).status, 502);
  const callsBeforeLimit = providerCalls;
  const limited = await POST(request());
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  assert.equal(providerCalls, callsBeforeLimit);

  const { rows: [other] } = await db.query("INSERT INTO quotations(guest_name,status) VALUES ('Other private quote','draft') RETURNING id");
  await db.exec('SET ROLE anon');
  assert.equal((await db.query('SELECT * FROM quotations')).rows.length, 0);
  assert.equal((await db.query('SELECT * FROM quotations WHERE id=$1', [saved.id])).rows.length, 0);
  await db.query("SELECT set_config('request.headers', $1, false)", [JSON.stringify({ 'x-quotation-token': saved.share_token })]);
  assert.deepEqual((await db.query('SELECT id FROM quotations')).rows, [{ id: saved.id }]);
  assert.equal((await db.query('SELECT * FROM quotations WHERE id=$1', [other.id])).rows.length, 0);
  await assert.rejects(db.query("UPDATE quotations SET guest_name='Changed' WHERE id=$1", [saved.id]), /permission denied/);
  await assert.rejects(db.query('DELETE FROM quotations WHERE id=$1', [saved.id]), /permission denied/);
  await assert.rejects(db.query("INSERT INTO quotations(guest_name,share_token) VALUES ('Forged',$1)", [randomUUID()]), /permission denied/);
  await db.query("SELECT set_config('request.headers', '{}', false)");
  await db.query("INSERT INTO quotations(guest_name,guest_phone,details,status) VALUES ('Public request','01000000000','طلب جديد','draft')");
  await db.query("SELECT set_config('request.headers', $1, false)", [JSON.stringify({ 'x-quotation-token': randomUUID() })]);
  assert.equal((await db.query('SELECT * FROM quotations')).rows.length, 0);
  await db.exec('RESET ROLE');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n, 3);

  assert.equal(quotationTotals({ products: [{ price: 0.1, quantity: 3 }], transportation_cost: 0.2 }).grandTotal, 0.5);
  console.log('PASS AI route: anon 401/no provider call; authenticated 200; saved total 9000 incl. shipping 4500; deliberate failure/malformed output 502 with no insert; invalid products 422; malformed request 400; rate limit 429.');
  console.log('PASS anon RLS: no token/id-only/wrong token cannot read; correct token lists exactly one quote; cannot read other id or update/delete/forge token; public request insert still works.');
} finally {
  if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = previousKey;
  await db.close();
}
