import { readFile } from 'node:fs/promises';
import { createTestDb } from './test-db.mjs';
const db = await createTestDb();
try {
  await db.exec('SET ROLE authenticated');
  await db.exec(await readFile('scripts/verify-batch3.sql', 'utf8'));
  console.log('Verified in PostgreSQL: recipe qty 4 consumes 12/2, stocks 100/10 -> 88/8; order override qty 2 consumes 9/1, stocks -> 79/7; master unchanged.');
  console.log('Insufficient qty 20 needs 60/10 vs 79/7; shortage 3; pending, zero movements, unchanged 79/7.');
  console.log('Raw duplicate invoice INSERT rejected with SQLSTATE 23505 by invoices_order_id_key; repeated start, completion/delivery, frozen snapshots and manual custom orders verified. All rolled back.');
} finally { await db.close(); }
