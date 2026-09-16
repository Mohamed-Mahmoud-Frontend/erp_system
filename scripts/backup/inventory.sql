SET timezone='UTC';
DO $$ DECLARE t record; v text; result jsonb:='{}'; BEGIN
 FOR t IN SELECT n.nspname,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','auth','supabase_migrations') AND c.relkind IN ('r','p') AND NOT c.relispartition ORDER BY 1,2 LOOP
  EXECUTE format('SELECT jsonb_build_object(''count'',count(*),''md5'',md5(coalesce(string_agg(to_jsonb(t)::text,E''\n'' ORDER BY to_jsonb(t)::text),'''')))::text FROM %I.%I t',t.nspname,t.relname) INTO v;
  result:=result||jsonb_build_object(t.nspname||'.'||t.relname,v::jsonb);
 END LOOP;
 PERFORM set_config('erp.backup_inventory',result::text,false);
END; $$;
SELECT current_setting('erp.backup_inventory');
