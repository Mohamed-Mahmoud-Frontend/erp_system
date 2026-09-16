-- Real PostgreSQL, no lasting fixtures, no DELETE of a payout or sales return.
BEGIN;
SET LOCAL ROLE authenticated;
DO $$
DECLARE w uuid:=gen_random_uuid(); a uuid; p uuid; p2 uuid; c uuid:=gen_random_uuid(); o uuid:=gen_random_uuid(); i uuid:=gen_random_uuid(); r uuid; n numeric; result jsonb; constraint_name text;
BEGIN
 INSERT INTO workers(id,name,daily_wage) VALUES(w,'Batch5 rollback worker',400);
 INSERT INTO attendance(worker_id,work_date,status,extra_units,extra_type) VALUES(w,'2026-09-04','half_day',50,'amount') RETURNING id INTO a;
 SELECT net_amount INTO n FROM calculate_worker_week(w,'2026-09-04');
 IF n<>250 THEN RAISE EXCEPTION 'Expected initial 250, got %',n; END IF;
 UPDATE workers SET daily_wage=500 WHERE id=w;
 SELECT net_amount INTO n FROM calculate_worker_week(w,'2026-09-04');
 IF n<>300 THEN RAISE EXCEPTION 'Expected wage correction 300, got %',n; END IF;
 UPDATE attendance SET status='present',extra_type='day_fraction',extra_units=0.5 WHERE id=a;
 SELECT net_amount INTO n FROM calculate_worker_week(w,'2026-09-04');
 IF n<>750 THEN RAISE EXCEPTION 'Expected attendance correction 750, got %',n; END IF;
 PERFORM pay_workers_week(ARRAY[w],'2026-09-04');
 SELECT id INTO p FROM worker_payouts WHERE worker_id=w;
 UPDATE workers SET daily_wage=600 WHERE id=w;
 SELECT net_amount INTO n FROM worker_payouts WHERE id=p;
 IF n<>750 OR (SELECT daily_wage FROM worker_payouts WHERE id=p)<>500 THEN RAISE EXCEPTION 'Saved snapshot changed'; END IF;
 BEGIN
   UPDATE attendance SET status='quarter_day' WHERE id=a;
   RAISE EXCEPTION 'Paid attendance edit accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
   INSERT INTO attendance(worker_id,work_date,status) VALUES(w,'2026-09-05','present');
   RAISE EXCEPTION 'Paid week insert accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
   INSERT INTO worker_payouts(worker_id,week_start) VALUES(w,'2026-09-04');
   RAISE EXCEPTION 'Duplicate payout accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN unique_violation THEN
   GET STACKED DIAGNOSTICS constraint_name=CONSTRAINT_NAME;
   IF constraint_name<>'worker_payouts_worker_week_key' THEN RAISE EXCEPTION 'Wrong unique index %',constraint_name; END IF;
 END;
 UPDATE worker_payouts SET voided_at=now(),voided_reason='تصحيح حضور خاطئ' WHERE id=p;
 result:=get_weekly_payroll('2026-09-04','Batch5 rollback worker');
 IF result->0->>'paid_at' IS NOT NULL THEN RAISE EXCEPTION 'Void still counts paid'; END IF;
 UPDATE attendance SET status='quarter_day',extra_type='amount',extra_units=25 WHERE id=a;
 SELECT net_amount INTO n FROM calculate_worker_week(w,'2026-09-04');
 IF n<>175 THEN RAISE EXCEPTION 'Expected corrected 175, got %',n; END IF;
 PERFORM pay_workers_week(ARRAY[w],'2026-09-04');
 SELECT id INTO p2 FROM worker_payouts WHERE worker_id=w AND voided_at IS NULL;
 IF p=p2 OR (SELECT count(*) FROM worker_payouts WHERE worker_id=w)<>2 OR (SELECT net_amount FROM worker_payouts WHERE id=p2)<>175 THEN RAISE EXCEPTION 'Redo/history mismatch'; END IF;
 BEGIN
   UPDATE worker_payouts SET voided_at=NULL,voided_reason=NULL WHERE id=p;
   RAISE EXCEPTION 'Unvoid accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
   DELETE FROM worker_payouts WHERE id=p;
   RAISE EXCEPTION 'Payout DELETE accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege OR raise_exception THEN NULL; END;
 INSERT INTO clients(id,name,type,credit_days) VALUES(c,'Batch5 rollback client','trader',0);
 INSERT INTO orders(id,client_id,quantity,product_spec) VALUES(o,c,1,'{}');
 INSERT INTO invoices(id,order_id,invoice_number,total) VALUES(i,o,'Batch5-'||i,1000);
 r:=record_sales_return(i,100,'خطأ تجريبي');
 SELECT balance_due INTO n FROM invoice_balances WHERE id=i;
 IF n<>900 THEN RAISE EXCEPTION 'Return expected 900, got %',n; END IF;
 UPDATE sales_returns SET voided_at=now(),voided_reason='مرتجع مسجل بالخطأ' WHERE id=r;
 SELECT balance_due INTO n FROM invoice_balances WHERE id=i;
 IF n<>1000 THEN RAISE EXCEPTION 'Void expected 1000, got %',n; END IF;
 result:=get_client_statement(c);
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(result->'entries') e WHERE e->>'id'=r::text AND e->>'credit'='0' AND e->>'original_amount'='100' AND e->>'description' LIKE '%ملغى%') THEN RAISE EXCEPTION 'Voided return missing from statement %',result; END IF;
 PERFORM record_sales_return(i,1000,'بديل صحيح');
 IF (SELECT balance_due FROM invoice_balances WHERE id=i)<>0 THEN RAISE EXCEPTION 'Voided return still reduces return limit'; END IF;
 BEGIN
   DELETE FROM sales_returns WHERE id=r;
   RAISE EXCEPTION 'Return DELETE accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege OR raise_exception THEN NULL; END;
 PERFORM set_config('batch5.payout_id',p::text,true);
 PERFORM set_config('batch5.return_id',r::text,true);
 RAISE NOTICE '250 -> wage 500: 300 -> present plus 0.5: 750 paid; wage 600 leaves saved 750/500; paid attendance blocked; void + quarter day plus25 =>175 repaid, 2 original rows. Return 1000 ->900 ->void1000, original credit0 remains.';
END;
$$;
SET LOCAL ROLE service_role;
DO $$
BEGIN
 BEGIN
  DELETE FROM worker_payouts WHERE id=current_setting('batch5.payout_id')::uuid;
  RAISE EXCEPTION 'Service role payout DELETE accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
  DELETE FROM sales_returns WHERE id=current_setting('batch5.return_id')::uuid;
  RAISE EXCEPTION 'Service role return DELETE accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
END;
$$;
ROLLBACK;
