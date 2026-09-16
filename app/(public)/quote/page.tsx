import type { Metadata } from "next";
import QuoteForm from "./quote-form";

export const metadata: Metadata = {
  title: "طلب عرض سعر | مصنع مميز لخزانات المياه",
};

export default function QuotePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200/80">
          {/* Information Side */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 md:w-5/12 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold mb-3 border border-blue-400/30">
                تسعير مباشر ومعتمد
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mb-3">احصل على عرض سعر</h1>
              <p className="text-blue-100 leading-relaxed mb-8 text-xs sm:text-sm">
                يرجى تعبئة النموذج بالبيانات المطلوبة وسيتواصل معك مهندسو المبيعات لتحديد السعة الأمثل وتقديم أفضل أسعار الجملة والتوريد.
              </p>

              <div className="space-y-5">
                <a
                  href="tel:01000000000"
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">📞</span>
                  <div>
                    <div className="text-xs text-blue-200">اتصل بنا مباشرة</div>
                    <div className="font-bold font-mono text-sm sm:text-base text-white" dir="ltr">01000000000</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/10">
                  <span className="text-2xl flex-shrink-0">✉️</span>
                  <div>
                    <div className="text-xs text-blue-200">البريد الإلكتروني</div>
                    <div className="font-bold font-mono text-xs sm:text-sm text-white" dir="ltr">info@polymer-factory.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/10">
                  <span className="text-2xl flex-shrink-0">📍</span>
                  <div>
                    <div className="text-xs text-blue-200">مقر المصنع والإدارة</div>
                    <div className="font-bold text-xs sm:text-sm text-white">المنطقة الصناعية، القاهرة، مصر</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-500/40 text-xs text-blue-200 leading-relaxed">
              🔒 جميع بياناتك محمية ومشفرة وتستخدم حصراً للتواصل التجاري وإعداد عرض السعر المطلوب.
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-7/12 p-6 sm:p-8 md:p-10">
            <QuoteForm />
          </div>
        </div>
      </div>
    </div>
  );
}
