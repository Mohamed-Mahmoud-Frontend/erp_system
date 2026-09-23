ALTER TABLE public.supplier_transactions
 ADD COLUMN reference text NOT NULL DEFAULT '' CHECK(length(reference)<=100),
 ADD COLUMN description text NOT NULL DEFAULT '' CHECK(length(description)<=2000),
 ADD COLUMN occurred_on date NOT NULL DEFAULT (now() AT TIME ZONE 'Africa/Cairo')::date;
CREATE FUNCTION public.record_supplier_transaction_detailed(
 p_supplier_id uuid,p_type text,p_amount numeric,p_reference text,p_description text,p_occurred_on date
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE result uuid; f uuid;
BEGIN
 IF p_type IS NULL OR p_type NOT IN ('invoice','payment') THEN RAISE EXCEPTION 'نوع المعاملة غير صالح'; END IF;
 IF p_amount IS NULL OR p_amount<=0 OR p_amount>='Infinity'::numeric OR p_amount<>round(p_amount,2) THEN RAISE EXCEPTION 'المبلغ غير صالح'; END IF;
 IF p_occurred_on IS NULL OR p_occurred_on>current_date+1 OR p_occurred_on<DATE '2000-01-01' THEN RAISE EXCEPTION 'تاريخ المعاملة غير صالح'; END IF;
 IF length(coalesce(p_reference,''))>100 OR length(coalesce(p_description,''))>2000 THEN RAISE EXCEPTION 'تفاصيل المعاملة طويلة'; END IF;
 SELECT factory_id INTO f FROM public.suppliers WHERE id=p_supplier_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'المورد غير موجود'; END IF;
 INSERT INTO public.supplier_transactions(factory_id,supplier_id,type,amount,reference,description,occurred_on)
 VALUES(f,p_supplier_id,p_type,p_amount,btrim(coalesce(p_reference,'')),btrim(coalesce(p_description,'')),p_occurred_on) RETURNING id INTO result;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.record_supplier_transaction_detailed(uuid,text,numeric,text,text,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_supplier_transaction_detailed(uuid,text,numeric,text,text,date) TO authenticated,service_role;