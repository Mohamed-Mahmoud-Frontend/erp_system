BEGIN;
SELECT set_config('request.jwt.claim.sub',(SELECT user_id::text FROM public.user_access WHERE role='admin' AND active LIMIT 1),true);
INSERT INTO auth.users(id,email) VALUES('60000000-0000-4000-8000-000000000001','readiness-sql@example.com');
INSERT INTO user_access(user_id,email,permissions) VALUES('60000000-0000-4000-8000-000000000001','readiness-sql@example.com',ARRAY['production']);
INSERT INTO clients(id,name,type) VALUES('60000000-0000-4000-8000-000000000002','Readiness SQL rollback','trader');
INSERT INTO materials(id,type,unit,stock_qty) VALUES('60000000-0000-4000-8000-000000000003','Readiness SQL rollback','kg',100);
INSERT INTO product_specs(id,name) VALUES('60000000-0000-4000-8000-000000000004','Readiness SQL rollback');
INSERT INTO product_spec_materials VALUES('60000000-0000-4000-8000-000000000004','60000000-0000-4000-8000-000000000003',2);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
INSERT INTO orders(id,client_id,quantity,product_spec_id,product_spec) VALUES('60000000-0000-4000-8000-000000000005','60000000-0000-4000-8000-000000000002',3,'60000000-0000-4000-8000-000000000004','{}');
UPDATE orders SET status='in_production' WHERE id='60000000-0000-4000-8000-000000000005';
DO $$ BEGIN
 IF (SELECT stock_qty FROM materials WHERE id='60000000-0000-4000-8000-000000000003')<>94 THEN RAISE EXCEPTION 'Expected 94'; END IF;
 IF (SELECT count(*) FROM material_movements WHERE order_id='60000000-0000-4000-8000-000000000005')<>1 THEN RAISE EXCEPTION 'Expected one movement'; END IF;
 BEGIN
  INSERT INTO product_specs(name) VALUES('forbidden employee recipe');
  RAISE EXCEPTION 'Unauthorized recipe insert succeeded' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL ROLE postgres;
UPDATE user_access SET permissions=ARRAY['sales'] WHERE user_id='60000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
INSERT INTO invoices(id,order_id,invoice_number,total) VALUES('60000000-0000-4000-8000-000000000006','60000000-0000-4000-8000-000000000005','Readiness-rollback-no-sequence',1000);
INSERT INTO payments(invoice_id,amount,method,paid_at) VALUES('60000000-0000-4000-8000-000000000006',200,'cash',CURRENT_DATE);
DO $$ BEGIN
 IF (SELECT balance_due FROM invoice_balances WHERE id='60000000-0000-4000-8000-000000000006')<>800 THEN RAISE EXCEPTION 'Expected balance800'; END IF;
 BEGIN
  UPDATE orders SET status='completed' WHERE id='60000000-0000-4000-8000-000000000005';
  RAISE EXCEPTION 'Sales changed production status' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM sheet_snapshot('workers');
  RAISE EXCEPTION 'Employee exported workers' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT jsonb_build_object('production_stock_before',100,'production_stock_after',(SELECT stock_qty FROM materials WHERE id='60000000-0000-4000-8000-000000000003'),'sales_invoice',1000,'sales_payment',200,'sales_balance',(SELECT balance_due FROM invoice_balances WHERE id='60000000-0000-4000-8000-000000000006'),'forbidden_operations_rejected',true) AS verified;
ROLLBACK;
