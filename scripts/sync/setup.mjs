import{readFile,writeFile,mkdir}from'node:fs/promises';
import{randomBytes}from'node:crypto';
await mkdir('.private',{recursive:true});
let secret;try{secret=(await readFile('.private/google-sync-secret.txt','utf8')).trim();}catch(e){if(e.code!=='ENOENT')throw e;secret=randomBytes(32).toString('hex');await writeFile('.private/google-sync-secret.txt',secret,{flag:'wx',mode:0o600});}
const template=await readFile('integrations/google-drive.gs','utf8');
// Replace declaration only: retain the unconfigured-template comparison.
await writeFile('.private/google-drive-setup.gs',template.replace("const ERP_SECRET = '__ERP_SECRET__';",`const ERP_SECRET = '${secret}';`),{mode:0o600});
console.log('Private installation script prepared: .private/google-drive-setup.gs. No credentials printed.');
