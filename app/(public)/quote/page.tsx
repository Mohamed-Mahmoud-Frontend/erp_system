import type { Metadata } from "next";
import QuoteForm from "./quote-form";

export const metadata: Metadata = {
  title: "طلب عرض سعر",
};

export default function QuotePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          {/* Information Side */}
          <div className="bg-blue-600 md:w-5/12 p-10 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-black mb-4">احصل على عرض سعر</h2>
              <p className="text-blue-100 leading-relaxed mb-8 text-sm">
                نحن هنا لمساعدتك! يرجى تعبئة النموذج ببياناتك وطلبك وسيقوم فريق المبيعات بالتواصل معك في أقرب وقت لتقديم أفضل عرض سعر يناسب احتياجاتك.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <span className="text-2xl ml-4">📞</span>
                  <div>
                    <div className="text-sm text-blue-200">اتصل بنا مباشرة</div>
                    <div className="font-bold font-sans">01000000000</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl ml-4">📧</span>
                  <div>
                    <div className="text-sm text-blue-200">البريد الإلكتروني</div>
                    <div className="font-bold font-sans">sales@polymer.com</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl ml-4">📍</span>
                  <div>
                    <div className="text-sm text-blue-200">العنوان</div>
                    <div className="font-bold">المنطقة الصناعية، القاهرة</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-sm text-blue-200">
              * جميع البيانات المرسلة سرية وتستخدم فقط لغرض التواصل التجاري.
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-7/12 p-10">
            <QuoteForm />
          </div>
        </div>
      </div>
    </div>
  );
}
