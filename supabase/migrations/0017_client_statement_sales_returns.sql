-- Balances are read-only projections, never persisted adjustments.
CREATE TABLE public.sales_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount > 0 AND amount < 'Infinity'::numeric),
  condition text NOT NULL CHECK (length(btrim(condition)) > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sales_returns_invoice_id_idx ON public.sales_returns(invoice_id);
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY authenticated_access ON public.sales_returns FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_returns TO authenticated;
REVOKE ALL ON public.sales_returns FROM anon;

-- Remove the obsolete stored value, including its nonnegative CHECK. A return
-- after payment may legitimately leave a credit (negative balance) for a client.
ALTER TABLE public.invoices DROP COLUMN balance_due;

CREATE VIEW public.invoice_balances WITH (security_invoker = true) AS
SELECT i.id, i.factory_id, i.order_id, i.invoice_number, i.total, i.created_at,
  coalesce(i.due_date, (i.created_at AT TIME ZONE 'Africa/Cairo')::date + c.credit_days) AS due_date,
  o.client_id, o.quantity, c.name AS client_name, c.type AS client_type,
  coalesce(p.amount, 0) AS paid_amount, coalesce(r.amount, 0) AS returned_amount,
  i.total - coalesce(p.amount, 0) - coalesce(r.amount, 0) AS balance_due
FROM public.invoices i
JOIN public.orders o ON o.id = i.order_id
JOIN public.clients c ON c.id = o.client_id
LEFT JOIN LATERAL (
  SELECT sum(p.amount) AS amount FROM public.payments p
  WHERE p.invoice_id = i.id AND NOT (p.method = 'cheque' AND EXISTS (
    SELECT 1 FROM public.cheques ch WHERE ch.payment_id = p.id AND ch.status = 'bounced'
  ))
) p ON true
LEFT JOIN LATERAL (
  SELECT sum(r.amount) AS amount FROM public.sales_returns r WHERE r.invoice_id = i.id
) r ON true;
REVOKE ALL ON public.invoice_balances FROM anon, authenticated;
GRANT SELECT ON public.invoice_balances TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.create_invoice_atomic(p_order_id uuid, p_total numeric, p_credit_days int)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v_id uuid; v_next int; v_year int := extract(year from current_date);
  v_days int; v_factory uuid;
BEGIN
  IF p_total IS NULL OR p_total < 0 OR p_total >= 'Infinity'::numeric THEN
    RAISE EXCEPTION 'إجمالي الفاتورة غير صالح';
  END IF;
  SELECT c.credit_days, o.factory_id INTO v_days, v_factory
    FROM orders o JOIN clients c ON c.id = o.client_id WHERE o.id = p_order_id FOR UPDATE OF o;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF EXISTS (SELECT 1 FROM invoices WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'تم إصدار فاتورة لهذا الطلب بالفعل';
  END IF;
  INSERT INTO invoice_sequences(year, last_value) VALUES(v_year, 1)
    ON CONFLICT(year) DO UPDATE SET last_value = invoice_sequences.last_value + 1
    RETURNING last_value INTO v_next;
  -- Preserve the existing RPC signature; stored client terms are authoritative.
  INSERT INTO invoices(factory_id, order_id, invoice_number, total, due_date)
    VALUES(v_factory, p_order_id, 'INV-' || v_year || '-' || lpad(v_next::text, 4, '0'),
      p_total, current_date + v_days) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_payment_atomic(
  p_invoice_id uuid, p_amount numeric, p_method text, p_cheque_due_date date DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid; v_balance numeric; v_factory uuid;
BEGIN
  SELECT factory_id INTO v_factory FROM invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفاتورة غير موجودة'; END IF;
  SELECT balance_due INTO v_balance FROM invoice_balances WHERE id = p_invoice_id;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount >= 'Infinity'::numeric OR p_amount > v_balance THEN
    RAISE EXCEPTION 'المبلغ يجب أن يكون موجبًا وألا يتجاوز الرصيد المتبقي';
  END IF;
  IF p_method IS NULL OR p_method NOT IN ('cash', 'transfer', 'cheque') THEN
    RAISE EXCEPTION 'طريقة الدفع غير صالحة';
  END IF;
  IF p_method = 'cheque' AND p_cheque_due_date IS NULL THEN
    RAISE EXCEPTION 'تاريخ استحقاق الشيك مطلوب';
  END IF;
  INSERT INTO payments(factory_id, invoice_id, amount, method, paid_at)
    VALUES(v_factory, p_invoice_id, p_amount, p_method, current_date) RETURNING id INTO v_id;
  IF p_method = 'cheque' THEN
    INSERT INTO cheques(factory_id, payment_id, due_date, status)
      VALUES(v_factory, v_id, p_cheque_due_date, 'pending');
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_direct_invoice_atomic(
  p_client_id uuid, p_client_name text, p_client_type text, p_client_phone text,
  p_quantity int, p_total numeric, p_paid_amount numeric, p_product_spec jsonb DEFAULT '{}'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_client uuid; v_order uuid; v_invoice uuid; v_factory uuid;
BEGIN
  IF p_paid_amount IS NULL OR p_paid_amount < 0 OR p_paid_amount >= 'Infinity'::numeric OR p_paid_amount > p_total THEN
    RAISE EXCEPTION 'المبلغ المدفوع غير صالح';
  END IF;
  IF p_client_id IS NULL THEN
    INSERT INTO clients(name, type, phone, credit_days) VALUES(p_client_name, p_client_type, p_client_phone, 0)
      RETURNING id, factory_id INTO v_client, v_factory;
  ELSE
    SELECT id, factory_id INTO v_client, v_factory FROM clients WHERE id = p_client_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'العميل غير موجود'; END IF;
  END IF;
  INSERT INTO orders(factory_id, client_id, quantity, product_spec, status)
    VALUES(v_factory, v_client, p_quantity, p_product_spec, 'completed') RETURNING id INTO v_order;
  v_invoice := create_invoice_atomic(v_order, p_total, 0);
  IF p_paid_amount > 0 THEN PERFORM record_payment_atomic(v_invoice, p_paid_amount, 'cash'); END IF;
  RETURN v_invoice;
END;
$$;

CREATE FUNCTION public.record_sales_return(p_invoice_id uuid, p_amount numeric, p_condition text, p_note text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid; v_total numeric; v_returned numeric; v_factory uuid;
BEGIN
  SELECT total, factory_id INTO v_total, v_factory FROM invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفاتورة غير موجودة'; END IF;
  SELECT coalesce(sum(amount), 0) INTO v_returned FROM sales_returns WHERE invoice_id = p_invoice_id;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount >= 'Infinity'::numeric OR p_amount > v_total - v_returned THEN
    RAISE EXCEPTION 'قيمة المرتجع يجب ألا تتجاوز قيمة الفاتورة بعد المرتجعات السابقة';
  END IF;
  INSERT INTO sales_returns(factory_id, invoice_id, amount, condition, note)
    VALUES(v_factory, p_invoice_id, p_amount, btrim(p_condition), nullif(btrim(p_note), '')) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- One snapshot and one JSON value: no PostgREST row-limit truncation of statements.
-- Bounced cheques remain visible, with zero effective credit at their original date.
CREATE FUNCTION public.get_client_statement(p_client_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
WITH invoices_for_client AS (
  SELECT * FROM invoice_balances WHERE client_id = p_client_id
), entries AS (
  SELECT i.id AS entry_id, i.id AS invoice_id, i.invoice_number,
    (i.created_at AT TIME ZONE 'Africa/Cairo')::date AS entry_date, i.created_at, 0 AS priority,
    'invoice'::text AS kind, NULL::text AS description, i.total AS debit, 0::numeric AS credit,
    i.total AS original_amount, false AS bounced, i.due_date, i.balance_due AS invoice_balance
  FROM invoices_for_client i
  UNION ALL
  SELECT p.id, i.id, i.invoice_number, p.paid_at, p.created_at, 1, 'payment', p.method, 0,
    CASE WHEN p.method = 'cheque' AND EXISTS(SELECT 1 FROM cheques ch WHERE ch.payment_id = p.id AND ch.status = 'bounced')
      THEN 0 ELSE p.amount END, p.amount,
    p.method = 'cheque' AND EXISTS(SELECT 1 FROM cheques ch WHERE ch.payment_id = p.id AND ch.status = 'bounced'),
    i.due_date, i.balance_due
  FROM payments p JOIN invoices_for_client i ON i.id = p.invoice_id
  UNION ALL
  SELECT r.id, i.id, i.invoice_number, (r.created_at AT TIME ZONE 'Africa/Cairo')::date,
    r.created_at, 2, 'return', concat_ws(' — ', r.condition, r.note), 0, r.amount, r.amount, false, i.due_date, i.balance_due
  FROM sales_returns r JOIN invoices_for_client i ON i.id = r.invoice_id
), running AS (
  SELECT *, sum(debit - credit) OVER (ORDER BY entry_date, created_at, priority, entry_id ROWS UNBOUNDED PRECEDING) AS running_balance FROM entries
)
SELECT jsonb_build_object(
  'balance', coalesce((SELECT sum(balance_due) FROM invoices_for_client), 0)::text,
  'entries', coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id', entry_id, 'invoice_id', invoice_id, 'invoice_number', invoice_number,
    'date', entry_date, 'kind', kind, 'description', description,
    'debit', debit::text, 'credit', credit::text, 'original_amount', original_amount::text,
    'bounced', bounced, 'due_date', due_date, 'invoice_balance', invoice_balance::text,
    'running_balance', running_balance::text
  ) ORDER BY entry_date, created_at, priority, entry_id) FROM running), '[]'::jsonb)
);
$$;

REVOKE EXECUTE ON FUNCTION public.get_client_statement(uuid), public.record_sales_return(uuid,numeric,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_client_statement(uuid), public.record_sales_return(uuid,numeric,text,text) TO authenticated, service_role;
COMMENT ON VIEW public.invoice_balances IS 'Read-only current balance: total minus non-bounced payments minus sales returns. No stored balance.';
COMMENT ON TABLE public.sales_returns IS 'Financial credits only. Never adjusts materials or creates material movements.';
