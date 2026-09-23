import assert from "node:assert/strict";
import { createTestDb } from "./test-db.mjs";
const db=await createTestDb();
try {
 await db.exec("SET ROLE authenticated");
 const supplier=(await db.query("INSERT INTO suppliers(name,opening_balance) VALUES('مورد اختبار',0) RETURNING id")).rows[0].id;
 const material=(await db.query("INSERT INTO materials(type,unit) VALUES('بلاستيك','kg') RETURNING id")).rows[0].id;
 await db.query("SELECT record_priced_material_receipt($1,$2,500,'per_ton',1000,'SUP-1',CURRENT_DATE)",[material,supplier]);
 let account=(await db.query("SELECT balance,purchases,payments FROM supplier_balances WHERE id=$1",[supplier])).rows[0];
 assert.equal(Number(account.balance),500);assert.equal(Number(account.purchases),500);
 assert.equal(Number((await db.query("SELECT stock_qty FROM materials WHERE id=$1",[material])).rows[0].stock_qty),500);
 await assert.rejects(db.query("SELECT record_priced_material_receipt($1,$2,100,'total',50,'SUP-1',CURRENT_DATE)",[material,supplier]),/unique|duplicate/i);
 assert.equal(Number((await db.query("SELECT stock_qty FROM materials WHERE id=$1",[material])).rows[0].stock_qty),500);
 await db.query("SELECT record_supplier_transaction_detailed($1,'payment',200,'PAY-1','partial',CURRENT_DATE)",[supplier]);
 account=(await db.query("SELECT balance,purchases,payments FROM supplier_balances WHERE id=$1",[supplier])).rows[0];
 assert.equal(Number(account.balance),300);assert.equal(Number(account.payments),200);
 const worker=(await db.query("INSERT INTO workers(name,daily_wage) VALUES('عامل اختبار',100) RETURNING id")).rows[0].id;
 await db.query("SELECT record_worker_day($1,CURRENT_DATE,'present','amount',25,30,10,5)",[worker]);
 const transactions=(await db.query("SELECT type,amount FROM worker_transactions WHERE worker_id=$1 ORDER BY type",[worker])).rows;
 assert.deepEqual(transactions.map(row=>[row.type,Number(row.amount)]),[["advance",30],["bonus",10],["deduction",5]]);
 await assert.rejects(db.query("SELECT record_worker_day($1,CURRENT_DATE,'present','amount',0,99,0,0)",[worker]),/unique|duplicate/i);
 assert.equal((await db.query("SELECT count(*)::int AS count FROM worker_transactions WHERE worker_id=$1",[worker])).rows[0].count,3);
 console.log("Atomic supplier receipt, unique reference, full balances, and single worker day: passed");
}finally{await db.close()}