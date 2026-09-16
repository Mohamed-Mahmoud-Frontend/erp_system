import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

// Load the real server action/route code, replacing only framework/IO boundaries.
export function moduleLoader(mocks = {}) {
  // Existing business suites run as an administrator; raw RLS is tested separately.
  mocks = {'@/lib/access': {getAccess:async()=>({role:'admin',active:true,permissions:[]}),allowed:()=>true,requirePermission:async()=>({role:'admin',active:true,permissions:[]})},...mocks};
  const cache = new Map();
  const require = createRequire(import.meta.url);
  function load(file) {
    file = resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/') || name.startsWith('.')) {
        const base = name.startsWith('@/') ? resolve(name.slice(2)) : resolve(dirname(file), name);
        return load([base, `${base}.ts`, `${base}.tsx`].find(existsSync));
      }
      return require(name);
    };
    new Function('require', 'module', 'exports', compiled)(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

export function databaseClient(db) {
  return {
    from(table) {
      if (!['clients', 'orders', 'quotations'].includes(table)) throw new Error('Unexpected test table');
      return {
        insert(row) {
          const keys = Object.keys(row);
          if (keys.some(k => !/^[a-z_]+$/.test(k))) throw new Error('Invalid column');
          let result;
          const execute = () => result ??= db.query(
            `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
            Object.values(row).map(v => v !== null && typeof v === 'object' ? JSON.stringify(v) : v),
          ).then(r => ({ data: r.rows[0], error: null })).catch(error => ({ data: null, error }));
          return {
            select() { return { single: execute }; },
            then(onFulfilled, onRejected) { return execute().then(onFulfilled, onRejected); },
          };
        },
      };
    },
    async rpc(name, args) {
      if (!/^[a-z_]+$/.test(name) || Object.keys(args).some(k => !/^[a-z_]+$/.test(k))) throw new Error('Invalid RPC');
      try {
        const r = await db.query(
          `SELECT ${name}(${Object.keys(args).map((k, i) => `${k} => $${i + 1}`).join(',')}) AS value`,
          Object.values(args).map(v => v !== null && typeof v === 'object' ? JSON.stringify(v) : v),
        );
        return { data: r.rows[0].value, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  };
}
