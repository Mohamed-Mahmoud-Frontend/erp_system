import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// PostgreSQL in WASM; isolated from the linked factory database.
export async function createTestDb() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE service_role BYPASSRLS;
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
  `);
  const migrations = (await readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const file of migrations) {
    const sql = await readFile(`supabase/migrations/${file}`, 'utf8');
    // PGlite provides gen_random_uuid() in core, but doesn't ship pgcrypto.
    await db.exec(sql.replace(/create extension if not exists "pgcrypto";/i, ''));
  }
  // Legacy business suites exercise business rules as an explicitly provisioned test administrator.
  await db.exec("INSERT INTO auth.users(id,email) VALUES ('10000000-0000-4000-8000-000000000099','isolated-admin@example.com'); INSERT INTO user_access(user_id,email,role) VALUES('10000000-0000-4000-8000-000000000099','isolated-admin@example.com','admin'); SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000099',false);");
  return db;
}
