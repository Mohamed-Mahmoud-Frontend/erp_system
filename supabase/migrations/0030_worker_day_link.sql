-- Link the money entered with a worker day so deleting that day cannot leave orphaned advances.
ALTER TABLE public.worker_transactions ADD COLUMN attendance_id uuid REFERENCES public.attendance(id) ON DELETE RESTRICT;
CREATE INDEX worker_transactions_attendance_id_idx ON public.worker_transactions(attendance_id);

CREATE OR REPLACE FUNCTION public.record_worker_day(
 p_worker_id uuid,p_work_date date,p_status text,p_extra_type text,p_extra_units numeric,
 p_advance numeric,p_bonus numeric,p_deduction numeric
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE f uuid; result uuid;
BEGIN
 IF p_work_date IS NULL OR p_work_date<DATE '2000-01-01' OR p_work_date>current_date+1 THEN RAISE EXCEPTION 'تاريخ غير صالح'; END IF;
 IF p_status NOT IN ('present','absent','half_day','quarter_day') OR p_status IS NULL THEN RAISE EXCEPTION 'حالة حضور غير صالحة'; END IF;
 IF p_extra_type NOT IN ('amount','day_fraction') OR p_extra_type IS NULL THEN RAISE EXCEPTION 'نوع الإضافة غير صالح'; END IF;
 IF p_extra_units IS NULL OR p_extra_units<0 OR p_extra_units>='Infinity'::numeric OR (p_status='absent' AND p_extra_units<>0) THEN RAISE EXCEPTION 'الإضافة غير صالحة'; END IF;
 IF p_advance IS NULL OR p_bonus IS NULL OR p_deduction IS NULL
 OR p_advance<0 OR p_bonus<0 OR p_deduction<0
 OR p_advance>='Infinity'::numeric OR p_bonus>='Infinity'::numeric OR p_deduction>='Infinity'::numeric
 OR p_advance<>round(p_advance,2) OR p_bonus<>round(p_bonus,2) OR p_deduction<>round(p_deduction,2) THEN RAISE EXCEPTION 'المبالغ غير صالحة'; END IF;
 SELECT factory_id INTO f FROM public.workers WHERE id=p_worker_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'العامل غير موجود'; END IF;
 INSERT INTO public.attendance(factory_id,worker_id,work_date,status,extra_type,extra_units)
 VALUES(f,p_worker_id,p_work_date,p_status,p_extra_type,p_extra_units) RETURNING id INTO result;
 IF p_advance>0 THEN INSERT INTO public.worker_transactions(factory_id,worker_id,attendance_id,type,amount) VALUES(f,p_worker_id,result,'advance',p_advance); END IF;
 IF p_bonus>0 THEN INSERT INTO public.worker_transactions(factory_id,worker_id,attendance_id,type,amount) VALUES(f,p_worker_id,result,'bonus',p_bonus); END IF;
 IF p_deduction>0 THEN INSERT INTO public.worker_transactions(factory_id,worker_id,attendance_id,type,amount) VALUES(f,p_worker_id,result,'deduction',p_deduction); END IF;
 RETURN result;
END;
$$;

CREATE FUNCTION public.delete_worker_day(p_attendance_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE day_row public.attendance%ROWTYPE;
BEGIN
 IF NOT public.has_permission('admin') THEN RAISE EXCEPTION 'حذف اليومية متاح للمدير فقط' USING ERRCODE='42501'; END IF;
 SELECT * INTO day_row FROM public.attendance WHERE id=p_attendance_id FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 -- Older entries have no link. Refuse when their separate money entries could belong to this day.
 IF EXISTS (SELECT 1 FROM public.worker_transactions t WHERE t.worker_id=day_row.worker_id
   AND t.attendance_id IS NULL AND (t.created_at AT TIME ZONE 'Africa/Cairo')::date=day_row.work_date) THEN
   RAISE EXCEPTION 'توجد معاملات مالية قديمة في هذا اليوم؛ راجعها قبل حذف الحضور';
 END IF;
 PERFORM 1 FROM public.workers WHERE id=day_row.worker_id FOR UPDATE;
 IF EXISTS (SELECT 1 FROM public.worker_payouts p WHERE p.worker_id=day_row.worker_id
   AND p.week_start=day_row.work_date-((extract(dow FROM day_row.work_date)::int+2)%7)
   AND p.voided_at IS NULL) THEN RAISE EXCEPTION 'الأسبوع مصروف؛ ألغ الصرف قبل الحذف'; END IF;
 DELETE FROM public.worker_transactions WHERE attendance_id=day_row.id;
 DELETE FROM public.attendance WHERE id=day_row.id;
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_worker_day(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_worker_day(uuid) TO authenticated,service_role;
