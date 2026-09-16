-- Run against a migrated test database. All fixtures are rolled back.
BEGIN;
DO $$
DECLARE
  m uuid;
  c uuid;
  o uuid;
  actual numeric;
  movement_count integer;
BEGIN
  INSERT INTO clients (name, type) VALUES ('Batch 1 stock test', 'individual') RETURNING id INTO c;
  INSERT INTO orders (client_id) VALUES (c) RETURNING id INTO o;
  INSERT INTO materials (type, unit, stock_qty) VALUES ('Batch 1 stock test', 'kg', 100) RETURNING id INTO m;

  PERFORM record_material_movement(m, 'in', 20);
  SELECT stock_qty INTO actual FROM materials WHERE id = m;
  IF actual <> 120 THEN RAISE EXCEPTION 'in: expected 120, got %', actual; END IF;

  PERFORM record_material_movement(m, 'out', 12.5, NULL, o);
  SELECT stock_qty INTO actual FROM materials WHERE id = m;
  IF actual <> 107.5 THEN RAISE EXCEPTION 'out: expected 107.5, got %', actual; END IF;

  PERFORM record_material_movement(m, 'out', 7.5);
  SELECT stock_qty INTO actual FROM materials WHERE id = m;
  IF actual <> 100 THEN RAISE EXCEPTION 'unlinked out: expected 100, got %', actual; END IF;

  PERFORM record_material_movement(m, 'out', 5, NULL, o, true);
  PERFORM record_material_movement(m, 'in', 5, NULL, o, true);
  SELECT stock_qty INTO actual FROM materials WHERE id = m;
  IF actual <> 100 THEN RAISE EXCEPTION 'returns: expected unchanged 100, got %', actual; END IF;

  INSERT INTO material_movements (material_id, direction, qty) VALUES (m, 'out', 10);
  SELECT stock_qty INTO actual FROM materials WHERE id = m;
  IF actual <> 90 THEN RAISE EXCEPTION 'direct insert: expected 90, got %', actual; END IF;

  BEGIN
    PERFORM record_material_movement(m, 'out', 91);
    RAISE EXCEPTION 'insufficient stock was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  SELECT stock_qty INTO actual FROM materials WHERE id = m;
  SELECT count(*) INTO movement_count FROM material_movements WHERE material_id = m;
  IF actual <> 90 OR movement_count <> 6 THEN
    RAISE EXCEPTION 'failed movement must roll back both stock and row';
  END IF;
  RAISE NOTICE 'PASS: in 100->120; out 120->107.5; unlinked out ->100; returns unchanged; direct out ->90; insufficient stock rolled back';
END;
$$;
ROLLBACK;
