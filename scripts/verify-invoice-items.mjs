import assert from 'node:assert/strict';
import {createTestDb} from './test-db.mjs';
const db=await createTestDb();
try{
 await db.exec('SET ROLE authenticated');
 const client=(await db.query("INSERT INTO clients(name,type) VALUES('Invoice item test','company') RETURNING id")).rows[0].id;
 const order=(await db.query("INSERT INTO orders(client_id,quantity,product_spec) VALUES($1,3,'[]') RETURNING id",[client])).rows[0].id;
 const items=[{description:'خزان 1000 لتر',capacity:'خزان 1000 لتر',quantity:2,unit_price:1200},{description:'خزان 500 لتر',capacity:'خزان 500 لتر',quantity:1,unit_price:700}];
 const invoice=(await db.query('SELECT create_invoice_with_items($1,$2::jsonb,150,50,$3) AS id',[order,JSON.stringify(items),'ملاحظة اختبارية'])).rows[0].id;
 const saved=(await db.query('SELECT total,line_items,shipping_amount,discount_amount,notes FROM invoices WHERE id=$1',[invoice])).rows[0];
 assert.equal(Number(saved.total),3200);assert.equal(saved.line_items.length,2);assert.equal(Number(saved.shipping_amount),150);assert.equal(Number(saved.discount_amount),50);assert.equal(saved.notes,'ملاحظة اختبارية');
 await assert.rejects(db.query('SELECT create_invoice_with_items($1,$2::jsonb,0,0,$3)',[order,JSON.stringify([{...items[0],quantity:1}]),'']),/كميات البنود/);
 const direct=(await db.query('SELECT create_direct_invoice_with_items($1,$2,$3,$4,$5::jsonb,0,0,100,$6) AS id',[client,'','','',JSON.stringify([{description:'خزان صغير',capacity:'خزان صغير',quantity:1,unit_price:300}]),''])).rows[0].id;
 assert.equal(Number((await db.query('SELECT balance_due FROM invoice_balances WHERE id=$1',[direct])).rows[0].balance_due),200);
 assert.equal((await db.query('SELECT line_items FROM invoices WHERE id=$1',[direct])).rows[0].line_items.length,1);
 console.log('Invoice priced items, exact total, initial payment, and invalid quantity: passed');
}finally{await db.close()}