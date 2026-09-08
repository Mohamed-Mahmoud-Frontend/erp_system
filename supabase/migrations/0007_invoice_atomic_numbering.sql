-- Migration: 0007_invoice_atomic_numbering.sql
-- Creates an atomic sequence table and function for generating invoice numbers

CREATE TABLE IF NOT EXISTS invoice_sequences (
  year INT PRIMARY KEY,
  last_value INT NOT NULL DEFAULT 0
);

-- Initialize the sequence table with any existing invoices
DO $$
DECLARE
  inv record;
  inv_year int;
  inv_seq int;
BEGIN
  FOR inv IN SELECT invoice_number FROM invoices WHERE invoice_number LIKE 'INV-%-%'
  LOOP
    BEGIN
      inv_year := split_part(inv.invoice_number, '-', 2)::int;
      inv_seq := split_part(inv.invoice_number, '-', 3)::int;
      
      INSERT INTO invoice_sequences (year, last_value)
      VALUES (inv_year, inv_seq)
      ON CONFLICT (year) DO UPDATE
      SET last_value = GREATEST(invoice_sequences.last_value, EXCLUDED.last_value);
    EXCEPTION WHEN OTHERS THEN
      -- ignore parsing errors
    END;
  END LOOP;
END;
$$;

-- Create an RPC function to atomically create an invoice
CREATE OR REPLACE FUNCTION create_invoice_atomic(
  p_order_id uuid,
  p_total numeric,
  p_credit_days int
) RETURNS uuid AS $$
DECLARE
  v_current_year int;
  v_next_val int;
  v_inv_number text;
  v_due_date date;
  v_invoice_id uuid;
BEGIN
  -- calculate due date
  v_due_date := current_date + p_credit_days;
  v_current_year := extract(year from current_date);
  
  -- increment sequence
  INSERT INTO invoice_sequences (year, last_value)
  VALUES (v_current_year, 1)
  ON CONFLICT (year) DO UPDATE 
  SET last_value = invoice_sequences.last_value + 1
  RETURNING last_value INTO v_next_val;
  
  -- format number
  v_inv_number := 'INV-' || v_current_year || '-' || lpad(v_next_val::text, 4, '0');
  
  -- insert invoice
  INSERT INTO invoices (order_id, invoice_number, total, balance_due, due_date)
  VALUES (p_order_id, v_inv_number, p_total, p_total, v_due_date)
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
