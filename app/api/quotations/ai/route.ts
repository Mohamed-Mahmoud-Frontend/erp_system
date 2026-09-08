import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Validate env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const deepseekApiKey = process.env.DEEPSEEK_API_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: deepseekApiKey
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, phone, name } = body;

    if (!text) {
      return NextResponse.json({ error: "النص مطلوب" }, { status: 400 });
    }

    if (!deepseekApiKey) {
      return NextResponse.json({ error: "مفتاح DeepSeek API غير متوفر في الخادم" }, { status: 500 });
    }

    // 1. Analyze text using DeepSeek API
    const prompt = `
أنت مساعد ذكي لمدير مصنع خزانات مياه. استخرج البيانات التالية من الرسالة وأعدها بصيغة JSON فقط دون أي نص إضافي:
- guest_name: اسم العميل أو الشركة إذا تم ذكره (أو اتركه فارغاً)
- guest_phone: رقم الهاتف إذا تم ذكره (أو اتركه فارغاً)
- transportation_cost: تكلفة النقل أو التوصيل إذا تم ذكرها كرقم (مثلاً لو قيل النقل 4500 نضع 4500. إذا لم تذكر ضعها 0).
- products: مصفوفة (Array) تحتوي على الكائنات (Objects) التالية:
  - capacity: سعة الخزان (مثلاً: "1000 لتر"، "3000 لتر")
  - quantity: العدد المطلوب (رقم صحيح، الافتراضي 1)
  - price: سعر الخزان الواحد (رقم، إذا ذكر السعر مثل "2250ج" نضع 2250)
  - material: نوع المادة (الافتراضي "بولي إيثيلين درجة أولى بيور")

الرسالة الواردة:
"${text}"
    `;

    let aiText = "{}";
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "يجب أن تكون إجابتك بصيغة JSON صالحة (Valid JSON) فقط." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.2,
      });
      aiText = aiResponse.choices[0].message.content || "{}";
    } catch (apiError: any) {
      console.warn("DeepSeek API Failed, using fallback mock:", apiError.message);
      // Fallback mock JSON for testing when balance is insufficient
      aiText = JSON.stringify({
        guest_name: "عميل تجريبي (رصيد AI غير كافٍ)",
        guest_phone: "01000000000",
        transportation_cost: 0,
        products: [
          {
            capacity: "1000 لتر",
            quantity: 1,
            price: 1500,
            material: "بولي إيثيلين درجة أولى بيور"
          }
        ]
      });
    }
    
    // Parse JSON safely
    let parsedData;
    try {
      // Find JSON array or object in the response text in case DeepSeek added extra text
      const jsonStr = aiText.substring(aiText.indexOf("{"), aiText.lastIndexOf("}") + 1);
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse DeepSeek output:", aiText);
      return NextResponse.json({ error: "فشل في تحليل مخرجات الذكاء الاصطناعي", rawOutput: aiText }, { status: 500 });
    }

    // 2. Prepare payload for Supabase
    const finalName = name || parsedData.guest_name || "عميل واتساب غير معروف";
    const finalPhone = phone || parsedData.guest_phone || null;

    // 3. Insert into quotations table as "draft"
    const { data: quote, error } = await supabase.from("quotations").insert({
      status: "draft",
      guest_name: finalName,
      guest_phone: finalPhone,
      details: text,
      parsed_items: parsedData.products || []
    }).select().single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "فشل في الحفظ بقاعدة البيانات", details: error.message }, { status: 500 });
    }

    // Return the created quotation
    return NextResponse.json({
      success: true,
      message: "تم توليد عرض السعر بنجاح عبر DeepSeek",
      quotation: quote,
      parsed: parsedData
    });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "حدث خطأ داخلي: " + err.message, details: err.message }, { status: 500 });
  }
}
