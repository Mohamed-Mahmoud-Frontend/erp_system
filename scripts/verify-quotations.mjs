import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createTestDb } from './test-db.mjs';
import { databaseClient, moduleLoader } from './test-modules.mjs';

const db = await createTestDb();
const sqlClient = databaseClient(db);
let user = null;
let providerMode = 'success';
let providerCalls = 0;
let providerStatus = 400;
let customOutput;
let finishReason = 'STOP';
const output = {
  guest_name: 'Quotation test', guest_phone: '01000000000', transportation_cost: 4500,
  products: [{ capacity: '1000 لتر', quantity: 2, price: 2250, material: 'بولي إيثيلين' }],
};
// Only external provider and session lookup are controlled. The real route,
// schemas, rate limiter, totals, SQL INSERT and database RLS execute unchanged.
const nativeFetch=globalThis.fetch;
const nativeError=console.error;
const providerLogs=[];
console.error=(...args)=>providerLogs.push(args);
globalThis.fetch=async (url, options)=>{
  const config=JSON.parse(options.body).generationConfig;
  assert.equal(config.responseMimeType,'application/json');
  assert.equal(config.responseJsonSchema.type,'object');
  assert.ok(config.responseJsonSchema.properties.products);
  // The live API rejected the former full validation schema with HTTP 400.
  // Keep its extraction contract minimal; business bounds are checked locally.
  const supportedKeys=new Set(['type','properties','items','required','description']);
  const checkSchema=schema=>{
    for(const key of Object.keys(schema))assert.ok(supportedKeys.has(key), 'Unexpected provider schema keyword: '+key);
    for(const child of Object.values(schema.properties??{}))checkSchema(child);
    if(schema.items)checkSchema(schema.items);
  };
  checkSchema(config.responseJsonSchema);
  const contract=z.fromJSONSchema(config.responseJsonSchema);
  assert.equal(contract.safeParse({products:[{capacity:null,quantity:null,price:null}]}).success,true);
  assert.equal(contract.safeParse(output).success,true);
  assert.equal(contract.safeParse({...output,products:[{...output.products[0],price:'2250'}]}).success,false);
  assert.match(String(url),/^https:\/\/generativelanguage\.googleapis\.com\//);
  providerCalls++;
  if(providerMode==='failure')throw new Error('Deliberate provider outage');
  if(providerMode==='http')return new Response('Private provider details: isolated-test-key',{status:providerStatus});
  if(providerMode==='timeout')throw new DOMException('Deliberate timeout','AbortError');
  if(providerMode==='body-timeout')return {ok:true,json:async()=>{throw new DOMException('Body timeout','AbortError');}};
  if(providerMode==='empty')return Response.json({candidates:[{finishReason:'STOP',content:{parts:[]}}]});
  if(providerMode==='blocked')return Response.json({promptFeedback:{blockReason:'SAFETY'}});
  const content=providerMode==='malformed'?'{bad JSON':JSON.stringify(providerMode==='invalid'?{products:[]}:(customOutput??output));
  return Response.json({candidates:[{finishReason,content:{parts:[{text:content}]}}]});
};const load = moduleLoader({
  '@/lib/supabase/server': { createClient: async () => ({
    ...sqlClient, auth: { getUser: async () => ({ data: { user }, error: null }) },
  }) },
});
const { POST } = load('app/api/quotations/ai/route.ts');
const { parseQuotationItems, quotationTotals } = load('lib/quotations/items.ts');
const previousKey = process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY = 'isolated-test-key';
const request = (body = JSON.stringify({ text: 'خزانين 1000 لتر، سعر الواحد 2250 والنقل 4500' })) =>
  new Request('http://localhost/api/quotations/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
try {
  const unauth = await POST(request());
  assert.equal(unauth.status, 401);
  assert.equal(providerCalls, 0);

  user = { id: randomUUID() };
  await db.exec('SET ROLE authenticated');
  const success = await POST(request());
  assert.equal(success.status, 200);
  const result = await success.json();
  assert.equal(result.success, true);
  const { rows: [saved] } = await db.query('SELECT * FROM quotations WHERE id=$1', [result.quotation.id]);
  assert.equal(saved.parsed_items.transportation_cost, 4500);
  assert.equal(quotationTotals(parseQuotationItems(saved.parsed_items)).grandTotal, 9000);
  assert.equal(result.totals.grandTotal, 9000);
  assert.ok(result.quotation.share_token);

  providerMode = 'failure';
  const failed = await POST(request());
  assert.equal(failed.status, 502);
  assert.equal((await failed.json()).success, undefined);
  providerMode = 'malformed';
  assert.equal((await POST(request())).status, 502);
  providerMode = 'invalid';
  assert.equal((await POST(request())).status, 422);
  assert.equal((await POST(request('{'))).status, 400);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n, 1);

  for(const [httpStatus,expectedStatus,code] of [
    [400,502,'GEMINI_INVALID_REQUEST'],[401,503,'GEMINI_ACCESS_DENIED'],
    [403,503,'GEMINI_ACCESS_DENIED'],[404,502,'GEMINI_INVALID_REQUEST'],
    [429,503,'GEMINI_RATE_LIMIT'],[503,502,'GEMINI_UNAVAILABLE'],
  ]){
    user={id:randomUUID()};
    providerMode='http';providerStatus=httpStatus;
    const response=await POST(request());
    assert.equal(response.status,expectedStatus);
    const body=await response.json();
    assert.equal(body.code,code);
    assert.ok(body.error.includes('لم يُحفظ عرض سعر'));
    assert.ok(!JSON.stringify(body).includes('isolated-test-key'));
  }
  for(const [mode,expectedStatus,code] of [
    ['timeout',504,'GEMINI_TIMEOUT'],['body-timeout',504,'GEMINI_TIMEOUT'],
    ['empty',502,'GEMINI_EMPTY_RESPONSE'],['blocked',502,'GEMINI_INCOMPLETE_RESPONSE'],
  ]){
    user={id:randomUUID()};providerMode=mode;
    const response=await POST(request());
    assert.equal(response.status,expectedStatus);
    assert.equal((await response.json()).code,code);
  }
  assert.equal((await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n,1);
  assert.ok(providerLogs.some(([,metadata])=>metadata.providerStatus===400));
  assert.ok(!JSON.stringify(providerLogs).includes('isolated-test-key'));

  user = { id: randomUUID() };
  providerMode = 'failure';
  for (let i = 0; i < 10; i++) assert.equal((await POST(request())).status, 502);
  const callsBeforeLimit = providerCalls;
  const limited = await POST(request());
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  assert.equal(providerCalls, callsBeforeLimit);

  // Regression coverage uses the real route and SQL, with controlled Gemini
  // responses. It does not assert that the live model extracts this message.
  const sampleText='السلام عليكم محتاج خزان درجه اولى بيور 20 خزان 1000 لتر و50 خزان 5000 لتر السعر ال1000 ب2500 ج وال5000 ب8500 ج';
  const sample={guest_name:null,guest_phone:null,transportation_cost:null,products:[
    {capacity:'1000 لتر',quantity:20,price:2500,material:'درجة أولى بيور'},
    {capacity:'5000 لتر',quantity:50,price:8500,material:'درجة أولى بيور'},
  ]};
  const submitOutput=async (value, customer={})=>{
    user={id:randomUUID()};
    providerMode='success';
    customOutput=value;
    return POST(request(JSON.stringify({text:sampleText,...customer})));
  };
  const nullOptional=await submitOutput(sample,{name:'شركة اختبار',phone:'01000000000'});
  assert.equal(nullOptional.status,200);
  const nullableResult=await nullOptional.json();
  assert.equal(nullableResult.totals.grandTotal,475000);
  assert.equal(nullableResult.parsed.guest_name,'شركة اختبار');
  assert.equal(nullableResult.parsed.guest_phone,'01000000000');
  assert.equal(nullableResult.warnings.length,1);
  const {rows:[normalizedSaved]}=await db.query('SELECT * FROM quotations WHERE id=$1',[nullableResult.quotation.id]);
  assert.equal(normalizedSaved.status,'draft');
  assert.equal(normalizedSaved.guest_name,'شركة اختبار');
  assert.equal(normalizedSaved.parsed_items.products.length,2);
  assert.equal(normalizedSaved.parsed_items.transportation_cost,0);

  const absentCustomer=await submitOutput({...sample,products:[{...sample.products[0],material:null}]});
  assert.equal(absentCustomer.status,200);
  const absentResult=await absentCustomer.json();
  assert.equal(absentResult.parsed.guest_name,undefined);
  assert.equal(absentResult.parsed.guest_phone,undefined);
  assert.ok(absentResult.parsed.products[0].material);

  const omittedOptional=await submitOutput({products:sample.products});
  assert.equal(omittedOptional.status,200);
  assert.equal((await omittedOptional.json()).warnings.length,1);
  const overridden=await submitOutput({...sample,guest_name:123,guest_phone:{invalid:true},transportation_cost:0},{name:'اسم معتمد',phone:'01000000001'});
  assert.equal(overridden.status,200);
  const overriddenResult=await overridden.json();
  assert.equal(overriddenResult.parsed.guest_name,'اسم معتمد');
  assert.equal(overriddenResult.parsed.guest_phone,'01000000001');
  assert.deepEqual(overriddenResult.warnings,[]);

  const countBeforeInvalid=(await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n;
  for(const [change,field] of [
    [{price:null},'سعر الوحدة'],[{price:undefined},'سعر الوحدة'],[{price:'2500'},'سعر الوحدة'],
    [{price:-1},'سعر الوحدة'],[{quantity:null},'الكمية'],[{quantity:0},'الكمية'],
    [{quantity:1.5},'الكمية'],[{capacity:1000},'السعة'],[{capacity:null},'السعة'],
    [{price:1_000_000_001},'سعر الوحدة'],[{quantity:1_000_001},'الكمية'],
    [{capacity:''},'السعة'],[{capacity:'x'.repeat(201)},'السعة'],[{material:'x'.repeat(501)},'الخامة'],
  ]){
    const invalid=await submitOutput({...sample,products:[sample.products[0],{...sample.products[1],...change}]});
    assert.equal(invalid.status,422);
    const error=(await invalid.json()).error;
    assert.ok(error.includes('البند 2'));
    assert.ok(error.includes(field));
  }
  const badShipping=await submitOutput({...sample,transportation_cost:-50});
  assert.equal(badShipping.status,422);
  assert.ok((await badShipping.json()).error.includes('تكلفة النقل'));
  finishReason='MAX_TOKENS';
  assert.equal((await submitOutput(sample)).status,502);
  finishReason='STOP';
  assert.equal((await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n,countBeforeInvalid);
  customOutput=undefined;
  console.log('PASS structured response contract; null/omitted optional fields; form precedence; two products total 475000; transport warning; invalid/missing prices, quantities and capacities and truncated output do not save.');

  const { rows: [other] } = await db.query("INSERT INTO quotations(guest_name,status) VALUES ('Other private quote','draft') RETURNING id");
  await db.exec('SET ROLE anon');
  assert.equal((await db.query('SELECT * FROM quotations')).rows.length, 0);
  assert.equal((await db.query('SELECT * FROM quotations WHERE id=$1', [saved.id])).rows.length, 0);
  await db.query("SELECT set_config('request.headers', $1, false)", [JSON.stringify({ 'x-quotation-token': saved.share_token })]);
  assert.deepEqual((await db.query('SELECT id FROM quotations')).rows, [{ id: saved.id }]);
  assert.equal((await db.query('SELECT * FROM quotations WHERE id=$1', [other.id])).rows.length, 0);
  await assert.rejects(db.query("UPDATE quotations SET guest_name='Changed' WHERE id=$1", [saved.id]), /permission denied/);
  await assert.rejects(db.query('DELETE FROM quotations WHERE id=$1', [saved.id]), /permission denied/);
  await assert.rejects(db.query("INSERT INTO quotations(guest_name,share_token) VALUES ('Forged',$1)", [randomUUID()]), /permission denied/);
  await db.query("SELECT set_config('request.headers', '{}', false)");
  await db.query("INSERT INTO quotations(guest_name,guest_phone,details,status) VALUES ('Public request','01000000000','طلب جديد','draft')");
  await db.query("SELECT set_config('request.headers', $1, false)", [JSON.stringify({ 'x-quotation-token': randomUUID() })]);
  assert.equal((await db.query('SELECT * FROM quotations')).rows.length, 0);
  await db.exec('RESET ROLE');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM quotations')).rows[0].n, countBeforeInvalid + 2);

  assert.equal(quotationTotals({ products: [{ price: 0.1, quantity: 3 }], transportation_cost: 0.2 }).grandTotal, 0.5);
  console.log('PASS AI route: anon 401/no provider call; authenticated 200; saved total 9000 incl. shipping 4500; deliberate failure/malformed output 502 with no insert; invalid products 422; malformed request 400; rate limit 429.');
  console.log('PASS anon RLS: no token/id-only/wrong token cannot read; correct token lists exactly one quote; cannot read other id or update/delete/forge token; public request insert still works.');
} finally {
  if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKey;
  globalThis.fetch=nativeFetch;
  console.error=nativeError;
  await db.close();
}
