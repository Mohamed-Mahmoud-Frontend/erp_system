-- Metadata only: all non-system schemas, including Supabase-managed schemas.
-- No table contents, secrets, or auth users are exported.
SET search_path = public, pg_catalog;
WITH namespaces AS (
  SELECT oid, nspname FROM pg_namespace
  WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema'
), relations AS (
  SELECT c.*, n.nspname FROM pg_class c JOIN namespaces n ON n.oid=c.relnamespace
  WHERE c.relkind IN ('r','p','v','m','f','S')
)
SELECT jsonb_build_object(
  'server_version', current_setting('server_version'),
  'schemas', (SELECT jsonb_agg(nspname ORDER BY nspname) FROM namespaces),
  'extensions', (SELECT coalesce(jsonb_agg(jsonb_build_object('name',e.extname,'schema',n.nspname,'version',e.extversion) ORDER BY e.extname),'[]') FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace),
  'tables', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',nspname,'name',relname,'kind',relkind,'rls',relrowsecurity,
    'force_rls',relforcerowsecurity,'persistence',relpersistence,'replica_identity',relreplident,
    'partition_key',CASE WHEN relkind='p' THEN pg_get_partkeydef(oid) ELSE NULL END,
    'options',reloptions,'comment',obj_description(oid,'pg_class')
  ) ORDER BY nspname,relname),'[]') FROM relations WHERE relkind <> 'S'),
  'columns', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',c.table_schema,'table',c.table_name,'name',c.column_name,'ordinal',c.ordinal_position,
    'data_type',c.data_type,'udt_schema',c.udt_schema,'udt_name',c.udt_name,
    'nullable',c.is_nullable,'default',c.column_default,'max_length',c.character_maximum_length,
    'precision',c.numeric_precision,'scale',c.numeric_scale,'datetime_precision',c.datetime_precision,
    'collation',c.collation_name,'identity',c.is_identity,'identity_generation',c.identity_generation,
    'generated',c.is_generated,'generation_expression',c.generation_expression,
    'comment',col_description(r.oid,a.attnum)
  ) ORDER BY c.table_schema,c.table_name,c.ordinal_position),'[]')
    FROM information_schema.columns c JOIN relations r ON r.nspname=c.table_schema AND r.relname=c.table_name
    JOIN pg_attribute a ON a.attrelid=r.oid AND a.attname=c.column_name),
  'constraints', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',r.nspname,'table',r.relname,'name',c.conname,'type',c.contype,
    'definition',pg_get_constraintdef(c.oid,false),'validated',c.convalidated,
    'deferrable',c.condeferrable,'deferred',c.condeferred,'local',c.conislocal,
    'comment',obj_description(c.oid,'pg_constraint')
  ) ORDER BY r.nspname,r.relname,c.conname),'[]') FROM pg_constraint c JOIN relations r ON r.oid=c.conrelid
    WHERE c.contype IN ('p','f','u','c','x')),
  'indexes', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',r.nspname,'table',r.relname,'name',idx.relname,'definition',pg_get_indexdef(i.indexrelid),
    'unique',i.indisunique,'primary',i.indisprimary,'valid',i.indisvalid,'ready',i.indisready,
    'replica_identity',i.indisreplident,'clustered',i.indisclustered,
    'comment',obj_description(i.indexrelid,'pg_class')
  ) ORDER BY r.nspname,r.relname,idx.relname),'[]') FROM pg_index i JOIN relations r ON r.oid=i.indrelid JOIN pg_class idx ON idx.oid=i.indexrelid),
  'policies', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',schemaname,'table',tablename,'name',policyname,'permissive',permissive,
    'roles',roles,'command',cmd,'using',qual,'check',with_check
  ) ORDER BY schemaname,tablename,policyname),'[]') FROM pg_policies WHERE schemaname IN (SELECT nspname FROM namespaces)),
  'triggers', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',r.nspname,'table',r.relname,'name',t.tgname,'definition',pg_get_triggerdef(t.oid,false),
    'enabled',t.tgenabled,'comment',obj_description(t.oid,'pg_trigger')
  ) ORDER BY r.nspname,r.relname,t.tgname),'[]') FROM pg_trigger t JOIN relations r ON r.oid=t.tgrelid WHERE NOT t.tgisinternal),
  'functions', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',n.nspname,'name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),
    'result',pg_get_function_result(p.oid),'language',l.lanname,'body',p.prosrc,
    'argument_defaults',pg_get_expr(p.proargdefaults,0),'security_definer',p.prosecdef,
    'strict',p.proisstrict,'volatility',p.provolatile,'parallel',p.proparallel,'config',p.proconfig,
    'comment',obj_description(p.oid,'pg_proc')
  ) ORDER BY n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)),'[]')
    FROM pg_proc p JOIN namespaces n ON n.oid=p.pronamespace JOIN pg_language l ON l.oid=p.prolang
    WHERE p.prokind IN ('f','p') AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')),
  'types', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',n.nspname,'name',t.typname,'kind',t.typtype,'base',format_type(t.typbasetype,t.typtypmod),
    'not_null',t.typnotnull,'default',t.typdefault,
    'enum_values',(SELECT jsonb_agg(enumlabel ORDER BY enumsortorder) FROM pg_enum WHERE enumtypid=t.oid),
    'constraints',(SELECT jsonb_agg(pg_get_constraintdef(oid,false) ORDER BY conname) FROM pg_constraint WHERE contypid=t.oid)
  ) ORDER BY n.nspname,t.typname),'[]') FROM pg_type t JOIN namespaces n ON n.oid=t.typnamespace WHERE t.typtype IN ('e','d')),
  'views', (SELECT coalesce(jsonb_agg(jsonb_build_object('schema',nspname,'name',relname,'definition',pg_get_viewdef(oid,false)) ORDER BY nspname,relname),'[]') FROM relations WHERE relkind IN ('v','m')),
  'sequences', (SELECT coalesce(jsonb_agg(jsonb_build_object(
    'schema',r.nspname,'name',r.relname,'type',format_type(s.seqtypid,NULL),'start',s.seqstart,
    'increment',s.seqincrement,'min',s.seqmin,'max',s.seqmax,'cache',s.seqcache,'cycle',s.seqcycle
  ) ORDER BY r.nspname,r.relname),'[]') FROM pg_sequence s JOIN relations r ON r.oid=s.seqrelid)
) AS schema_snapshot;
