BEGIN;
INSERT INTO auth.users(id,email) VALUES('20000000-0000-4000-8000-000000000001','permission-test@example.com');
INSERT INTO public.user_access(user_id,email,role,permissions) VALUES('20000000-0000-4000-8000-000000000001','permission-test@example.com','employee',ARRAY['attendance']);
INSERT INTO public.workers(id,name,daily_wage) VALUES('20000000-0000-4000-8000-000000000002','Permission fixture',500);
INSERT INTO public.attendance(worker_id,work_date,status) VALUES('20000000-0000-4000-8000-000000000002','2026-09-04','present');
SELECT public.pay_workers_week(ARRAY['20000000-0000-4000-8000-000000000002'::uuid],'2026-09-04');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
SELECT set_config('request.jwt.claims','{"role":"authenticated","user_metadata":{"role":"admin"}}',true);
DO $$ DECLARE n int; BEGIN
 IF public.has_permission('admin') OR public.has_permission('payroll') THEN RAISE EXCEPTION 'Employee escalated permissions'; END IF;
 IF NOT public.has_permission('attendance') THEN RAISE EXCEPTION 'Attendance grant not effective'; END IF;
 IF (SELECT count(*) FROM public.workers WHERE id='20000000-0000-4000-8000-000000000002')<>0 THEN RAISE EXCEPTION 'Salary row exposed'; END IF;
 IF (SELECT count(*) FROM public.worker_directory WHERE id='20000000-0000-4000-8000-000000000002')<>1 THEN RAISE EXCEPTION 'Directory unavailable'; END IF;
 IF NOT (SELECT week_paid FROM public.attendance_status WHERE worker_id='20000000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Paid status hidden from attendance guard'; END IF;
 IF public.get_weekly_payroll('2026-09-04')<>'[]'::jsonb THEN RAISE EXCEPTION 'Payroll RPC leaks salary'; END IF;
 UPDATE public.user_access SET role='admin' WHERE user_id='20000000-0000-4000-8000-000000000001';
 GET DIAGNOSTICS n=ROW_COUNT;IF n<>0 THEN RAISE EXCEPTION 'Self-escalation UPDATE succeeded'; END IF;
 BEGIN
  UPDATE public.attendance SET status='absent' WHERE worker_id='20000000-0000-4000-8000-000000000002';
  RAISE EXCEPTION 'Employee changed paid attendance' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 INSERT INTO public.attendance(worker_id,work_date,status) VALUES('20000000-0000-4000-8000-000000000002','2026-09-11','half_day');
 BEGIN
  INSERT INTO public.user_access(user_id,email,role) VALUES('20000000-0000-4000-8000-000000000003','forged@example.com','admin');
  RAISE EXCEPTION 'Employee inserted administrator' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL ROLE postgres;
UPDATE public.user_access SET active=false WHERE user_id='20000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 IF public.has_permission('attendance') OR EXISTS(SELECT 1 FROM public.worker_directory) THEN RAISE EXCEPTION 'Disabled account still has access'; END IF;
END $$;
SET LOCAL ROLE postgres;
UPDATE public.user_access SET active=true,permissions=ARRAY['suppliers'] WHERE user_id='20000000-0000-4000-8000-000000000001';
INSERT INTO public.suppliers(id,name,opening_balance) VALUES('20000000-0000-4000-8000-000000000004','Supplier permission test',100);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n numeric; cnt int; BEGIN
 PERFORM public.record_supplier_transaction('20000000-0000-4000-8000-000000000004','invoice',250);
 SELECT balance INTO n FROM public.supplier_balances WHERE id='20000000-0000-4000-8000-000000000004';IF n<>350 THEN RAISE EXCEPTION 'Expected 350 got %',n; END IF;
 PERFORM public.record_supplier_transaction('20000000-0000-4000-8000-000000000004','payment',80);
 SELECT balance INTO n FROM public.supplier_balances WHERE id='20000000-0000-4000-8000-000000000004';IF n<>270 THEN RAISE EXCEPTION 'Expected 270 got %',n; END IF;
 INSERT INTO public.supplier_transactions(supplier_id,type,amount) VALUES('20000000-0000-4000-8000-000000000004','invoice',30);
 SELECT balance INTO n FROM public.supplier_balances WHERE id='20000000-0000-4000-8000-000000000004';IF n<>300 THEN RAISE EXCEPTION 'Direct insert should compute 300 got %',n; END IF;
 SELECT count(*) INTO cnt FROM public.supplier_transactions WHERE supplier_id='20000000-0000-4000-8000-000000000004';
 BEGIN
  PERFORM public.record_supplier_transaction('20000000-0000-4000-8000-000000000004','unknown',10);
  RAISE EXCEPTION 'Unknown RPC type accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
  INSERT INTO public.supplier_transactions(supplier_id,type,amount) VALUES('20000000-0000-4000-8000-000000000004','unknown',10);
  RAISE EXCEPTION 'Unknown raw type accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN check_violation THEN NULL; END;
 IF (SELECT count(*) FROM public.supplier_transactions WHERE supplier_id='20000000-0000-4000-8000-000000000004')<>cnt THEN RAISE EXCEPTION 'Rejected transaction persisted'; END IF;
END $$;
ROLLBACK;
