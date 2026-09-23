import assert from 'node:assert/strict';
import {createTestDb} from './test-db.mjs';
const db=await createTestDb();
try{
 await db.exec('SET ROLE authenticated');
 const supplier=(await db.query("INSERT INTO suppliers(name,opening_balance) VALUES('Test supplier',0) RETURNING id")).rows[0].id;
 await db.query("SELECT record_supplier_transaction_detailed($1,'invoice',250,'INV-1','خامة 10 كجم',CURRENT_DATE)",[supplier]);
 await db.query("SELECT record_supplier_transaction_detailed($1,'payment',100,'PAY-1','تحويل بنكي',CURRENT_DATE)",[supplier]);
 const row=(await db.query('SELECT balance FROM supplier_balances WHERE id=$1',[supplier])).rows[0];
 assert.equal(Number(row.balance),150);
 const history=(await db.query('SELECT reference,description,occurred_on FROM supplier_transactions WHERE supplier_id=$1 ORDER BY created_at',[supplier])).rows;
 assert.equal(history.length,2);assert.equal(history[0].reference,'INV-1');assert.equal(history[0].description,'خامة 10 كجم');
 await assert.rejects(db.query("SELECT record_supplier_transaction_detailed($1,'invoice',5,'','','1990-01-01'::date)",[supplier]),/تاريخ/);
 console.log('Supplier dated references, descriptions, balance, and invalid date: passed');
}finally{await db.close()}