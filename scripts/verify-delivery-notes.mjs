import assert from 'node:assert/strict';
import {createTestDb} from './test-db.mjs';
import {moduleLoader} from './test-modules.mjs';
const {deliveryNoteSchema}=moduleLoader()('lib/delivery-notes.ts');
const payload={id:'30000000-0000-4000-8000-000000000001',delivery_date:'2026-09-16',customer_name:'Factory client',recipient_name:'Recipient',recipient_phone:'',delivery_address:'',driver_name:'',vehicle_number:'',notes:'',items:[{description:'Tank',quantity:2,unit:'piece'},{description:'Pipe',quantity:1.125,unit:'m'}]};
assert.equal(deliveryNoteSchema.safeParse(payload).success,true);
for(const change of [{items:[]},{delivery_date:'2026-02-30'},{customer_name:' '},{items:[{description:'Tank',quantity:0,unit:'piece'}]},{items:[{description:'Tank',quantity:0.0001,unit:'piece'}]}]) assert.equal(deliveryNoteSchema.safeParse({...payload,...change}).success,false);
const db=await createTestDb();
try {
 await db.exec("SET ROLE authenticated");
 const sql="INSERT INTO delivery_notes(id,delivery_date,customer_name,recipient_name,items) VALUES($1,$2,$3,$4,$5) RETURNING *";
 const args=[payload.id,payload.delivery_date,payload.customer_name,payload.recipient_name,JSON.stringify(payload.items)];
 const inserted=(await db.query(sql,args)).rows[0];
 assert.equal(Number(inserted.note_number),1);
 assert.equal(inserted.created_by,'10000000-0000-4000-8000-000000000099');
 assert.deepEqual(inserted.items,payload.items);
 await assert.rejects(db.query(sql,args),e=>e.code==='23505');
 for(const items of [[],{},[{}],[{description:'Tank',quantity:-1,unit:'piece'}],[{description:'Tank',quantity:0.0001,unit:'piece'}],[{description:'',quantity:2,unit:'piece'}]]) {
  await assert.rejects(db.query("INSERT INTO delivery_notes(delivery_date,customer_name,recipient_name,items) VALUES('2026-09-16','Client','Receiver',$1)",[JSON.stringify(items)]),e=>e.code==='23514');
 }
 await assert.rejects(db.exec("UPDATE delivery_notes SET customer_name='changed'"),e=>e.code==='42501');
 await assert.rejects(db.exec("DELETE FROM delivery_notes"),e=>e.code==='42501');
 await assert.rejects(db.exec("INSERT INTO delivery_notes(delivery_date,customer_name,recipient_name,items,created_by) VALUES('2026-09-16','C','R','[]','10000000-0000-4000-8000-000000000099')"),e=>e.code==='42501');
 await db.exec("RESET ROLE; INSERT INTO auth.users VALUES('30000000-0000-4000-8000-000000000002','delivery-test@example.com'); INSERT INTO user_access(user_id,email,permissions) VALUES('30000000-0000-4000-8000-000000000002','delivery-test@example.com',ARRAY['attendance']); SELECT set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',false); SET ROLE authenticated");
 assert.equal((await db.query("SELECT * FROM delivery_notes")).rows.length,0);
 await assert.rejects(db.query(sql,['30000000-0000-4000-8000-000000000003',...args.slice(1)]),e=>e.code==='42501');
 for(const permission of ['production','sales']) {
  await db.exec("RESET ROLE; UPDATE user_access SET permissions=ARRAY['"+permission+"'] WHERE user_id='30000000-0000-4000-8000-000000000002'; SET ROLE authenticated");
  const saved=await db.query("INSERT INTO delivery_notes(delivery_date,customer_name,recipient_name,items) VALUES('2026-09-16','Client','Receiver',$1) RETURNING id",[JSON.stringify(payload.items)]);
  assert.equal(saved.rows.length,1);
 }
 assert.equal((await db.query("SELECT * FROM delivery_notes")).rows.length,3);
 await db.exec("RESET ROLE; UPDATE user_access SET active=false WHERE user_id='30000000-0000-4000-8000-000000000002'; SET ROLE authenticated");
 assert.equal((await db.query("SELECT * FROM delivery_notes")).rows.length,0);
 await db.exec("RESET ROLE; SET ROLE anon");
 await assert.rejects(db.query("SELECT * FROM delivery_notes"),e=>e.code==='42501');
 await db.exec("RESET ROLE");
 for(const table of ['invoices','orders','material_movements','payments']) assert.equal(Number((await db.query('SELECT count(*) AS n FROM '+table)).rows[0].n),0);
 console.log('PASS: delivery persistence, generated numbering, duplicate protection, invalid input rejection, immutable documents, sales/production access, disabled/unauthorized/anonymous denial, no stock or financial mutation. Isolated PostgreSQL; no live service verification.');
} finally {await db.close();}
