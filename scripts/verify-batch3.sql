-- All fixtures and invoice numbering work remain inside this rollback.
BEGIN;
DO $$
DECLARE a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid; s uuid; o uuid; o2 uuid; blocked uuid; custom uuid;
  recipe_before jsonb; v_constraint text; v_message text;
BEGIN
 INSERT INTO materials(id,type,unit,stock_qty) VALUES(a,'Batch3 resin','kg',100),(b,'Batch3 pigment','ton',10);
 INSERT INTO clients(name,type) VALUES('Batch3 rollback','trader') RETURNING id INTO c;
 s := save_product_spec(NULL,'Batch3 recipe',true,jsonb_build_array(jsonb_build_object('material_id',a,'qty_per_unit','3'),jsonb_build_object('material_id',b,'qty_per_unit','0.5')));
 SELECT jsonb_agg(to_jsonb(sm) ORDER BY material_id) INTO recipe_before FROM product_spec_materials sm WHERE spec_id=s;
 INSERT INTO orders(client_id,quantity,product_spec_id) VALUES(c,4,s) RETURNING id INTO o;
 IF (SELECT stock_qty FROM materials WHERE id=a)<>100 THEN RAISE EXCEPTION 'Consumption at creation'; END IF;
 UPDATE orders SET status='in_production' WHERE id=o;
 IF (SELECT stock_qty FROM materials WHERE id=a)<>88 OR (SELECT stock_qty FROM materials WHERE id=b)<>8 THEN RAISE EXCEPTION 'Default stock mismatch'; END IF;
 IF (SELECT count(*) FROM material_movements WHERE order_id=o AND direction='out' AND NOT is_return)<>2 OR
    (SELECT qty FROM material_movements WHERE order_id=o AND material_id=a)<>12 OR
    (SELECT qty FROM material_movements WHERE order_id=o AND material_id=b)<>2 THEN RAISE EXCEPTION 'Default movements mismatch'; END IF;
 UPDATE orders SET status='in_production' WHERE id=o;
 IF (SELECT count(*) FROM material_movements WHERE order_id=o)<>2 THEN RAISE EXCEPTION 'Repeated start consumed twice'; END IF;
 RAISE NOTICE 'Default qty 4: resin 100 -> 88 (12 kg); pigment 10 -> 8 (2 ton); retry unchanged';
 INSERT INTO orders(client_id,quantity,product_spec_id,material_overrides) VALUES(c,2,s,jsonb_build_object(a::text,'9')) RETURNING id INTO o2;
 UPDATE orders SET status='in_production' WHERE id=o2;
 IF (SELECT stock_qty FROM materials WHERE id=a)<>79 OR (SELECT stock_qty FROM materials WHERE id=b)<>7 THEN RAISE EXCEPTION 'Override mismatch'; END IF;
 IF (SELECT qty FROM material_movements WHERE order_id=o2 AND material_id=a)<>9 OR (SELECT qty FROM material_movements WHERE order_id=o2 AND material_id=b)<>1 THEN RAISE EXCEPTION 'Override movement mismatch'; END IF;
 IF recipe_before IS DISTINCT FROM (SELECT jsonb_agg(to_jsonb(sm) ORDER BY material_id) FROM product_spec_materials sm WHERE spec_id=s) THEN RAISE EXCEPTION 'Master recipe modified by override'; END IF;
 RAISE NOTICE 'Override qty 2: resin 88 -> 79 (9 instead of 6); pigment 8 -> 7 (1); master unchanged';
 INSERT INTO orders(client_id,quantity,product_spec_id) VALUES(c,20,s) RETURNING id INTO blocked;
 BEGIN
   UPDATE orders SET status='in_production' WHERE id=blocked;
   RAISE EXCEPTION 'Unexpected insufficient-stock success' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN
   GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
   IF position('Batch3 pigment' in v_message)=0 OR position('10' in v_message)=0 OR position('7' in v_message)=0 OR position('3' in v_message)=0 THEN RAISE EXCEPTION 'Shortage details missing: %',v_message; END IF;
 END;
 IF (SELECT status FROM orders WHERE id=blocked)<>'pending' OR EXISTS(SELECT 1 FROM material_movements WHERE order_id=blocked) OR
    (SELECT stock_qty FROM materials WHERE id=a)<>79 OR (SELECT stock_qty FROM materials WHERE id=b)<>7 THEN RAISE EXCEPTION 'Partial consumption/status escaped rollback'; END IF;
 RAISE NOTICE 'Insufficient: resin needs 60/available 79; pigment needs 10/available 7/short 3; status pending, movements 0, stocks 79 and 7 unchanged';
 BEGIN
   UPDATE orders SET status='pending' WHERE id=o;
   RAISE EXCEPTION 'Unexpected backwards transition' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
   UPDATE orders SET material_requirements='[]' WHERE id=blocked;
   RAISE EXCEPTION 'Unexpected snapshot modification' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 BEGIN
   UPDATE orders SET material_overrides=jsonb_build_object(a::text,'0') WHERE id=o;
   RAISE EXCEPTION 'Unexpected override after start' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 UPDATE orders SET status='completed' WHERE id=o;
 UPDATE orders SET status='delivered' WHERE id=o;
 IF (SELECT count(*) FROM material_movements WHERE order_id=o)<>2 THEN RAISE EXCEPTION 'Completion/delivery consumed again'; END IF;
 INSERT INTO orders(client_id,quantity,product_spec) VALUES(c,1,'{"custom":"one-off"}') RETURNING id INTO custom;
 UPDATE orders SET status='in_production' WHERE id=custom;
 IF EXISTS(SELECT 1 FROM material_movements WHERE order_id=custom) THEN RAISE EXCEPTION 'Custom order auto-consumed'; END IF;
 PERFORM record_material_movement(a,'out',1,NULL,custom,false);
 IF (SELECT stock_qty FROM materials WHERE id=a)<>78 THEN RAISE EXCEPTION 'Custom manual movement failed'; END IF;
 INSERT INTO invoices(order_id,invoice_number,total) VALUES(o,'BATCH3-A-'||gen_random_uuid(),1000);
 BEGIN
   INSERT INTO invoices(order_id,invoice_number,total) VALUES(o,'BATCH3-B-'||gen_random_uuid(),2000);
   RAISE EXCEPTION 'Duplicate raw invoice INSERT succeeded' USING ERRCODE='XX000';
 EXCEPTION WHEN unique_violation THEN
   GET STACKED DIAGNOSTICS v_constraint=CONSTRAINT_NAME;
   IF v_constraint<>'invoices_order_id_key' THEN RAISE EXCEPTION 'Wrong unique constraint %',v_constraint; END IF;
 END;
 IF (SELECT count(*) FROM invoices WHERE order_id=o)<>1 THEN RAISE EXCEPTION 'Duplicate invoice remains'; END IF;
 RAISE NOTICE 'Raw duplicate invoice INSERT rejected by invoices_order_id_key (23505)';
 PERFORM save_product_spec(s,'Batch3 revised',true,jsonb_build_array(jsonb_build_object('material_id',a,'qty_per_unit','5'),jsonb_build_object('material_id',b,'qty_per_unit','0.5')));
 IF NOT EXISTS(SELECT 1 FROM orders, jsonb_array_elements(material_requirements) l WHERE orders.id=blocked AND l->>'material_id'=a::text AND (l->>'default_qty')::numeric=60) THEN RAISE EXCEPTION 'Recipe edit rewrote pending snapshot'; END IF;
 UPDATE product_specs SET active=false WHERE id=s;
 BEGIN
   INSERT INTO orders(client_id,quantity,product_spec_id) VALUES(c,1,s);
   RAISE EXCEPTION 'Inactive recipe accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL; END;
 RAISE NOTICE 'Custom manual path, forward lifecycle, immutable snapshots, post-start edits and inactive recipe checks passed';
END;
$$;
ROLLBACK;
