-- Corrections preserve the original financial snapshot permanently.
ALTER TABLE public.worker_payouts ADD COLUMN voided_at timestamptz, ADD COLUMN voided_reason text,
 ADD CONSTRAINT worker_payout_void_pair CHECK ((voided_at IS NULL AND voided_reason IS NULL) OR (voided_at IS NOT NULL AND length(btrim(voided_reason))>0 AND voided_reason IS NOT NULL));
ALTER TABLE public.sales_returns ADD COLUMN voided_at timestamptz, ADD COLUMN voided_reason text,
 ADD CONSTRAINT sales_return_void_pair CHECK ((voided_at IS NULL AND voided_reason IS NULL) OR (voided_at IS NOT NULL AND length(btrim(voided_reason))>0 AND voided_reason IS NOT NULL));
ALTER TABLE public.worker_payouts DROP CONSTRAINT worker_payouts_worker_week_key;
CREATE UNIQUE INDEX worker_payouts_worker_week_key ON public.worker_payouts(worker_id,week_start) WHERE voided_at IS NULL;
CREATE POLICY authenticated_void ON public.worker_payouts FOR UPDATE TO authenticated USING(true) WITH CHECK(true);
GRANT UPDATE(voided_at,voided_reason) ON public.worker_payouts TO authenticated;
REVOKE UPDATE,DELETE ON public.sales_returns FROM authenticated;
GRANT UPDATE(voided_at,voided_reason) ON public.sales_returns TO authenticated;

-- Covers direct SQL as well as forms. Voiding is one-way; financial fields cannot change.
CREATE FUNCTION public.guard_financial_history() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF TG_OP IN ('DELETE','TRUNCATE') THEN RAISE EXCEPTION 'لا يمكن حذف السجل المالي؛ استخدم الإلغاء مع ذكر السبب'; END IF;
 IF TG_OP='INSERT' THEN
   IF NEW.voided_at IS NOT NULL OR NEW.voided_reason IS NOT NULL THEN RAISE EXCEPTION 'لا يمكن إنشاء سجل ملغى'; END IF;
   RETURN NEW;
 END IF;
 IF (to_jsonb(NEW)-'voided_at'-'voided_reason') IS DISTINCT FROM (to_jsonb(OLD)-'voided_at'-'voided_reason') THEN
   RAISE EXCEPTION 'لا يمكن تعديل تفاصيل السجل المالي المحفوظ';
 END IF;
 IF OLD.voided_at IS NOT NULL THEN RAISE EXCEPTION 'السجل ملغى بالفعل ولا يمكن تغييره'; END IF;
 IF NEW.voided_at IS NULL OR coalesce(length(btrim(NEW.voided_reason)),0)=0 THEN RAISE EXCEPTION 'سبب الإلغاء مطلوب'; END IF;
 NEW.voided_at:=clock_timestamp(); NEW.voided_reason:=btrim(NEW.voided_reason);
 RETURN NEW;
END;
$$;
CREATE TRIGGER financial_history_guard BEFORE INSERT OR UPDATE OR DELETE ON public.worker_payouts FOR EACH ROW EXECUTE FUNCTION public.guard_financial_history();
CREATE TRIGGER financial_history_guard BEFORE INSERT OR UPDATE OR DELETE ON public.sales_returns FOR EACH ROW EXECUTE FUNCTION public.guard_financial_history();
CREATE TRIGGER financial_history_truncate_guard BEFORE TRUNCATE ON public.worker_payouts FOR EACH STATEMENT EXECUTE FUNCTION public.guard_financial_history();
CREATE TRIGGER financial_history_truncate_guard BEFORE TRUNCATE ON public.sales_returns FOR EACH STATEMENT EXECUTE FUNCTION public.guard_financial_history();

-- Lock the same parent as payout calculation. After the lock, a fresh query
-- observes a competing committed payout; a paid week cannot accept corrections.
CREATE FUNCTION public.guard_paid_attendance() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_worker uuid; v_date date; v_start date;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.worker_id IS DISTINCT FROM OLD.worker_id OR NEW.work_date IS DISTINCT FROM OLD.work_date) THEN
   RAISE EXCEPTION 'لا يمكن نقل سجل الحضور إلى عامل أو تاريخ آخر';
 END IF;
 IF TG_OP='DELETE' THEN v_worker:=OLD.worker_id; v_date:=OLD.work_date;
 ELSE v_worker:=NEW.worker_id; v_date:=NEW.work_date; END IF;
 PERFORM 1 FROM workers WHERE id=v_worker FOR UPDATE;
 v_start:=v_date-((extract(dow FROM v_date)::int+2)%7);
 IF EXISTS(SELECT 1 FROM worker_payouts WHERE worker_id=v_worker AND week_start=v_start AND voided_at IS NULL) THEN
   RAISE EXCEPTION 'الأسبوع من % إلى % مصروف بالفعل؛ ألغ الصرف مع السبب قبل تصحيح الحضور',v_start,v_start+6;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER attendance_paid_guard BEFORE INSERT OR UPDATE OR DELETE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.guard_paid_attendance();

CREATE OR REPLACE FUNCTION public.get_weekly_payroll(p_week_start date,p_search text DEFAULT '') RETURNS jsonb
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
 LEFT JOIN worker_payouts p ON p.worker_id=w.id AND p.week_start=p_week_start AND p.voided_at IS NULL
 WHERE position(lower(coalesce(p_search,'')) in lower(w.name))>0;
 RETURN result;
END;
$$;
CREATE OR REPLACE VIEW public.invoice_balances WITH (security_invoker = true) AS
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
  SELECT sum(r.amount) AS amount FROM public.sales_returns r WHERE r.invoice_id = i.id AND r.voided_at IS NULL
) r ON true;
CREATE OR REPLACE FUNCTION public.record_sales_return(p_invoice_id uuid, p_amount numeric, p_condition text, p_note text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid; v_total numeric; v_returned numeric; v_factory uuid;
BEGIN
  SELECT total, factory_id INTO v_total, v_factory FROM invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الفاتورة غير موجودة'; END IF;
  SELECT coalesce(sum(amount), 0) INTO v_returned FROM sales_returns WHERE invoice_id = p_invoice_id AND voided_at IS NULL;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount >= 'Infinity'::numeric OR p_amount > v_total - v_returned THEN
    RAISE EXCEPTION 'قيمة المرتجع يجب ألا تتجاوز قيمة الفاتورة بعد المرتجعات السابقة';
  END IF;
  INSERT INTO sales_returns(factory_id, invoice_id, amount, condition, note)
    VALUES(v_factory, p_invoice_id, p_amount, btrim(p_condition), nullif(btrim(p_note), '')) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.get_client_statement(p_client_id uuid) RETURNS jsonb
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
    r.created_at, 2, 'return', concat_ws(' — ', r.condition, r.note, CASE WHEN r.voided_at IS NOT NULL THEN 'ملغى: ' || r.voided_reason || ' (' || r.voided_at::text || ')' END), 0, CASE WHEN r.voided_at IS NULL THEN r.amount ELSE 0 END, r.amount, false, i.due_date, i.balance_due
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
COMMENT ON VIEW public.invoice_balances IS 'Read-only current balance: total minus non-bounced payments minus non-voided sales returns. No stored balance.';
