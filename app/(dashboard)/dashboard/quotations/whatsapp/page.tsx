"use client";

import { useState } from "react";
import Link from "next/link";

export default function WhatsappSimulatorPage() {
  const [text, setText] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/quotations/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, phone, name }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ غير متوقع");
      }

      setResult(data);
      setText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">محاكي الواتساب (AI)</h1>
          <p className="text-slate-500 mt-1">اختبار استخراج عروض الأسعار من الرسائل النصية</p>
        </div>
        <Link
          href="/dashboard/quotations"
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          العودة لعروض الأسعار
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">اسم العميل (اختياري)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد محمد"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف (اختياري)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 0100000000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رسالة العميل (كما وردت على الواتساب) <span className="text-red-500">*</span></label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="مثال: السلام عليكم، محتاج عرض سعر لخزانين فايبر جلاس سعة 5 طن لو سمحت"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !text}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "جاري التحليل بواسطة الذكاء الاصطناعي..." : "إرسال وتحليل الرسالة 🚀"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 font-bold flex items-center justify-between">
              <span>{result.message}</span>
              {result.quotation?.id && (
                <a
                  href={`/quote/${result.quotation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  📄 فتح الـ PDF
                </a>
              )}
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700">
                البيانات المستخرجة
              </div>
              <div className="p-4 bg-white">
                <pre className="text-sm text-slate-800 whitespace-pre-wrap" dir="ltr">
                  {JSON.stringify(result.parsed, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
