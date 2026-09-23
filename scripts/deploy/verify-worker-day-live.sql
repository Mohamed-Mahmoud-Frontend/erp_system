-- Diagnostic only: all fixture records and trigger effects are rolled back.
BEGIN;
DO $$
DECLARE admin_id uuid;
BEGIN
 SELECT user_id INTO admin_id FROM public.user_access WHERE email='admin@admin.com' AND role='admin' AND active;
 IF admin_id IS NULL THEN RAISE EXCEPTION 'Authorized administrator is unavailable'; END IF;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
END;
$$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE v_worker_id uuid; attendance_id uuid; row_count integer; advance_amount numeric;
BEGIN
 INSERT INTO public.workers(name,daily_wage) VALUES('Temporary payroll verification - rolled back',400) RETURNING id INTO v_worker_id;
 attendance_id:=public.record_worker_day(v_worker_id,CURRENT_DATE,'present','amount',25,100,20,5);
 SELECT count(*) INTO row_count FROM public.attendance WHERE id=attendance_id;
 IF row_count<>1 THEN RAISE EXCEPTION 'Attendance verification failed'; END IF;
 SELECT count(*) INTO row_count FROM public.worker_transactions t WHERE t.worker_id=v_worker_id;
 IF row_count<>3 THEN RAISE EXCEPTION 'Transaction count verification failed'; END IF;
 SELECT amount INTO advance_amount FROM public.worker_transactions t WHERE t.worker_id=v_worker_id AND type='advance';
 IF advance_amount IS DISTINCT FROM 100::numeric THEN RAISE EXCEPTION 'Advance amount verification failed'; END IF;
END;
$$;
ROLLBACK;
SELECT 'PASS: authenticated daily save and three financial entries; all test data rolled back' AS result;