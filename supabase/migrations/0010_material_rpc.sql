-- Migration: 0010_material_rpc.sql
-- RPC for recording material movements and supplier transactions atomically

CREATE OR REPLACE FUNCTION record_material_movement(
  p_material_id uuid,
  p_direction text,
  p_qty numeric,
  p_supplier_id uuid DEFAULT NULL,
  p_order_id uuid DEFAULT NULL,
  p_is_return boolean DEFAULT false
) RETURNS uuid AS $$
DECLARE
  v_movement_id uuid;
BEGIN
  -- 1. Insert Movement
  INSERT INTO material_movements (material_id, supplier_id, order_id, direction, is_return, qty)
  VALUES (p_material_id, p_supplier_id, p_order_id, p_direction, p_is_return, p_qty)
  RETURNING id INTO v_movement_id;

  -- The material_movements INSERT trigger owns the stock adjustment.

  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION record_supplier_transaction(
  p_supplier_id uuid,
  p_type text, -- 'invoice' (increases what we owe) or 'payment' (decreases what we owe)
  p_amount numeric
) RETURNS uuid AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- 1. Insert Transaction
  INSERT INTO supplier_transactions (supplier_id, type, amount)
  VALUES (p_supplier_id, p_type, p_amount)
  RETURNING id INTO v_transaction_id;

  -- 2. Update Supplier Balance
  IF p_type = 'invoice' THEN
    UPDATE suppliers
    SET balance = balance + p_amount
    WHERE id = p_supplier_id;
  ELSIF p_type = 'payment' THEN
    UPDATE suppliers
    SET balance = balance - p_amount
    WHERE id = p_supplier_id;
  END IF;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
