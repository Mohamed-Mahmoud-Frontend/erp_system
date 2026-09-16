import {createTestDb} from './test-db.mjs';
import {readFile} from 'node:fs/promises';
const db=await createTestDb();try{await db.exec((await readFile('scripts/verify-permissions.sql','utf8')).replace(/^\uFEFF/,''));console.log('PASS: explicit attendance access, no wage/payroll leakage, spoofed metadata ignored, self-promotion denied, paid attendance locked, disablement immediate; supplier100 ->350 ->270 ->300, invalid raw/RPC types rejected.');}catch(e){console.error(e.message,e.code??'');process.exitCode=1;}finally{await db.close();}
