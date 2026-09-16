import assert from 'node:assert/strict';
import {linkedPgEnv,pgBin,run} from './backup/core.mjs';
const sql = `
BEGIN;
SET LOCAL ROLE postgres;
SELECT set_config('request.jwt.claim.sub',(SELECT user_id::text FROM public.user_access WHERE role='admin' AND active LIMIT 1),true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE saved public.delivery_notes; duplicate_blocked boolean := false;
BEGIN
 INSERT INTO public.delivery_notes(delivery_date,customer_name,recipient_name,items)
 VALUES(CURRENT_DATE,'Delivery verification (rolled back)','Test recipient','[{"description":"Test item","quantity":1.125,"unit":"piece"}]')
 RETURNING * INTO saved;
 IF saved.note_number IS NULL OR saved.created_by IS NULL OR saved.items->0->>'quantity'<>'1.125' THEN RAISE EXCEPTION 'Saved document mismatch'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.delivery_notes WHERE id=saved.id) THEN RAISE EXCEPTION 'Saved document not readable'; END IF;
 BEGIN
  INSERT INTO public.delivery_notes(id,delivery_date,customer_name,recipient_name,items) VALUES(saved.id,CURRENT_DATE,'Retry','Recipient',saved.items);
 EXCEPTION WHEN unique_violation THEN duplicate_blocked := true;
 END;
 IF NOT duplicate_blocked THEN RAISE EXCEPTION 'Duplicate not blocked'; END IF;
END;
$test$;
ROLLBACK;
`;
const env=await linkedPgEnv();
const result=await run(pgBin('psql'),['-X','-q','-v','ON_ERROR_STOP=1'],{env,input:sql});
assert.equal(result.code,0,result.stderr.replaceAll(env.PGPASSWORD,'[REDACTED]'));
console.log('PASS: live database authenticated insert/read, generated number, fractional quantity and duplicate protection. Transaction rolled back; no documents retained. Identity sequence values consumed. Browser workflow not tested.');
