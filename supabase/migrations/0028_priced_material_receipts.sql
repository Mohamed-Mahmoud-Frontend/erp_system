-- A priced receipt creates one stock movement and one supplier payable atomically.
ALTER TABLE public.material_movements
 ADD COLUMN supplier_transaction_id uuid UNIQUE REFERENCES public.supplier_transactions(id) ON DELETE RESTRICT;
ALTER TABLE public.material_movements
 ADD CONSTRAINT priced_receipt_only CHECK (supplier_transaction_id IS NULL OR (direction='in' AND NOT is_return AND supplier_id IS NOT NULL));
CREATE UNIQUE INDEX supplier_reference_unique
 ON public.supplier_transactions(supplier_id, lower(btrim(reference)))
 WHERE btrim(reference)<>'';
CREATE FUNCTION public.record_priced_material_receipt(
 p_material_id uuid,p_supplier_id uuid,p_qty numeric,p_price_mode text,p_price numeric,p_reference text,p_occurred_on date
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE m public.materials%ROWTYPE; s public.suppliers%ROWTYPE; total numeric; transaction_id uuid; movement_id uuid;
BEGIN
 IF p_qty IS NULL OR p_qty<=0 OR p_qty>='Infinity'::numeric THEN RAISE EXCEPTION 'الكمية غير صالحة'; END IF;
 IF p_price IS NULL OR p_price<=0 OR p_price>='Infinity'::numeric THEN RAISE EXCEPTION 'السعر غير صالح'; END IF;
 IF p_price_mode NOT IN ('per_ton','total') OR p_price_mode IS NULL THEN RAISE EXCEPTION 'طريقة السعر غير صالحة'; END IF;
 IF p_occurred_on IS NULL OR p_occurred_on<DATE '2000-01-01' OR p_occurred_on>current_date+1 THEN RAISE EXCEPTION 'التاريخ غير صالح'; END IF;
 IF length(btrim(coalesce(p_reference,'')))>100 THEN RAISE EXCEPTION 'المرجع طويل'; END IF;
 SELECT * INTO m FROM public.materials WHERE id=p_material_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'الخامة غير موجودة'; END IF;
 SELECT * INTO s FROM public.suppliers WHERE id=p_supplier_id FOR UPDATE;
 IF NOT FOUND OR m.factory_id IS DISTINCT FROM s.factory_id THEN RAISE EXCEPTION 'المورد والخامة غير متطابقين'; END IF;
 total:=round(CASE WHEN p_price_mode='total' THEN p_price ELSE p_price*p_qty/CASE WHEN m.unit='kg' THEN 1000 ELSE 1 END END,2);
 IF total<=0 OR total>='Infinity'::numeric THEN RAISE EXCEPTION 'إجمالي الحركة غير صالح'; END IF;
 INSERT INTO public.supplier_transactions(factory_id,supplier_id,type,amount,reference,description,occurred_on)
 VALUES(s.factory_id,p_supplier_id,'invoice',total,btrim(coalesce(p_reference,'')),
  'توريد خامة: '||m.type||' — '||p_qty||' '||m.unit,p_occurred_on) RETURNING id INTO transaction_id;
 INSERT INTO public.material_movements(factory_id,material_id,supplier_id,direction,is_return,qty,supplier_transaction_id)
 VALUES(m.factory_id,p_material_id,p_supplier_id,'in',false,p_qty,transaction_id) RETURNING id INTO movement_id;
 RETURN movement_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_priced_material_receipt(uuid,uuid,numeric,text,numeric,text,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_priced_material_receipt(uuid,uuid,numeric,text,numeric,text,date) TO authenticated,service_role;
-- Full account totals, independent of the limited activity list.
CREATE OR REPLACE VIEW public.supplier_balances WITH(security_invoker=true) AS
 SELECT s.*,s.opening_balance+coalesce(t.purchases,0)-coalesce(t.payments,0) AS balance,
        coalesce(t.purchases,0) AS purchases,coalesce(t.payments,0) AS payments
 FROM public.suppliers s LEFT JOIN LATERAL(
  SELECT sum(amount) FILTER(WHERE type='invoice') AS purchases,
         sum(amount) FILTER(WHERE type='payment') AS payments
  FROM public.supplier_transactions WHERE supplier_id=s.id
 ) t ON true;