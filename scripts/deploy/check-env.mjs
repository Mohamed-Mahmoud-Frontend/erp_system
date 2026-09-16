import {loadEnvConfig} from '@next/env';
loadEnvConfig(process.cwd());
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SITE_URL'];
const missing = required.filter(name => !process.env[name]?.trim());
if (missing.length) throw Error('Missing deployment settings: ' + missing.join(', '));
for (const name of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SITE_URL']) {
  const value = new URL(process.env[name]);
  if (value.protocol !== 'https:' || ['example.com','example.supabase.co','localhost'].includes(value.hostname)) throw Error(name + ' must be a real HTTPS production URL');
}
if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === process.env.SUPABASE_SERVICE_ROLE_KEY) throw Error('Public and service role keys must be different');
for (const name of Object.keys(process.env)) {
  if (name.startsWith('NEXT_PUBLIC_') && /SECRET|SERVICE_ROLE|PASSWORD|ACCESS_TOKEN/.test(name)) throw Error('Server credential uses a public environment name: ' + name);
}
console.log('PASS: production environment names and URL formats (values are not logged).');
