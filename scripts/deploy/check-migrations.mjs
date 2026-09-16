import {createHash} from 'node:crypto';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const manifestPath = '.deploy/migrations.json';
const hash = value => createHash('sha256').update(value.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')).digest('hex');
const files = (await readdir('supabase/migrations')).filter(name => name.endsWith('.sql')).sort();
const actual = {};
const versions = new Set();
for (const name of files) {
  const match = /^(\d{4}|\d{14})_[a-z0-9_]+\.sql$/.exec(name);
  if (!match || versions.has(match[1])) throw Error('Invalid or duplicate migration version: ' + name);
  versions.add(match[1]);
  actual[name] = hash(await readFile('supabase/migrations/' + name, 'utf8'));
}
let recorded = {};
try {recorded = JSON.parse(await readFile(manifestPath, 'utf8'));}
catch (error) {if (error.code !== 'ENOENT') throw error;}
const base = process.env.MIGRATIONS_BASE;
if (base && !/^0+$/.test(base)) {
  if (!/^[a-f0-9]{40}$/.test(base)) throw Error('MIGRATIONS_BASE must be a commit SHA');
  execFileSync('git', ['cat-file', '-e', base + '^{commit}'], {stdio: 'ignore'});
  let previous = null;
  try {previous = execFileSync('git', ['show', base + ':' + manifestPath], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});}
  catch { /* First adoption has no manifest in its parent revision. */ }
  if (previous) for (const [name, digest] of Object.entries(JSON.parse(previous))) {
    if (actual[name] !== digest) throw Error('Previously released migration was changed or removed: ' + name);
  }
}
for (const [name, digest] of Object.entries(recorded)) {
  if (actual[name] !== digest) throw Error('Immutable migration changed: ' + name + '. Add a new migration instead.');
}
if (process.argv.includes('--record')) {
  await writeFile(manifestPath, JSON.stringify(actual, null, 2) + '\n');
} else if (Object.keys(actual).length !== Object.keys(recorded).length) {
  throw Error('New migrations need a manifest entry: npm run db:manifest');
}
console.log('PASS: ' + files.length + ' migrations, unique versions, immutable history.');
