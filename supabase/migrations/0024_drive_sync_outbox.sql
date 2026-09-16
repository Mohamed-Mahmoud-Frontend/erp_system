-- Durable change notifications. Acknowledgement uses exact event IDs, not a
-- sequence watermark: a later-committing transaction must never be skipped.
CREATE TABLE public.sync_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),table_name text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp());
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sync_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.sync_events TO service_role;
CREATE INDEX sync_events_table_idx ON public.sync_events(table_name);
CREATE TABLE public.integration_status(name text PRIMARY KEY,last_success timestamptz,last_error text,details jsonb NOT NULL DEFAULT '{}');
ALTER TABLE public.integration_status ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.integration_status FROM anon,authenticated;
GRANT SELECT ON public.integration_status TO authenticated;
GRANT ALL ON public.integration_status TO service_role;
CREATE POLICY admin_read ON public.integration_status FOR SELECT TO authenticated USING(public.has_permission('admin'));
CREATE FUNCTION public.queue_sheet_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.sync_events(table_name) VALUES(TG_TABLE_NAME);
 RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.queue_sheet_change() FROM PUBLIC;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['clients','orders','invoices','payments','cheques','sales_returns','materials','material_movements','product_specs','product_spec_materials','suppliers','supplier_transactions','workers','attendance','worker_transactions','worker_payouts','quotations','invoice_sequences'] LOOP
  EXECUTE format('CREATE TRIGGER sheet_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.queue_sheet_change()',t);
  INSERT INTO public.sync_events(table_name) VALUES(t);
 END LOOP;
END; $$;
CREATE FUNCTION public.sheet_snapshot(p_table text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE source_name text; rows_json jsonb; columns_json jsonb; events_json jsonb;
BEGIN
 IF p_table <> ALL(ARRAY['clients','orders','invoices','payments','cheques','sales_returns','materials','material_movements','product_specs','product_spec_materials','suppliers','supplier_transactions','workers','attendance','worker_transactions','worker_payouts','quotations','invoice_sequences']) OR p_table IS NULL THEN RAISE EXCEPTION 'Unknown export table'; END IF;
 source_name:=CASE p_table WHEN 'invoices' THEN 'invoice_balances' WHEN 'suppliers' THEN 'supplier_balances' ELSE p_table END;
 SELECT coalesce(jsonb_agg(id),'[]') INTO events_json FROM public.sync_events WHERE table_name=p_table;
 SELECT jsonb_agg(column_name ORDER BY ordinal_position) INTO columns_json FROM information_schema.columns WHERE table_schema='public' AND table_name=source_name AND column_name<>'share_token';
 EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(t)-''share_token'' ORDER BY to_jsonb(t)::text),''[]'') FROM public.%I t',source_name) INTO rows_json;
 RETURN jsonb_build_object('table',p_table,'snapshot_at',statement_timestamp(),'columns',columns_json,'rows',rows_json,'event_ids',events_json);
END;
$$;
REVOKE ALL ON FUNCTION public.sheet_snapshot(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sheet_snapshot(text) TO service_role;
-- Dependent calculated mirrors must be refreshed as well.
CREATE FUNCTION public.queue_derived_sheet_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.sync_events(table_name) VALUES(CASE WHEN TG_TABLE_NAME='supplier_transactions' THEN 'suppliers' ELSE 'invoices' END);
 RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.queue_derived_sheet_change() FROM PUBLIC;
CREATE TRIGGER sheet_balance_change AFTER INSERT OR UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.queue_derived_sheet_change();
CREATE TRIGGER sheet_balance_change AFTER INSERT OR UPDATE OR DELETE ON public.cheques FOR EACH ROW EXECUTE FUNCTION public.queue_derived_sheet_change();
CREATE TRIGGER sheet_balance_change AFTER INSERT OR UPDATE OR DELETE ON public.sales_returns FOR EACH ROW EXECUTE FUNCTION public.queue_derived_sheet_change();
CREATE TRIGGER sheet_balance_change AFTER INSERT OR UPDATE OR DELETE ON public.supplier_transactions FOR EACH ROW EXECUTE FUNCTION public.queue_derived_sheet_change();
