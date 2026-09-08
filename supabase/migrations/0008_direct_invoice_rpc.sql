-- Migration: 0008_direct_invoice_rpc.sql
-- RPC for creating a direct invoice (Client -> Order -> Invoice -> Payment) atomically

CREATE OR REPLACE FUNCTION create_direct_invoice_atomic(
  p_client_name text,
  p_client_type text,
  p_client_phone text,
  p_quantity int,
  p_total numeric,
  p_paid_amount numeric
) RETURNS uuid AS $$
DECLARE
  v_client_id uuid;
  v_order_id uuid;
  v_invoice_id uuid;
  v_current_year int;
  v_next_val int;
  v_inv_number text;
BEGIN
  -- 1. Create Client (assuming credit_days = 0 for direct sales)
  INSERT INTO clients (name, type, phone, credit_days)
  VALUES (p_client_name, p_client_type, p_client_phone, 0)
  RETURNING id INTO v_client_id;

  -- 2. Create Order (completed automatically since it's a direct sale)
  INSERT INTO orders (client_id, quantity, status)
  VALUES (v_client_id, p_quantity, 'completed')
  RETURNING id INTO v_order_id;

  -- 3. Generate Invoice Number
  v_current_year := extract(year from current_date);
  
  INSERT INTO invoice_sequences (year, last_value)
  VALUES (v_current_year, 1)
  ON CONFLICT (year) DO UPDATE 
  SET last_value = invoice_sequences.last_value + 1
  RETURNING last_value INTO v_next_val;
  
  v_inv_number := 'INV-' || v_current_year || '-' || lpad(v_next_val::text, 4, '0');

  -- 4. Create Invoice
  INSERT INTO invoices (order_id, invoice_number, total, balance_due, due_date)
  VALUES (v_order_id, v_inv_number, p_total, p_total - p_paid_amount, current_date)
  RETURNING id INTO v_invoice_id;

  -- 5. Create Payment if any amount was paid
  IF p_paid_amount > 0 THEN
    INSERT INTO payments (invoice_id, method, amount, paid_at)
    VALUES (v_invoice_id, 'cash', p_paid_amount, current_date);
  END IF;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
