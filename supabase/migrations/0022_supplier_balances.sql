-- Supplier balances use a single read-time calculation, including a preserved opening balance.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.supplier_transactions WHERE type NOT IN ('invoice','payment') OR amount<=0 OR amount>='Infinity'::numeric) THEN
  RAISE EXCEPTION 'Existing supplier transactions need review before migration; no automatic reclassification';
 END IF;
END $$;
ALTER TABLE public.supplier_transactions ADD CONSTRAINT supplier_transactions_type_check CHECK(type IN ('invoice','payment'));
ALTER TABLE public.supplier_transactions ADD CONSTRAINT supplier_transactions_amount_valid CHECK(amount>0 AND amount<'Infinity'::numeric);
ALTER TABLE public.suppliers ADD COLUMN opening_balance numeric NOT NULL DEFAULT 0;
UPDATE public.suppliers s SET opening_balance=s.balance-coalesce((SELECT sum(CASE WHEN type='invoice' THEN amount ELSE -amount END) FROM public.supplier_transactions WHERE supplier_id=s.id),0);
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_opening_finite CHECK(opening_balance>'-Infinity'::numeric AND opening_balance<'Infinity'::numeric);
ALTER TABLE public.suppliers DROP COLUMN balance;
COMMENT ON COLUMN public.suppliers.opening_balance IS 'Opening amount owed. Migration preserves the pre-existing effective balance; not a physical reconciliation.';
COMMENT ON COLUMN public.supplier_transactions.type IS 'invoice increases amount owed; payment decreases it.';
CREATE VIEW public.supplier_balances WITH(security_invoker=true) AS
 SELECT s.*,s.opening_balance+coalesce(t.amount,0) AS balance
 FROM public.suppliers s LEFT JOIN LATERAL(
  SELECT sum(CASE WHEN type='invoice' THEN amount ELSE -amount END) AS amount FROM public.supplier_transactions WHERE supplier_id=s.id
 ) t ON true;
REVOKE ALL ON public.supplier_balances FROM anon,authenticated;
GRANT SELECT ON public.supplier_balances TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.record_supplier_transaction(p_supplier_id uuid,p_type text,p_amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE result uuid; f uuid;
BEGIN
 IF p_type IS NULL OR p_type NOT IN ('invoice','payment') THEN RAISE EXCEPTION 'نوع المعاملة يجب أن يكون فاتورة مورد أو سداد'; END IF;
 IF p_amount IS NULL OR p_amount<=0 OR p_amount>='Infinity'::numeric THEN RAISE EXCEPTION 'المبلغ يجب أن يكون موجبًا وصالحًا'; END IF;
 SELECT factory_id INTO f FROM suppliers WHERE id=p_supplier_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'المورد غير موجود'; END IF;
 INSERT INTO supplier_transactions(factory_id,supplier_id,type,amount) VALUES(f,p_supplier_id,p_type,p_amount) RETURNING id INTO result;
 RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.record_supplier_transaction(uuid,text,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_supplier_transaction(uuid,text,numeric) TO authenticated,service_role;
