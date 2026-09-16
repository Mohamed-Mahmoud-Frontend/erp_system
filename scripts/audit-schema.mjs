import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createTestDb } from './test-db.mjs';

const directory = 'audit/schema';
const raw = await readFile(`${directory}/live-raw.json`);
const decoded = (raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le') : raw.toString('utf8')).replace(/^\uFEFF/, '');
const live = JSON.parse(decoded).rows[0].schema_snapshot;
const db = await createTestDb();
let expected;
try {
  const results = await db.exec(await readFile('scripts/schema-catalog.sql', 'utf8'));
  expected = results.at(-1).rows[0].schema_snapshot;
} finally { await db.close(); }

const sections = ['tables','columns','constraints','indexes','policies','triggers','functions','types','views','sequences'];
const key = row => [row.schema, row.table, row.name, row.arguments].filter(v => v !== undefined).join('.');
const canonical = value => {
  if (typeof value === 'string') return value.replace(/\r\n/g, '\n');
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
};
const discrepancies = [];
for (const section of sections) {
  const actual = new Map(live[section].filter(r => r.schema === 'public').map(r => [key(r), r]));
  const wanted = new Map(expected[section].filter(r => r.schema === 'public').map(r => [key(r), r]));
  for (const name of [...new Set([...actual.keys(), ...wanted.keys()])].sort()) {
    const a = actual.get(name);
    const e = wanted.get(name);
    if (!a || !e) discrepancies.push({ section, name, kind: a ? 'live-only' : 'migration-only', live: a ?? null, expected: e ?? null });
    else for (const field of [...new Set([...Object.keys(a), ...Object.keys(e)])].sort()) {
      if (JSON.stringify(canonical(a[field])) !== JSON.stringify(canonical(e[field]))) {
        discrepancies.push({ section, name, kind: 'different', field, live: a[field], expected: e[field] });
      }
    }
  }
}
const migrations = [];
for (const name of (await readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()) {
  migrations.push({ name, sha256: createHash('sha256').update(await readFile(`supabase/migrations/${name}`)).digest('hex') });
}
const summary = {
  captured_at: new Date().toISOString(),
  live_version: live.server_version, replay_version: expected.server_version,
  comparison_scope: 'public (all migrations target public); full non-system live metadata retained separately',
  line_ending_normalization: 'CRLF to LF only',
  counts: Object.fromEntries(sections.map(s => [s, { live_all: live[s].length, live_public: live[s].filter(r => r.schema === 'public').length, replay_public: expected[s].filter(r => r.schema === 'public').length }])),
  platform_inventory: Object.fromEntries(live.schemas.filter(s => s !== 'public').map(s => [s, Object.fromEntries(sections.map(k => [k, live[k].filter(r => r.schema === s).length]))])),
  migrations, discrepancies,
};
await writeFile(`${directory}/live.json`, JSON.stringify(live, null, 2) + '\n');
await writeFile(`${directory}/replayed.json`, JSON.stringify(expected, null, 2) + '\n');
await writeFile(`${directory}/comparison.json`, JSON.stringify(summary, null, 2) + '\n');
// The canonical UTF-8 snapshot above retains all metadata; discard only the
// transient CLI envelope (PowerShell may encode that file as UTF-16).
await unlink(`${directory}/live-raw.json`);
console.log(JSON.stringify({ versions: [live.server_version, expected.server_version], counts: summary.counts, discrepancies }, null, 2));
if (discrepancies.length) process.exitCode = 1;
