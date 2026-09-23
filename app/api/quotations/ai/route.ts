import {allowed,getAccess} from "@/lib/access";
import {NextResponse} from "next/server";
import {z} from "zod";
import {createClient} from "@/lib/supabase/server";
import {quotationTotals} from "@/lib/quotations/items";
import {checkQuotationRateLimit} from "@/lib/quotations/rate-limit";
import {parseAiQuotation,quotationValidationMessage} from "@/lib/quotations/ai";
import {extractQuotationWithGemini,QuotationProviderError} from "@/lib/quotations/gemini";
const requestSchema=z.object({text:z.string().trim().min(1).max(10000),phone:z.string().trim().max(50).optional(),name:z.string().trim().max(200).optional()});
export async function POST(req:Request){
 try{
  const db=await createClient();const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user)return NextResponse.json({error:"يجب تسجيل الدخول"},{status:401});
  if(!allowed(await getAccess(),"sales"))return NextResponse.json({error:"ليست لديك صلاحية عروض الأسعار"},{status:403});
  const retryAfter=checkQuotationRateLimit(user.id);
  if(retryAfter)return NextResponse.json({error:"طلبات كثيرة، حاول بعد دقيقة"},{status:429,headers:{"Retry-After":String(retryAfter)}});
  let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:"صيغة الطلب غير صحيحة"},{status:400})}
  const input=requestSchema.safeParse(body);
  if(!input.success)return NextResponse.json({error:"راجع النص وبيانات العميل"},{status:400});
  const apiKey=process.env.GEMINI_API_KEY?.trim();
  if(!apiKey)return NextResponse.json({error:"خدمة استخراج عروض الأسعار غير مهيأة"},{status:503});
  let output:unknown;
  try{
   output=await extractQuotationWithGemini(input.data.text,apiKey);
  }catch(error){
   if(error instanceof QuotationProviderError){
    // Log only safe metadata, never the API key, customer text or provider body.
    console.error("Quotation Gemini failure",{code:error.code,providerStatus:error.providerStatus});
    return NextResponse.json({error:error.message,code:error.code},{status:error.status});
   }
   throw error;
  }
  const {result:parsed,warnings}=parseAiQuotation(output,input.data);
  if(!parsed.success)return NextResponse.json({error:quotationValidationMessage(parsed.error)},{status:422});
  const items={products:parsed.data.products,transportation_cost:parsed.data.transportation_cost};
  const {data:quote,error}=await db.from("quotations").insert({status:"draft",guest_name:input.data.name||parsed.data.guest_name||"عميل غير مسمى",guest_phone:input.data.phone||parsed.data.guest_phone||null,details:input.data.text,parsed_items:items}).select("id,share_token").single();
  if(error||!quote)return NextResponse.json({error:"فشل حفظ عرض السعر بقاعدة البيانات"},{status:500});
  return NextResponse.json({success:true,message:"تم توليد عرض السعر بنجاح",quotation:quote,parsed:parsed.data,warnings,totals:quotationTotals(items)});
 }catch{return NextResponse.json({error:"حدث خطأ داخلي أثناء معالجة عرض السعر"},{status:500})}
}