CREATE TABLE public.product_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), factory_id uuid,
  name text NOT NULL CHECK (length(btrim(name)) > 0), active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.product_spec_materials (
  spec_id uuid NOT NULL REFERENCES public.product_specs(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
  qty_per_unit numeric NOT NULL CHECK (qty_per_unit > 0 AND qty_per_unit < 'Infinity'::numeric),
  PRIMARY KEY (spec_id, material_id)
);
CREATE INDEX product_spec_materials_material_idx ON public.product_spec_materials(material_id);
ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_spec_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY authenticated_access ON public.product_specs FOR ALL TO authenticated USING(true) WITH CHECK(true);
CREATE POLICY authenticated_access ON public.product_spec_materials FOR ALL TO authenticated USING(true) WITH CHECK(true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_specs, public.product_spec_materials TO authenticated;
REVOKE ALL ON public.product_specs, public.product_spec_materials FROM anon;

ALTER TABLE public.orders
  ADD COLUMN product_spec_id uuid REFERENCES public.product_specs(id) ON DELETE RESTRICT,
  ADD COLUMN material_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN material_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX orders_product_spec_id_idx ON public.orders(product_spec_id);
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK(status IN ('pending','in_production','completed','delivered','cancelled'));
COMMENT ON COLUMN public.orders.status IS 'pending -> in_production -> completed -> delivered; pending may be cancelled. Legacy rows are preserved.';
COMMENT ON COLUMN public.orders.material_requirements IS 'Immutable recipe snapshot at creation: material identity/name/unit and default total quantity. Overrides are separate.';
COMMENT ON COLUMN public.orders.material_overrides IS 'Per-order material UUID -> total quantity override, not quantity per unit. Zero explicitly skips consumption of that line.';

-- Fail safely if duplicates exist: never delete or merge historical invoices.
ALTER TABLE public.invoices ADD CONSTRAINT invoices_order_id_key UNIQUE (order_id);

CREATE FUNCTION public.save_product_spec(p_id uuid, p_name text, p_active boolean, p_lines jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid; line jsonb;
BEGIN
  IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines)=0 THEN
    RAISE EXCEPTION 'الوصفة تحتاج خامة واحدة على الأقل';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO product_specs(name,active) VALUES(btrim(p_name),p_active) RETURNING id INTO v_id;
  ELSE
    SELECT id INTO v_id FROM product_specs WHERE id=p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'الوصفة غير موجودة'; END IF;
    UPDATE product_specs SET name=btrim(p_name),active=p_active WHERE id=v_id;
    DELETE FROM product_spec_materials WHERE spec_id=v_id;
  END IF;
  FOR line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    INSERT INTO product_spec_materials(spec_id,material_id,qty_per_unit)
      VALUES(v_id,(line->>'material_id')::uuid,(line->>'qty_per_unit')::numeric);
  END LOOP;
  RETURN v_id;
END;
$$;

-- This trigger orchestrates movements only. Batch 1's movement INSERT trigger
-- remains the sole stock writer. Direct SQL status updates take this same path.
CREATE FUNCTION public.order_manufacturing_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  spec product_specs%ROWTYPE; line jsonb; override_key text; v_qty numeric;
  v_available numeric; v_shortages text := ''; v_material uuid;
BEGIN
  IF TG_OP='INSERT' THEN
    NEW.material_requirements := '[]'::jsonb;
    IF NEW.product_spec_id IS NOT NULL THEN
      IF NEW.status <> 'pending' THEN RAISE EXCEPTION 'أوردر الوصفة يجب أن يبدأ قيد الانتظار'; END IF;
      SELECT * INTO spec FROM product_specs WHERE id=NEW.product_spec_id FOR SHARE;
      IF NOT FOUND OR NOT spec.active THEN RAISE EXCEPTION 'الوصفة غير موجودة أو غير نشطة'; END IF;
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'material_id',m.id,'name',m.type,'unit',m.unit,
        'qty_per_unit',sm.qty_per_unit::text,'default_qty',(sm.qty_per_unit*NEW.quantity)::text
      ) ORDER BY m.id),'[]'::jsonb) INTO NEW.material_requirements
      FROM product_spec_materials sm JOIN materials m ON m.id=sm.material_id WHERE sm.spec_id=spec.id;
      IF jsonb_array_length(NEW.material_requirements)=0 THEN RAISE EXCEPTION 'الوصفة لا تحتوي خامات'; END IF;
      IF NEW.product_spec='{}'::jsonb THEN
        NEW.product_spec := jsonb_build_array(jsonb_build_object('capacity',spec.name,'quantity',NEW.quantity));
      END IF;
    END IF;
  ELSE
    IF NEW.material_requirements IS DISTINCT FROM OLD.material_requirements THEN
      RAISE EXCEPTION 'لا يمكن تعديل نسخة الوصفة المحفوظة؛ استخدم تجاوز الكميات';
    END IF;
    IF NEW.product_spec_id IS DISTINCT FROM OLD.product_spec_id OR
       (OLD.product_spec_id IS NOT NULL AND NEW.quantity IS DISTINCT FROM OLD.quantity) THEN
      RAISE EXCEPTION 'لا يمكن تغيير وصفة أو عدد وحدات أوردر محفوظ؛ أنشئ أوردرًا جديدًا';
    END IF;
    IF OLD.status <> 'pending' AND NEW.material_overrides IS DISTINCT FROM OLD.material_overrides THEN
      RAISE EXCEPTION 'تعديل كميات الخامات متاح قبل بدء التصنيع فقط';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
      (OLD.status='pending' AND NEW.status IN ('in_production','cancelled')) OR
      (OLD.status='in_production' AND NEW.status='completed') OR
      (OLD.status='completed' AND NEW.status='delivered')
    ) THEN RAISE EXCEPTION 'انتقال حالة الأوردر غير مسموح'; END IF;
  END IF;

  IF NEW.material_overrides IS NULL OR jsonb_typeof(NEW.material_overrides)<>'object' THEN
    RAISE EXCEPTION 'تجاوز كميات الخامات غير صالح';
  END IF;
  FOR override_key IN SELECT jsonb_object_keys(NEW.material_overrides) LOOP
    IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.material_requirements) l WHERE l->>'material_id'=override_key) THEN
      RAISE EXCEPTION 'خامة التجاوز ليست ضمن وصفة هذا الأوردر';
    END IF;
    v_qty := (NEW.material_overrides->>override_key)::numeric;
    IF v_qty IS NULL OR v_qty<0 OR v_qty>='Infinity'::numeric THEN RAISE EXCEPTION 'كمية التجاوز يجب أن تكون صفرًا أو أكبر'; END IF;
  END LOOP;

  IF TG_OP='UPDATE' AND OLD.status='pending' AND NEW.status='in_production' AND NEW.product_spec_id IS NOT NULL THEN
    -- Lock every material in UUID order before validation/inserts, preventing
    -- concurrent starts from reading the same available stock and lock inversion.
    FOR line IN SELECT value FROM jsonb_array_elements(NEW.material_requirements) ORDER BY value->>'material_id' LOOP
      v_material := (line->>'material_id')::uuid;
      v_qty := coalesce((NEW.material_overrides->>v_material::text)::numeric,(line->>'default_qty')::numeric);
      SELECT stock_qty INTO v_available FROM materials WHERE id=v_material FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'الخامة % لم تعد موجودة',line->>'name'; END IF;
      IF v_available<v_qty THEN
        v_shortages := v_shortages || format('%s: المطلوب %s، المتاح %s، العجز %s %s. ',line->>'name',v_qty,v_available,v_qty-v_available,line->>'unit');
      END IF;
    END LOOP;
    IF v_shortages<>'' THEN RAISE EXCEPTION 'المخزون غير كافٍ: %',v_shortages; END IF;
    FOR line IN SELECT value FROM jsonb_array_elements(NEW.material_requirements) ORDER BY value->>'material_id' LOOP
      v_material := (line->>'material_id')::uuid;
      v_qty := coalesce((NEW.material_overrides->>v_material::text)::numeric,(line->>'default_qty')::numeric);
      IF v_qty>0 THEN
        PERFORM record_material_movement(v_material,'out',v_qty,NULL,NEW.id,false);
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER orders_manufacturing_guard BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.order_manufacturing_guard();
REVOKE EXECUTE ON FUNCTION public.save_product_spec(uuid,text,boolean,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_product_spec(uuid,text,boolean,jsonb) TO authenticated,service_role;
