-- Runs equally on live PostgreSQL and isolated PGlite; all fixtures roll back.
BEGIN;
DO $$
DECLARE
 c uuid; o uuid; i uuid; p uuid; ch uuid; r uuid; bal numeric; statement jsonb;
 stock_before jsonb; stock_after jsonb; movement_count bigint;
BEGIN
 SELECT jsonb_agg(jsonb_build_array(id,stock_qty) ORDER BY id) INTO stock_before FROM materials;
 SELECT count(*) INTO movement_count FROM material_movements;
 INSERT INTO clients(name,type,credit_days) VALUES ('Batch2-rollback-verification','trader',14) RETURNING id INTO c;
 INSERT INTO orders(client_id,quantity) VALUES(c,2) RETURNING id INTO o;
 INSERT INTO invoices(order_id,invoice_number,total,due_date) VALUES(o,'BATCH2-'||gen_random_uuid(),1000,current_date-1) RETURNING id INTO i;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 1000 THEN RAISE EXCEPTION 'Initial balance %',bal; END IF;
 p := record_payment_atomic(i,200,'cash');
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 800 THEN RAISE EXCEPTION 'Cash balance %',bal; END IF;
 RAISE NOTICE 'Normal payment: 1000 -> 800 (cash 200)';
 r := record_sales_return(i,100,'معطوب/اسكراب','Batch2 rollback test');
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 700 THEN RAISE EXCEPTION 'Return balance %',bal; END IF;
 RAISE NOTICE 'Partial return: 800 -> 700 (return 100)';
 p := record_payment_atomic(i,300,'cheque',current_date+3);
 SELECT id INTO ch FROM cheques WHERE payment_id=p;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 400 THEN RAISE EXCEPTION 'Cheque balance %',bal; END IF;
 RAISE NOTICE 'Pending cheque: 700 -> 400 (cheque 300)';
 UPDATE cheques SET status='bounced' WHERE id=ch;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 700 THEN RAISE EXCEPTION 'Bounced balance %',bal; END IF;
 statement := get_client_statement(c);
 IF statement->>'balance' <> '700' OR jsonb_array_length(statement->'entries') <> 4 OR
    NOT EXISTS (SELECT 1 FROM jsonb_array_elements(statement->'entries') e WHERE e->>'bounced'='true' AND e->>'credit'='0' AND e->>'original_amount'='300') THEN
   RAISE EXCEPTION 'Bounced statement %',statement;
 END IF;
 RAISE NOTICE 'Bounce: 400 -> 700; statement keeps cheque 300 with effective credit 0';
 UPDATE cheques SET status='cleared' WHERE id=ch;
 UPDATE cheques SET status='cleared' WHERE id=ch;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 400 THEN RAISE EXCEPTION 'Re-cleared balance %',bal; END IF;
 RAISE NOTICE 'Re-clear (including repeat): 700 -> 400 -> 400';
 BEGIN
   PERFORM record_payment_atomic(i,401,'cash');
   RAISE EXCEPTION 'Unexpected overpayment success' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL;
 END;
 BEGIN
   PERFORM record_sales_return(i,901,'too much');
   RAISE EXCEPTION 'Unexpected excessive return success' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL;
 END;
 PERFORM record_payment_atomic(i,400,'transfer');
 PERFORM record_sales_return(i,50,'سبب حر غير مصنف');
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> -50 THEN RAISE EXCEPTION 'Client credit %',bal; END IF;
 statement := get_client_statement(c);
 IF (statement->>'balance')::numeric <> -50 OR (statement->'entries'->-1->>'running_balance')::numeric <> -50 THEN RAISE EXCEPTION 'Final statement %',statement; END IF;
 RAISE NOTICE 'Transfer 400: 400 -> 0; return after full payment 50: 0 -> -50 (client credit)';
 -- Direct modifications also recompute immediately: there is no adjustment writer.
 UPDATE payments SET amount=250 WHERE id=p;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 0 THEN RAISE EXCEPTION 'Payment edit %',bal; END IF;
 UPDATE sales_returns SET voided_at=clock_timestamp(),voided_reason='Batch5 correction test' WHERE id=r;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 100 THEN RAISE EXCEPTION 'Return void %',bal; END IF;
 UPDATE invoices SET total=1100 WHERE id=i;
 SELECT balance_due INTO bal FROM invoice_balances WHERE id=i;
 IF bal <> 200 THEN RAISE EXCEPTION 'Invoice total change %',bal; END IF;
 SELECT jsonb_agg(jsonb_build_array(id,stock_qty) ORDER BY id) INTO stock_after FROM materials;
 IF stock_before IS DISTINCT FROM stock_after OR movement_count <> (SELECT count(*) FROM material_movements) THEN RAISE EXCEPTION 'Sales return touched material stock/movements'; END IF;
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='invoices' AND column_name='balance_due') THEN RAISE EXCEPTION 'Stored balance remains'; END IF;
 IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prosrc ~* '(set\s+balance_due\s*=|insert\s+into\s+invoices[^;]*balance_due)') THEN RAISE EXCEPTION 'Active balance writer remains'; END IF;
 RAISE NOTICE 'Direct payment/return/total changes reflected; stored column absent; no active writer; materials and movements unchanged';
END;
$$;
ROLLBACK;
