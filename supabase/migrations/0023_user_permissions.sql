-- Two roles; employee permissions are explicit capabilities, never JWT user_metadata.
CREATE TABLE public.user_access (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 email text NOT NULL, role text NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','employee')),
 permissions text[] NOT NULL DEFAULT '{}' CHECK(permissions <@ ARRAY['sales','production','attendance','payroll','suppliers']::text[]),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_access FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.user_access TO authenticated;
GRANT ALL ON public.user_access TO service_role;
REVOKE CREATE ON SCHEMA public FROM anon,authenticated;
CREATE FUNCTION public.has_permission(p_permission text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce((SELECT active AND (role='admin' OR p_permission=ANY(permissions)) FROM public.user_access WHERE user_id=auth.uid()),false);
$$;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO anon,authenticated,service_role;
CREATE POLICY own_or_admin_read ON public.user_access FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_permission('admin'));
CREATE POLICY admin_insert ON public.user_access FOR INSERT TO authenticated WITH CHECK(public.has_permission('admin'));
CREATE POLICY admin_update ON public.user_access FOR UPDATE TO authenticated USING(public.has_permission('admin')) WITH CHECK(public.has_permission('admin'));
CREATE TABLE public.access_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, changed_by uuid, changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 old_value jsonb, new_value jsonb
);
ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.access_audit FROM anon,authenticated;
GRANT SELECT ON public.access_audit TO authenticated;
GRANT ALL ON public.access_audit TO service_role;
CREATE POLICY admin_read ON public.access_audit FOR SELECT TO authenticated USING(public.has_permission('admin'));
CREATE FUNCTION public.guard_access_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(20260909,23);
 IF TG_OP IN ('UPDATE','DELETE') AND OLD.role='admin' AND OLD.active THEN
  IF TG_OP='DELETE' OR NEW.role<>'admin' OR NOT NEW.active THEN
   IF NOT EXISTS(SELECT 1 FROM public.user_access WHERE role='admin' AND active AND user_id<>OLD.user_id) THEN RAISE EXCEPTION 'لا يمكن تعطيل أو حذف آخر مدير نشط'; END IF;
  END IF;
 END IF;
 IF TG_OP='UPDATE' AND NEW.user_id<>OLD.user_id THEN RAISE EXCEPTION 'لا يمكن تغيير هوية الحساب'; END IF;
 INSERT INTO public.access_audit(user_id,changed_by,old_value,new_value)
 VALUES(CASE WHEN TG_OP='DELETE' THEN OLD.user_id ELSE NEW.user_id END,auth.uid(),CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END,CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END);
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END;
$$;
CREATE TRIGGER access_change_guard BEFORE INSERT OR UPDATE OR DELETE ON public.user_access FOR EACH ROW EXECUTE FUNCTION public.guard_access_change();
-- Directory views deliberately expose names only; attendance staff cannot read wages.
CREATE VIEW public.worker_directory WITH(security_barrier=true) AS SELECT id,name FROM public.workers WHERE public.has_permission('attendance') OR public.has_permission('payroll');
CREATE VIEW public.supplier_directory WITH(security_barrier=true) AS SELECT id,name FROM public.suppliers WHERE public.has_permission('production') OR public.has_permission('suppliers');
REVOKE ALL ON public.worker_directory,public.supplier_directory FROM anon,authenticated;
GRANT SELECT ON public.worker_directory,public.supplier_directory TO authenticated,service_role;
-- Attendance's paid-week check must not depend on the employee's salary visibility.
ALTER FUNCTION public.guard_paid_attendance() SECURITY DEFINER;
-- Existing table grants are retained; restrictive policies intersect the existing
-- policies, including payout column-only updates and quotation sharing for anon.
CREATE POLICY permission_read ON public.clients AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales') OR public.has_permission('production'));
CREATE POLICY permission_insert ON public.clients AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.clients AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales')) WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_delete ON public.clients AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.orders AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales') OR public.has_permission('production'));
CREATE POLICY permission_insert ON public.orders AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales') OR public.has_permission('production'));
CREATE POLICY permission_update ON public.orders AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales') OR public.has_permission('production')) WITH CHECK(public.has_permission('sales') OR public.has_permission('production'));
CREATE POLICY permission_delete ON public.orders AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.quotations AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales'));
CREATE POLICY permission_insert ON public.quotations AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.quotations AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales')) WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_delete ON public.quotations AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.invoices AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales'));
CREATE POLICY permission_insert ON public.invoices AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.invoices AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales')) WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_delete ON public.invoices AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.payments AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales'));
CREATE POLICY permission_insert ON public.payments AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.payments AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales')) WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_delete ON public.payments AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.cheques AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales'));
CREATE POLICY permission_insert ON public.cheques AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.cheques AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales')) WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_delete ON public.cheques AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.invoice_sequences AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales'));
CREATE POLICY permission_insert ON public.invoice_sequences AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.invoice_sequences AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('sales')) WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_delete ON public.invoice_sequences AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.sales_returns AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('sales'));
CREATE POLICY permission_insert ON public.sales_returns AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('sales'));
CREATE POLICY permission_update ON public.sales_returns AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('admin')) WITH CHECK(public.has_permission('admin'));
CREATE POLICY permission_delete ON public.sales_returns AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.suppliers AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('suppliers'));
CREATE POLICY permission_insert ON public.suppliers AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('suppliers'));
CREATE POLICY permission_update ON public.suppliers AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('suppliers')) WITH CHECK(public.has_permission('suppliers'));
CREATE POLICY permission_delete ON public.suppliers AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.supplier_transactions AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('suppliers'));
CREATE POLICY permission_insert ON public.supplier_transactions AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('suppliers'));
CREATE POLICY permission_update ON public.supplier_transactions AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('suppliers')) WITH CHECK(public.has_permission('suppliers'));
CREATE POLICY permission_delete ON public.supplier_transactions AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.materials AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('production') OR public.has_permission('sales'));
CREATE POLICY permission_insert ON public.materials AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('production'));
CREATE POLICY permission_update ON public.materials AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('production')) WITH CHECK(public.has_permission('production'));
CREATE POLICY permission_delete ON public.materials AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.material_movements AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('production'));
CREATE POLICY permission_insert ON public.material_movements AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('production'));
CREATE POLICY permission_update ON public.material_movements AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('production')) WITH CHECK(public.has_permission('production'));
CREATE POLICY permission_delete ON public.material_movements AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.product_specs AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('production') OR public.has_permission('sales'));
CREATE POLICY permission_insert ON public.product_specs AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('admin'));
CREATE POLICY permission_update ON public.product_specs AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('admin')) WITH CHECK(public.has_permission('admin'));
CREATE POLICY permission_delete ON public.product_specs AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.product_spec_materials AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('production') OR public.has_permission('sales'));
CREATE POLICY permission_insert ON public.product_spec_materials AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('admin'));
CREATE POLICY permission_update ON public.product_spec_materials AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('admin')) WITH CHECK(public.has_permission('admin'));
CREATE POLICY permission_delete ON public.product_spec_materials AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.workers AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('payroll'));
CREATE POLICY permission_insert ON public.workers AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('payroll'));
CREATE POLICY permission_update ON public.workers AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('payroll')) WITH CHECK(public.has_permission('payroll'));
CREATE POLICY permission_delete ON public.workers AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.attendance AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('attendance') OR public.has_permission('payroll'));
CREATE POLICY permission_insert ON public.attendance AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('attendance') OR public.has_permission('payroll'));
CREATE POLICY permission_update ON public.attendance AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('attendance') OR public.has_permission('payroll')) WITH CHECK(public.has_permission('attendance') OR public.has_permission('payroll'));
CREATE POLICY permission_delete ON public.attendance AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.worker_transactions AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('payroll'));
CREATE POLICY permission_insert ON public.worker_transactions AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('payroll'));
CREATE POLICY permission_update ON public.worker_transactions AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('payroll')) WITH CHECK(public.has_permission('payroll'));
CREATE POLICY permission_delete ON public.worker_transactions AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE POLICY permission_read ON public.worker_payouts AS RESTRICTIVE FOR SELECT TO authenticated USING(public.has_permission('payroll'));
CREATE POLICY permission_insert ON public.worker_payouts AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.has_permission('payroll'));
CREATE POLICY permission_update ON public.worker_payouts AS RESTRICTIVE FOR UPDATE TO authenticated USING(public.has_permission('admin')) WITH CHECK(public.has_permission('admin'));
CREATE POLICY permission_delete ON public.worker_payouts AS RESTRICTIVE FOR DELETE TO authenticated USING(public.has_permission('admin'));
CREATE FUNCTION public.guard_restricted_changes() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF current_user IN ('postgres','service_role') THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='workers' THEN
  IF NEW.daily_wage IS DISTINCT FROM OLD.daily_wage AND NOT public.has_permission('admin') THEN RAISE EXCEPTION 'تعديل اليومية متاح للمدير فقط' USING ERRCODE='42501'; END IF;
 ELSIF TG_TABLE_NAME='orders' THEN
  IF (NEW.status IS DISTINCT FROM OLD.status OR NEW.material_overrides IS DISTINCT FROM OLD.material_overrides) AND NOT public.has_permission('production') THEN RAISE EXCEPTION 'تغيير حالة التصنيع أو الخامات يحتاج صلاحية الإنتاج' USING ERRCODE='42501'; END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER a_restricted_changes BEFORE UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.guard_restricted_changes();
CREATE TRIGGER a_restricted_changes BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_restricted_changes();

CREATE VIEW public.attendance_status WITH(security_barrier=true) AS
 SELECT a.id,a.worker_id,a.work_date,a.status,a.extra_units,a.extra_type,w.name AS worker_name,
 EXISTS(SELECT 1 FROM public.worker_payouts p WHERE p.worker_id=a.worker_id AND p.week_start=a.work_date-((extract(dow FROM a.work_date)::int+2)%7) AND p.voided_at IS NULL) AS week_paid
 FROM public.attendance a JOIN public.workers w ON w.id=a.worker_id
 WHERE public.has_permission('attendance') OR public.has_permission('payroll');
REVOKE ALL ON public.attendance_status FROM anon,authenticated;
GRANT SELECT ON public.attendance_status TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.guard_paid_attendance() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_worker uuid; v_date date; v_start date;
BEGIN
 IF NOT (public.has_permission('attendance') OR public.has_permission('payroll')) AND coalesce(current_setting('role',true),'none') NOT IN ('none','service_role') THEN RAISE EXCEPTION 'ليست لديك صلاحية الحضور' USING ERRCODE='42501'; END IF;
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
-- SELECT FOR SHARE also requires UPDATE visibility. Give order creation a
-- narrowly scoped read-and-lock helper, not permission to edit master recipes.
CREATE FUNCTION public.read_order_recipe(p_id uuid) RETURNS public.product_specs
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result public.product_specs;
BEGIN
 IF NOT (public.has_permission('sales') OR public.has_permission('production')) AND coalesce(current_setting('role',true),'none') NOT IN ('none','service_role') THEN RAISE EXCEPTION 'Recipe access denied' USING ERRCODE='42501'; END IF;
 SELECT * INTO result FROM public.product_specs WHERE id=p_id FOR SHARE;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.read_order_recipe(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.read_order_recipe(uuid) TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.order_manufacturing_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  spec product_specs%ROWTYPE; line jsonb; override_key text; v_qty numeric;
  v_available numeric; v_shortages text := ''; v_material uuid;
BEGIN
  IF TG_OP='INSERT' THEN
    NEW.material_requirements := '[]'::jsonb;
    IF NEW.product_spec_id IS NOT NULL THEN
      IF NEW.status <> 'pending' THEN RAISE EXCEPTION 'أوردر الوصفة يجب أن يبدأ قيد الانتظار'; END IF;
      SELECT * INTO spec FROM public.read_order_recipe(NEW.product_spec_id);
      IF spec.id IS NULL OR NOT spec.active THEN RAISE EXCEPTION 'الوصفة غير موجودة أو غير نشطة'; END IF;
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
