-- Preserve a priced snapshot of every invoice line. Existing invoices keep
-- their original total and an empty snapshot until manually reviewed.
CREATE FUNCTION public.invoice_items_total(p_items jsonb)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE item jsonb; qty numeric; price numeric; amount numeric:=0;
BEGIN
 IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN
  RAISE EXCEPTION 'يجب إضافة بند واحد على الأقل، وبحد أقصى 100 بند';
 END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
  IF jsonb_typeof(item) IS DISTINCT FROM 'object'
    OR jsonb_typeof(item->'description') IS DISTINCT FROM 'string'
    OR jsonb_typeof(item->'quantity') IS DISTINCT FROM 'number'
    OR jsonb_typeof(item->'unit_price') IS DISTINCT FROM 'number'
    OR length(btrim(item->>'description')) NOT BETWEEN 1 AND 300 THEN
    RAISE EXCEPTION 'بيانات بند الفاتورة غير صالحة';
  END IF;
  qty:=(item->>'quantity')::numeric; price:=(item->>'unit_price')::numeric;
  IF qty<>trunc(qty) OR qty NOT BETWEEN 1 AND 1000000
    OR price<0 OR price>1000000000 OR price<>round(price,2) THEN
    RAISE EXCEPTION 'الكمية أو سعر الوحدة غير صالح';
  END IF;
  amount:=amount+qty*price;
 END LOOP;
 RETURN round(amount,2);
END;
$$;
ALTER TABLE public.invoices
 ADD COLUMN line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
 ADD COLUMN shipping_amount numeric NOT NULL DEFAULT 0 CHECK(shipping_amount>=0 AND shipping_amount<'Infinity'::numeric AND shipping_amount=round(shipping_amount,2)),
 ADD COLUMN discount_amount numeric NOT NULL DEFAULT 0 CHECK(discount_amount>=0 AND discount_amount<'Infinity'::numeric AND discount_amount=round(discount_amount,2)),
 ADD COLUMN notes text NOT NULL DEFAULT '' CHECK(length(notes)<=2000);
ALTER TABLE public.invoices ADD CONSTRAINT invoice_priced_items_consistent CHECK(
 CASE WHEN line_items='[]'::jsonb THEN true ELSE total=public.invoice_items_total(line_items)+shipping_amount-discount_amount END
);
CREATE FUNCTION public.create_invoice_with_items(
 p_order_id uuid,p_items jsonb,p_shipping numeric,p_discount numeric,p_notes text
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_id uuid; v_total numeric; v_qty numeric; v_order_qty integer;
BEGIN
 IF p_shipping IS NULL OR p_discount IS NULL OR p_shipping<0 OR p_discount<0
   OR p_shipping<>round(p_shipping,2) OR p_discount<>round(p_discount,2)
   OR p_shipping>1000000000 OR p_discount>1000000000
   OR length(coalesce(p_notes,''))>2000 THEN RAISE EXCEPTION 'مصاريف الفاتورة غير صالحة'; END IF;
 SELECT coalesce(sum((x->>'quantity')::numeric),0) INTO v_qty FROM jsonb_array_elements(p_items) x;
 SELECT quantity INTO v_order_qty FROM public.orders WHERE id=p_order_id;
 IF v_order_qty IS NULL OR v_qty<>v_order_qty THEN RAISE EXCEPTION 'كميات البنود لا تطابق أمر الشغل'; END IF;
 v_total:=public.invoice_items_total(p_items)+p_shipping-p_discount;
 IF v_total<0 OR v_total>1000000000000 THEN RAISE EXCEPTION 'إجمالي الفاتورة غير صالح'; END IF;
 v_id:=public.create_invoice_atomic(p_order_id,v_total,0);
 UPDATE public.invoices SET line_items=p_items,shipping_amount=p_shipping,discount_amount=p_discount,notes=coalesce(p_notes,'') WHERE id=v_id;
 RETURN v_id;
END;
$$;
CREATE FUNCTION public.create_direct_invoice_with_items(
 p_client_id uuid,p_client_name text,p_client_type text,p_client_phone text,
 p_items jsonb,p_shipping numeric,p_discount numeric,p_paid_amount numeric,p_notes text
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_id uuid; v_total numeric; v_qty numeric;
BEGIN
 IF p_shipping IS NULL OR p_discount IS NULL OR p_shipping<0 OR p_discount<0
   OR p_shipping<>round(p_shipping,2) OR p_discount<>round(p_discount,2)
   OR p_shipping>1000000000 OR p_discount>1000000000
   OR length(coalesce(p_notes,''))>2000 THEN RAISE EXCEPTION 'مصاريف الفاتورة غير صالحة'; END IF;
 v_total:=public.invoice_items_total(p_items)+p_shipping-p_discount;
 SELECT sum((x->>'quantity')::numeric) INTO v_qty FROM jsonb_array_elements(p_items) x;
 IF v_total<0 OR v_total>1000000000000 OR v_qty>2147483647 THEN RAISE EXCEPTION 'إجمالي الفاتورة غير صالح'; END IF;
 v_id:=public.create_direct_invoice_atomic(p_client_id,p_client_name,p_client_type,p_client_phone,v_qty::int,v_total,p_paid_amount,p_items);
 UPDATE public.invoices SET line_items=p_items,shipping_amount=p_shipping,discount_amount=p_discount,notes=coalesce(p_notes,'') WHERE id=v_id;
 RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_invoice_with_items(uuid,jsonb,numeric,numeric,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.create_direct_invoice_with_items(uuid,text,text,text,jsonb,numeric,numeric,numeric,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_invoice_with_items(uuid,jsonb,numeric,numeric,text) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.create_direct_invoice_with_items(uuid,text,text,text,jsonb,numeric,numeric,numeric,text) TO authenticated,service_role;