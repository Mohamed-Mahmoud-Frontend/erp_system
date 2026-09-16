import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTestDb } from './test-db.mjs';
import { moduleLoader } from './test-modules.mjs';
const expected = JSON.parse(await readFile('scripts/fixtures/payroll-week.json','utf8'));
const load = moduleLoader();
const { payrollWeek } = load('lib/payroll.ts');
assert.deepEqual(payrollWeek('2026-09-10').dates,expected.week_dates);
assert.deepEqual(payrollWeek('2026-09-04').dates,expected.week_dates);
assert.equal(new Set(expected.week_dates).size,7);
const { workerTransactionSchema,attendanceSchema } = load('lib/validations/worker.ts');
const id='10000000-0000-4000-8000-000000000001';
assert.equal(workerTransactionSchema.safeParse({worker_id:id,type:'payout',amount:1}).success,false);
assert.equal(workerTransactionSchema.safeParse({worker_id:id,type:'advance',amount:1}).success,true);
assert.equal(attendanceSchema.safeParse({worker_id:id,work_date:'2026-09-07',status:'quarter_day',extra_units:0.5,extra_type:'day_fraction'}).success,true);
const db=await createTestDb();
try {
 await db.exec('SET ROLE authenticated');
 await db.exec(await readFile('scripts/verify-batch4.sql','utf8'));
 console.log('Seven dates:',expected.week_dates.join(', '));
 console.log('Hand: 4.75 * 400 + (75 + 0.5 * 400) + 125 - 300 - 50 = 1950. Database: same 4.75/400/275/125/300/50/1950; all asserted.');
 console.log('Pay All 1950 + 200 persisted; raw duplicate 23505 correct constraint; negative -50 blocked atomically; current wage 500 -> 2475 but saved payout stays 1950; no payout transactions.');
} catch (error) { console.error(error.message, error.detail ?? ''); process.exitCode=1; }
finally { await db.close(); }
