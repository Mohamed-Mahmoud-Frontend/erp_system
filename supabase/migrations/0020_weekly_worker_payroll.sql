ALTER TABLE public.attendance ADD COLUMN extra_type text NOT NULL DEFAULT 'amount'
  CHECK(extra_type IN ('amount','day_fraction'));
COMMENT ON COLUMN public.attendance.extra_units IS 'EGP when extra_type=amount; fraction of current daily wage when extra_type=day_fraction.';

CREATE TABLE public.worker_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), factory_id uuid,
  worker_id uuid NOT NULL REFERENCES public.workers(id) ON DELETE RESTRICT,
  week_start date NOT NULL CHECK(extract(dow FROM week_start)=5),
  week_end date NOT NULL CHECK(week_end=week_start+6),
  days_present numeric NOT NULL,
  daily_wage numeric NOT NULL,
  attendance_bonus numeric NOT NULL, transaction_bonus numeric NOT NULL,
  advances numeric NOT NULL, deductions numeric NOT NULL,
  net_amount numeric NOT NULL CHECK(net_amount>=0 AND net_amount<'Infinity'::numeric),
  paid_at timestamptz NOT NULL,
  CONSTRAINT worker_payouts_worker_week_key UNIQUE(worker_id,week_start)
);
COMMENT ON COLUMN public.worker_payouts.daily_wage IS 'Daily wage snapshot at payout; later wage changes never rewrite a paid week.';
ALTER TABLE public.worker_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY authenticated_read ON public.worker_payouts FOR SELECT TO authenticated USING(true);
CREATE POLICY authenticated_insert ON public.worker_payouts FOR INSERT TO authenticated WITH CHECK(true);
REVOKE ALL ON public.worker_payouts FROM anon,authenticated;
GRANT SELECT,INSERT ON public.worker_payouts TO authenticated;
GRANT ALL ON public.worker_payouts TO service_role;

CREATE FUNCTION public.calculate_worker_week(p_worker_id uuid,p_week_start date)
RETURNS TABLE(worker_id uuid,worker_name text,factory_id uuid,daily_wage numeric,days_present numeric,
 attendance_bonus numeric,transaction_bonus numeric,advances numeric,deductions numeric,net_amount numeric)
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF p_week_start IS NULL OR extract(dow FROM p_week_start)<>5 THEN RAISE EXCEPTION 'بداية أسبوع الصرف يجب أن تكون يوم الجمعة'; END IF;
 RETURN QUERY
 SELECT w.id,w.name,w.factory_id,w.daily_wage,a.days,a.bonus,t.bonus,t.advance,t.deduction,
   a.days*w.daily_wage+a.bonus+t.bonus-t.advance-t.deduction
 FROM workers w
 CROSS JOIN LATERAL (
   SELECT coalesce(sum(CASE att.status WHEN 'present' THEN 1 WHEN 'half_day' THEN 0.5 WHEN 'quarter_day' THEN 0.25 ELSE 0 END),0) AS days,
     coalesce(sum(CASE att.extra_type WHEN 'day_fraction' THEN att.extra_units*w.daily_wage ELSE att.extra_units END),0) AS bonus
   FROM attendance att WHERE att.worker_id=w.id AND att.work_date>=p_week_start AND att.work_date<p_week_start+7
 ) a
 CROSS JOIN LATERAL (
   SELECT coalesce(sum(amount) FILTER(WHERE type='bonus'),0) AS bonus,
     coalesce(sum(amount) FILTER(WHERE type='advance'),0) AS advance,
     coalesce(sum(amount) FILTER(WHERE type='deduction'),0) AS deduction
   FROM worker_transactions wt WHERE wt.worker_id=w.id
     AND wt.created_at>=(p_week_start::timestamp AT TIME ZONE 'Africa/Cairo')
     AND wt.created_at<((p_week_start+7)::timestamp AT TIME ZONE 'Africa/Cairo')
 ) t
 WHERE w.id=p_worker_id;
END;
$$;

-- The INSERT path always calculates its own snapshot, even for a direct SQL
-- insert. No caller-provided financial totals or paid_at are trusted.
CREATE FUNCTION public.prepare_worker_payout() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v record;
BEGIN
 PERFORM 1 FROM workers WHERE id=NEW.worker_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'العامل غير موجود'; END IF;
 SELECT * INTO v FROM calculate_worker_week(NEW.worker_id,NEW.week_start);
 IF v.net_amount<0 THEN RAISE EXCEPTION 'لا يمكن صرف العامل % للأسبوع %: الصافي سالب (%). راجع التسوية أولًا.',v.worker_name,NEW.week_start,v.net_amount; END IF;
 NEW.factory_id:=v.factory_id; NEW.week_end:=NEW.week_start+6;
 NEW.days_present:=v.days_present; NEW.daily_wage:=v.daily_wage;
 NEW.attendance_bonus:=v.attendance_bonus; NEW.transaction_bonus:=v.transaction_bonus;
 NEW.advances:=v.advances; NEW.deductions:=v.deductions; NEW.net_amount:=v.net_amount;
 NEW.paid_at:=clock_timestamp();
 RETURN NEW;
END;
$$;
CREATE TRIGGER worker_payout_prepare BEFORE INSERT ON public.worker_payouts FOR EACH ROW EXECUTE FUNCTION public.prepare_worker_payout();

CREATE FUNCTION public.pay_workers_week(p_worker_ids uuid[],p_week_start date) RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_id uuid; v_name text; v_constraint text; v_count int:=0;
BEGIN
 IF p_worker_ids IS NULL OR cardinality(p_worker_ids)=0 OR array_position(p_worker_ids,NULL) IS NOT NULL THEN RAISE EXCEPTION 'اختر عاملًا واحدًا على الأقل'; END IF;
 -- Fixed lock order for overlapping Pay All requests. A failure rolls back the
 -- entire selected group; never silently skip a previously paid worker.
 FOREACH v_id IN ARRAY (SELECT array_agg(x ORDER BY x) FROM unnest(p_worker_ids) x) LOOP
   BEGIN
     INSERT INTO worker_payouts(worker_id,week_start) VALUES(v_id,p_week_start);
   EXCEPTION WHEN unique_violation THEN
     GET STACKED DIAGNOSTICS v_constraint=CONSTRAINT_NAME;
     IF v_constraint='worker_payouts_worker_week_key' THEN
       SELECT name INTO v_name FROM workers WHERE id=v_id;
       RAISE EXCEPTION USING ERRCODE='23505',CONSTRAINT=v_constraint,
         MESSAGE=format('سبق صرف العامل %s للأسبوع من %s إلى %s. لم يتم صرف أي عامل في هذه المحاولة.',v_name,p_week_start,p_week_start+6);
     END IF;
     RAISE;
   END;
   v_count:=v_count+1;
 END LOOP;
 RETURN v_count;
END;
$$;

CREATE FUNCTION public.get_weekly_payroll(p_week_start date,p_search text DEFAULT '') RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF p_week_start IS NULL OR extract(dow FROM p_week_start)<>5 THEN RAISE EXCEPTION 'بداية أسبوع الصرف يجب أن تكون يوم الجمعة'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object(
   'worker_id',w.id,'worker_name',w.name,'paid_at',p.paid_at,
   'daily_wage',coalesce(p.daily_wage,c.daily_wage)::text,
   'days_present',coalesce(p.days_present,c.days_present)::text,
   'attendance_bonus',coalesce(p.attendance_bonus,c.attendance_bonus)::text,
   'transaction_bonus',coalesce(p.transaction_bonus,c.transaction_bonus)::text,
   'advances',coalesce(p.advances,c.advances)::text,
   'deductions',coalesce(p.deductions,c.deductions)::text,
   'net_amount',coalesce(p.net_amount,c.net_amount)::text
 ) ORDER BY w.name,w.id),'[]'::jsonb) INTO result
 FROM workers w CROSS JOIN LATERAL calculate_worker_week(w.id,p_week_start) c
 LEFT JOIN worker_payouts p ON p.worker_id=w.id AND p.week_start=p_week_start
 WHERE position(lower(coalesce(p_search,'')) in lower(w.name))>0;
 RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.calculate_worker_week(uuid,date),public.pay_workers_week(uuid[],date),public.get_weekly_payroll(date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.calculate_worker_week(uuid,date),public.pay_workers_week(uuid[],date),public.get_weekly_payroll(date,text) TO authenticated,service_role;
