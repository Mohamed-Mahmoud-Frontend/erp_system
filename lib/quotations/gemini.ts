import { z } from "zod";
import { quotationExtractionPrompt, quotationResponseJsonSchema } from "./ai";

const responseSchema = z.object({
  candidates: z.array(z.object({
    finishReason: z.string().optional(),
    content: z.object({
      parts: z.array(z.object({ text: z.string().optional() })),
    }).optional(),
  })).min(1),
});

export class QuotationProviderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 502,
    readonly providerStatus?: number,
  ) {
    super(message + " لم يُحفظ عرض سعر.");
    this.name = "QuotationProviderError";
  }
}

function httpError(status: number) {
  if (status === 429) return new QuotationProviderError(
    "تم تجاوز حد استخدام Gemini. حاول لاحقاً أو راجع حصة الاستخدام في حساب الخدمة.",
    "GEMINI_RATE_LIMIT", 503, status,
  );
  if (status === 401 || status === 403) return new QuotationProviderError(
    "رفض Gemini مفتاح الخدمة أو صلاحياته. راجع إعدادات الاتصال.",
    "GEMINI_ACCESS_DENIED", 503, status,
  );
  if (status === 400 || status === 404) return new QuotationProviderError(
    "رفض Gemini إعدادات طلب التحليل. يلزم مراجعة إعدادات الخدمة.",
    "GEMINI_INVALID_REQUEST", 502, status,
  );
  return new QuotationProviderError(
    "خدمة Gemini غير متاحة حالياً. حاول مرة أخرى لاحقاً.",
    "GEMINI_UNAVAILABLE", 502, status,
  );
}

export async function extractQuotationWithGemini(text: string, apiKey: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: quotationExtractionPrompt }] },
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: {
            temperature: 0.2, maxOutputTokens: 2000,
            responseMimeType: "application/json",
            responseJsonSchema: quotationResponseJsonSchema,
          },
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) throw httpError(response.status);
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success || parsed.data.candidates[0].finishReason !== "STOP") {
      throw new QuotationProviderError(
        "لم يُكمل Gemini تحليل الرسالة. جرّب تقسيمها إلى رسائل أقصر وإعادة المحاولة.",
        "GEMINI_INCOMPLETE_RESPONSE",
      );
    }
    const aiText = parsed.data.candidates[0].content?.parts.map(part => part.text ?? "").join("").trim();
    if (!aiText) throw new QuotationProviderError(
      "لم يُرجع Gemini بيانات للتحليل. راجع الرسالة وأعد المحاولة.",
      "GEMINI_EMPTY_RESPONSE",
    );
    return JSON.parse(aiText);
  } catch (error) {
    if (error instanceof QuotationProviderError) throw error;
    if (controller.signal.aborted || (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))) {
      throw new QuotationProviderError(
        "انتهت مهلة الاتصال بـ Gemini. حاول مرة أخرى.",
        "GEMINI_TIMEOUT", 504,
      );
    }
    if (error instanceof SyntaxError) throw new QuotationProviderError(
      "أعاد Gemini بيانات غير صالحة للتحليل. حاول مرة أخرى.",
      "GEMINI_INVALID_RESPONSE",
    );
    throw new QuotationProviderError(
      "تعذر الاتصال بخدمة Gemini. تحقق من الاتصال وحاول مرة أخرى.",
      "GEMINI_CONNECTION_FAILED",
    );
  } finally {
    // Cover both the response headers and reading its body with the deadline.
    clearTimeout(timeout);
  }
}
