import {encryptedDump} from './core.mjs';
try{const {inventory,...manifest}=await encryptedDump();console.log(JSON.stringify({...manifest,tables_fingerprinted:Object.keys(inventory).length},null,2));}catch(e){console.error(e.message);process.exitCode=1;}
