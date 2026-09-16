BEGIN;
DO $$
DECLARE w uuid; w2 uuid; negative_worker uuid; v record; result jsonb; before_count bigint; constraint_name text;
BEGIN
 INSERT INTO workers(name,daily_wage) VALUES('Batch4 mixed week',400) RETURNING id INTO w;
 INSERT INTO attendance(worker_id,work_date,status,extra_units,extra_type) VALUES
 (w,'2026-09-03','present',9000,'amount'),
 (w,'2026-09-04','present',75,'amount'),
 (w,'2026-09-05','present',0.5,'day_fraction'),
 (w,'2026-09-06','half_day',0,'amount'),
 (w,'2026-09-07','quarter_day',0,'amount'),
 (w,'2026-09-08','absent',0,'amount'),
 (w,'2026-09-09','present',0,'amount'),
 (w,'2026-09-10','present',0,'amount'),
 (w,'2026-09-11','present',9000,'amount');
 INSERT INTO worker_transactions(worker_id,type,amount,created_at) VALUES
 (w,'bonus',9000,'2026-09-03 23:59:59.999999'::timestamp AT TIME ZONE 'Africa/Cairo'),
 (w,'bonus',125,'2026-09-04 00:00:00'::timestamp AT TIME ZONE 'Africa/Cairo'),
 (w,'advance',300,'2026-09-07 12:00:00'::timestamp AT TIME ZONE 'Africa/Cairo'),
 (w,'deduction',50,'2026-09-10 23:59:59.999999'::timestamp AT TIME ZONE 'Africa/Cairo'),
 (w,'bonus',9000,'2026-09-11 00:00:00'::timestamp AT TIME ZONE 'Africa/Cairo');
 SELECT * INTO v FROM calculate_worker_week(w,'2026-09-04');
 IF v.days_present<>4.75 OR v.daily_wage<>400 OR v.attendance_bonus<>275 OR v.transaction_bonus<>125 OR v.advances<>300 OR v.deductions<>50 OR v.net_amount<>1950 THEN RAISE EXCEPTION 'Mixed week mismatch: %',row_to_json(v); END IF;
 IF (SELECT count(DISTINCT work_date) FROM attendance WHERE worker_id=w AND work_date>='2026-09-04' AND work_date<'2026-09-11')<>7 THEN RAISE EXCEPTION 'Wrong date count'; END IF;
 RAISE NOTICE 'Hand 1900 + 275 + 125 - 300 - 50 = 1950; PostgreSQL days=%, net=%',v.days_present,v.net_amount;
 INSERT INTO workers(name,daily_wage) VALUES('Batch4 second worker',200) RETURNING id INTO w2;
 INSERT INTO attendance(worker_id,work_date,status) VALUES(w2,'2026-09-04','present');
 SELECT count(*) INTO before_count FROM worker_transactions;
 IF pay_workers_week(ARRAY[w,w2],'2026-09-04')<>2 THEN RAISE EXCEPTION 'Pay all count mismatch'; END IF;
 IF (SELECT count(*) FROM worker_transactions)<>before_count THEN RAISE EXCEPTION 'Payout wrote worker_transactions'; END IF;
 SELECT * INTO v FROM worker_payouts WHERE worker_id=w AND week_start='2026-09-04';
 IF v.net_amount<>1950 OR v.week_end<>'2026-09-10' OR v.paid_at IS NULL OR v.days_present<>4.75 OR v.daily_wage<>400 OR v.attendance_bonus<>275 OR v.transaction_bonus<>125 OR v.advances<>300 OR v.deductions<>50 THEN RAISE EXCEPTION 'Persisted payout mismatch'; END IF;
 BEGIN
   INSERT INTO worker_payouts(worker_id,week_start) VALUES(w,'2026-09-04');
   RAISE EXCEPTION 'Raw duplicate insert succeeded' USING ERRCODE='XX000';
 EXCEPTION WHEN unique_violation THEN
   GET STACKED DIAGNOSTICS constraint_name=CONSTRAINT_NAME;
   IF constraint_name<>'worker_payouts_worker_week_key' THEN RAISE EXCEPTION 'Wrong duplicate constraint %',constraint_name; END IF;
 END;
 BEGIN
   PERFORM pay_workers_week(ARRAY[w],'2026-09-04');
   RAISE EXCEPTION 'Duplicate pay RPC succeeded' USING ERRCODE='XX000';
 EXCEPTION WHEN unique_violation THEN
   IF position('Batch4 mixed week' in SQLERRM)=0 OR position('2026-09-04' in SQLERRM)=0 THEN RAISE EXCEPTION 'Duplicate error lacks worker/week'; END IF;
 END;
 UPDATE workers SET daily_wage=500 WHERE id=w;
 SELECT * INTO v FROM calculate_worker_week(w,'2026-09-04');
 IF v.net_amount<>2475 OR v.attendance_bonus<>325 THEN RAISE EXCEPTION 'Current wage convention mismatch'; END IF;
 result:=get_weekly_payroll('2026-09-04','Batch4 mixed week');
 IF (result->0->>'net_amount')::numeric<>1950 OR (result->0->>'daily_wage')::numeric<>400 THEN RAISE EXCEPTION 'Paid snapshot changed'; END IF;
 RAISE NOTICE 'Current wage 500 calculates 2475; paid snapshot remains 1950 at daily wage 400';
 -- A failing member rolls back every insert in that Pay All call.
 INSERT INTO workers(name,daily_wage) VALUES('Batch4 negative',100) RETURNING id INTO negative_worker;
 INSERT INTO worker_transactions(worker_id,type,amount,created_at) VALUES(negative_worker,'advance',50,'2026-09-12 12:00:00'::timestamp AT TIME ZONE 'Africa/Cairo');
 BEGIN
   PERFORM pay_workers_week(ARRAY[w2,negative_worker],'2026-09-11');
   RAISE EXCEPTION 'Negative payout succeeded' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN
   IF position('سالب' in SQLERRM)=0 THEN RAISE; END IF;
 END;
 IF EXISTS(SELECT 1 FROM worker_payouts WHERE worker_id IN(w2,negative_worker) AND week_start='2026-09-11') THEN RAISE EXCEPTION 'Partial batch payment persisted'; END IF;
 BEGIN
   INSERT INTO worker_transactions(worker_id,type,amount) VALUES(w,'payout',1);
   RAISE EXCEPTION 'payout accepted as a transaction' USING ERRCODE='XX000';
 EXCEPTION WHEN check_violation THEN NULL; END;
 RAISE NOTICE 'Pay All persisted 1950 + 200; raw duplicate rejected by worker_payouts_worker_week_key (23505); negative net -50 blocked; no transaction payout rows';
END;
$$;
ROLLBACK;
