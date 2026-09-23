-- Save a full worker day in one database transaction.
CREATE FUNCTION public.record_worker_day(
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
 IF p_advance>0 THEN INSERT INTO public.worker_transactions(factory_id,worker_id,type,amount) VALUES(f,p_worker_id,'advance',p_advance); END IF;
 IF p_bonus>0 THEN INSERT INTO public.worker_transactions(factory_id,worker_id,type,amount) VALUES(f,p_worker_id,'bonus',p_bonus); END IF;
 IF p_deduction>0 THEN INSERT INTO public.worker_transactions(factory_id,worker_id,type,amount) VALUES(f,p_worker_id,'deduction',p_deduction); END IF;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.record_worker_day(uuid,date,text,text,numeric,numeric,numeric,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_worker_day(uuid,date,text,text,numeric,numeric,numeric,numeric) TO authenticated,service_role;