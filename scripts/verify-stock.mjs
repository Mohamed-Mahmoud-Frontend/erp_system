import { readFile } from 'node:fs/promises';
import { createTestDb } from './test-db.mjs';

const db = await createTestDb();
try {
  await db.exec('SET ROLE authenticated');
  await db.exec(await readFile('scripts/verify-stock.sql', 'utf8'));
  console.log('PASS stock: in +20 once; out -12.5 once; unlinked out -7.5; both returns unchanged; direct insert -10; insufficient stock rolls back.');
} finally {
  await db.close();
}
