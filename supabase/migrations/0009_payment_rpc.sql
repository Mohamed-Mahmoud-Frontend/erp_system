-- Migration: 0009_payment_rpc.sql
-- RPC for recording a payment atomically

CREATE OR REPLACE FUNCTION record_payment_atomic(
  p_invoice_id uuid,
  p_amount numeric,
  p_method text,
  p_cheque_due_date date DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_payment_id uuid;
  v_balance_due numeric;
BEGIN
  -- 1. Get current balance and lock the invoice row
  SELECT balance_due INTO v_balance_due
  FROM invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF v_balance_due < p_amount THEN
    RAISE EXCEPTION 'المبلغ المدفوع أكبر من الرصيد المتبقي';
  END IF;

  -- 2. Update balance_due
  UPDATE invoices
  SET balance_due = balance_due - p_amount
  WHERE id = p_invoice_id;

  -- 3. Insert Payment
  INSERT INTO payments (invoice_id, method, amount, paid_at)
  VALUES (p_invoice_id, p_method, p_amount, current_date)
  RETURNING id INTO v_payment_id;

  -- 4. If cheque, insert into cheques table
  IF p_method = 'cheque' THEN
    IF p_cheque_due_date IS NULL THEN
      RAISE EXCEPTION 'تاريخ استحقاق الشيك مطلوب';
    END IF;
    INSERT INTO cheques (payment_id, due_date, status)
    VALUES (v_payment_id, p_cheque_due_date, 'pending');
  END IF;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;
