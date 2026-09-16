-- One stock writer: the INSERT trigger also covers direct SQL/imports.
-- Returns are written off, regardless of direction, and never change usable stock.
CREATE OR REPLACE FUNCTION decrement_material_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT NEW.is_return THEN
    UPDATE materials
    SET stock_qty = stock_qty + CASE WHEN NEW.direction = 'in' THEN NEW.qty ELSE -NEW.qty END
    WHERE id = NEW.material_id;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION decrement_material_stock() IS
  'Only stock writer for movements: normal in adds, normal out subtracts; returns leave usable stock unchanged.';

CREATE OR REPLACE FUNCTION record_material_movement(
  p_material_id uuid,
  p_direction text,
  p_qty numeric,
  p_supplier_id uuid DEFAULT NULL,
  p_order_id uuid DEFAULT NULL,
  p_is_return boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_movement_id uuid;
BEGIN
  INSERT INTO material_movements (material_id, supplier_id, order_id, direction, is_return, qty)
  VALUES (p_material_id, p_supplier_id, p_order_id, p_direction, p_is_return, p_qty)
  RETURNING id INTO v_movement_id;
  -- The trigger updates stock exactly once, in this same transaction.
  RETURN v_movement_id;
END;
$$;
