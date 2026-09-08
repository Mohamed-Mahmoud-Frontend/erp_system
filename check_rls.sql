SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
SELECT pol.polname, c.relname
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public';
