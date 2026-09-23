import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import { moduleLoader } from './test-modules.mjs';

// Calls the real Gemini service using a synthetic quotation. Never writes to DB.
nextEnv.loadEnvConfig(process.cwd());
const apiKey=process.env.GEMINI_API_KEY?.trim();
if(!apiKey)throw new Error('GEMINI_API_KEY is required for this live verification.');
const load=moduleLoader();
const {extractQuotationWithGemini}=load('lib/quotations/gemini.ts');
const {parseAiQuotation}=load('lib/quotations/ai.ts');
const {quotationTotals}=load('lib/quotations/items.ts');
try{
  const output=await extractQuotationWithGemini(
    'محتاج 20 خزان سعة 1000 لتر، سعر الوحدة 2500 جنيه.\nو50 خزان سعة 5000 لتر، سعر الوحدة 8500 جنيه.\nالخامة: بولي إيثيلين درجة أولى بيور. تكلفة النقل: 1500 جنيه.',
    apiKey,
  );
  const {result,warnings}=parseAiQuotation(output,{});
  assert.ok(result.success,'Live response must pass business validation');
  assert.equal(result.data.products.length,2);
  for(const [capacity,quantity,price] of [[1000,20,2500],[5000,50,8500]]){
    const product=result.data.products.find(item=>item.capacity.includes(String(capacity)));
    assert.ok(product,'Missing tank capacity '+capacity);
    assert.equal(product.quantity,quantity);
    assert.equal(product.price,price);
  }
  assert.equal(result.data.transportation_cost,1500);
  assert.equal(quotationTotals(result.data).grandTotal,476500);
  assert.deepEqual(warnings,[]);
  console.log('PASS LIVE Gemini: Arabic example, two products, quantities 20/50, unit prices 2500/8500, transport 1500, total 476500. No database writes.');
}catch(error){
  // Avoid logging raw external errors, request headers, or credentials.
  console.error('FAIL LIVE Gemini:',error.code??error.name,error.providerStatus??'');
  process.exitCode=1;
}
