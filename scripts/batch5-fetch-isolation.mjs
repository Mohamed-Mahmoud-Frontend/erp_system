// Test process only. No application change and NO request can reach the factory.
const nativeFetch=globalThis.fetch;
const origin=process.env.BATCH5_SUPABASE_ORIGIN;
const local=process.env.BATCH5_TEST_GATEWAY;
if(!origin || !local) throw Error('Explicit test origins required');
globalThis.fetch=(input,init)=>{
 const url=new URL(typeof input==='string' || input instanceof URL ? input : input.url);
 if(url.origin===origin) {
   const target=local+url.pathname+url.search;
   return nativeFetch(input instanceof Request ? new Request(target,input) : target,init);
 }
 if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw Error('Nonlocal network blocked in Batch5 browser test');
 return nativeFetch(input,init);
};
