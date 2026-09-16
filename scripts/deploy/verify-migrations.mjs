import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root = await mkdtemp(join(tmpdir(), 'momayaz-migrations-'));
const command = resolve('scripts/deploy/check-migrations.mjs');
const run = (...args) => spawnSync(process.execPath, [command,...args], {cwd: root, encoding: 'utf8', windowsHide: true, env: {...process.env,MIGRATIONS_BASE:''}});
try {
  await mkdir(join(root,'supabase/migrations'),{recursive:true});
  await mkdir(join(root,'.deploy'));
  const first=join(root,'supabase/migrations/0001_initial.sql');
  await writeFile(first,'CREATE TABLE test(id int);\n');
  assert.equal(run('--record').status,0);
  assert.equal(run().status,0);
  await writeFile(first,'CREATE TABLE test(id int);\r\n');
  assert.equal(run().status,0,'Windows line endings must keep the same digest');
  await writeFile(first,'DROP TABLE test;\n');
  assert.notEqual(run().status,0,'Editing a released migration must fail');
  assert.notEqual(run('--record').status,0,'Updating manifest must not overwrite existing digests');
  await writeFile(first,'CREATE TABLE test(id int);\n');
  await writeFile(join(root,'supabase/migrations/0001_duplicate.sql'),'SELECT 1;');
  assert.notEqual(run('--record').status,0,'Duplicate versions must fail');
  await rm(join(root,'supabase/migrations/0001_duplicate.sql'));
  await writeFile(join(root,'supabase/migrations/0002_addition.sql'),'SELECT 1;');
  assert.notEqual(run().status,0,'Unrecorded migration must fail');
  assert.equal(run('--record').status,0);
  assert.equal(Object.keys(JSON.parse(await readFile(join(root,'.deploy/migrations.json'),'utf8'))).length,2);
  await rm(first);
  assert.notEqual(run().status,0,'Deleting a released migration must fail');
  console.log('PASS: migration edits, deletion, duplicate versions and unrecorded additions blocked; CRLF portable.');
} finally {
  if (!root.startsWith(join(tmpdir(),'momayaz-migrations-'))) throw Error('Unexpected temporary path');
  await rm(root,{recursive:true,force:true});
}
