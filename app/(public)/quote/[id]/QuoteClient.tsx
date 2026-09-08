"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function QuoteClient({ data }: { data: any }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const generatePdf = () => {
    if (typeof window === "undefined" || !(window as any).html2pdf) {
      alert("جاري تحميل مكتبة PDF... يرجى المحاولة بعد ثانية.");
      return;
    }
    const element = document.getElementById("priceOfferContent");
    const opt = {
      margin: [0.35, 0.35, 0.35, 0.35],
      filename: `عرض_سعر_${data.guest_name || "بولي_تكس"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: "css", avoid: ".avoid-break" },
    };
    (window as any).html2pdf().from(element).set(opt).save();
  };

  const parsedItems = data.parsed_items || [];
  const items = Array.isArray(parsedItems) ? parsedItems : parsedItems.products || [];
  const transportationCost = parsedItems.transportation_cost || 0;
  
  // Calculate totals
  const itemsTotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  const grandTotal = itemsTotal + transportationCost;

  const offerDate = new Date(data.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
              --brand: #1e3a8a;
              --brand-soft: #eff6ff;
              --accent: #0f766e;
              --ink: #1f2937;
              --muted: #6b7280;
              --line: #dbe5f1;
              --paper: #ffffff;
              --bg: #eef3f8;
          }
          body {
              background: radial-gradient(circle at top right, rgba(30, 58, 138, 0.10), transparent 22%),
                          radial-gradient(circle at bottom left, rgba(15, 118, 110, 0.10), transparent 20%),
                          var(--bg);
          }
          .signature {
              font-family: 'Aref Ruqaa Ink', serif;
              font-size: 1.6rem;
              font-weight: 700;
          }
          .avoid-break { page-break-inside: avoid !important; }
          .ltr-text { direction: ltr; display: inline-block; text-align: left; vertical-align: middle; }
          
          /* Using Tailwind classes instead where possible, but keeping specific structural styles */
          .sheet {
              max-width: 1120px;
              margin: 28px auto;
              background: var(--paper);
              border: 1px solid var(--line);
              border-radius: 26px;
              box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
              overflow: hidden;
          }
          .hero-banner {
              padding: 32px 40px 22px;
              background: linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(15, 118, 110, 0.88)), #1e3a8a;
              color: #fff;
              position: relative;
          }
          .hero-banner::after {
              content: "";
              position: absolute;
              inset: auto 0 0 0;
              height: 8px;
              background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.55), rgba(255,255,255,0.18));
          }
        `
      }} />

      {isReady && (
        <>
          <div id="priceOfferContent" className="sheet font-sans" dir="rtl" style={{ textAlign: 'right' }}>
            <div className="hero-banner avoid-break">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-bold mb-4">
                    <span>عرض سعر فني ومالي</span>
                    <span className="ltr-text">Quotation</span>
                  </div>
                  <h1 className="text-4xl font-extrabold leading-tight">عرض سعر توريد خزانات مياه بولي إيثيلين</h1>
                  <p className="mt-3 text-blue-100 text-lg">مقدم إلى {data.guest_name || "عميل الشركة"}</p>
                </div>
                <div className="text-center md:text-left">
                  {/* Since Poly image is local, we use a placeholder or assume it's in public folder. Adjust path as needed. */}
                  <img src="/poly.png" alt="شعار شركة بولي تكس" className="w-36 h-auto inline-block bg-white rounded-2xl p-3 shadow-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 avoid-break">
                <div className="bg-gradient-to-b from-blue-50 to-blue-50/30 border border-blue-100 rounded-2xl p-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">بيانات الجهة المقدمة</h3>
                  <p className="text-xl font-extrabold text-gray-900">شركة بولي تكس POLYTEX</p>
                  <p className="text-gray-600 mt-1">م. محمد إبراهيم - المدير التنفيذي</p>
                  <p className="text-gray-700 mt-3"><strong>التواصل:</strong> <span className="ltr-text">01091008926 - 01224235523</span></p>
                </div>

                <div className="bg-gradient-to-b from-blue-50 to-blue-50/30 border border-blue-100 rounded-2xl p-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">بيانات العميل</h3>
                  <p className="text-xl font-extrabold text-gray-900">{data.guest_name || "عميل الشركة"}</p>
                  {data.guest_phone && (
                    <p className="text-gray-700 mt-2"><strong>رقم الهاتف:</strong> <span className="ltr-text">{data.guest_phone}</span></p>
                  )}
                  <p className="text-gray-700 mt-3"><strong>تاريخ العرض:</strong> <span>{offerDate}</span></p>
                  <p className="text-gray-700 mt-1"><strong>صلاحية العرض:</strong> أسبوع من تاريخه</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-5 mb-8 avoid-break">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">خطاب العرض</h2>
                  <p className="text-lg leading-8 text-gray-700">
                    تتشرف <strong>شركة بولي تكس POLYTEX</strong> بتقديم عرض السعر التالي إلى <strong>{data.guest_name || "عميل الشركة"}</strong> لتوريد <strong>خزانات مياه بولي إيثيلين</strong>، 
                    والتي تصنع من خامات بيور درجة أولى سوبر وبمواصفات ممتازة لتخزين المياه والاستخدامات الصناعية.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 rounded-full px-4 py-2 text-sm font-bold">
                    البضاعة حاضرة في المخازن
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">البيانات الرسمية</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <span className="block text-gray-500 text-xs font-bold mb-1">السجل التجاري</span>
                      <span className="font-bold ltr-text text-sm">59876</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <span className="block text-gray-500 text-xs font-bold mb-1">الرقم الضريبي</span>
                      <span className="font-bold ltr-text text-sm">723-497-265</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 col-span-2">
                      <span className="block text-gray-500 text-xs font-bold mb-1">العنوان</span>
                      <span className="font-bold text-sm">كوبري قلما خلف السيد مكاوي للسيارات</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 avoid-break">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">العرض الفني والمالي</h2>
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-teal-50 border-b border-gray-200">
                        <th className="p-4 text-blue-900 font-extrabold w-12">م</th>
                        <th className="p-4 text-blue-900 font-extrabold">بيان الصنف</th>
                        <th className="p-4 text-blue-900 font-extrabold whitespace-nowrap">السعة</th>
                        <th className="p-4 text-blue-900 font-extrabold whitespace-nowrap">الكمية</th>
                        <th className="p-4 text-blue-900 font-extrabold whitespace-nowrap">سعر الوحدة</th>
                        <th className="p-4 text-blue-900 font-extrabold whitespace-nowrap">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-4 font-bold">{idx + 1}</td>
                          <td className="p-4">
                            <p className="font-extrabold text-gray-900 mb-1">
                              خزان مياه بولي إيثيلين سعة {item.capacity}
                            </p>
                          </td>
                          <td className="p-4 ltr-text font-semibold whitespace-nowrap">{item.capacity}</td>
                          <td className="p-4 font-semibold whitespace-nowrap">{item.quantity || 1}</td>
                          <td className="p-4 ltr-text font-bold whitespace-nowrap">{(item.price || 0).toLocaleString()} ج</td>
                          <td className="p-4 ltr-text font-bold text-lg whitespace-nowrap text-blue-800">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString()} ج
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 avoid-break">
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-blue-900 mb-0">ملخص التسعير</h2>
                    <span className="bg-blue-100 text-blue-800 border border-blue-200 rounded-full px-3 py-1 text-xs font-bold">
                      عرض سعر مباشر
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100/50">
                      <span className="font-semibold text-gray-700">إجمالي أسعار الخزانات</span>
                      <span className="font-bold ltr-text">{itemsTotal.toLocaleString()} ج.م</span>
                    </div>
                    {transportationCost > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-blue-100/50">
                        <span className="font-semibold text-gray-700">النقل والتوصيل</span>
                        <span className="font-bold ltr-text">{transportationCost.toLocaleString()} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-blue-100/50">
                      <span className="font-semibold text-gray-700">الضريبة</span>
                      <span className="font-bold text-sm text-gray-500">غير شامل ضريبة القيمة المضافة</span>
                    </div>
                    <div className="flex justify-between items-center py-3 mt-2">
                      <span className="font-extrabold text-gray-900 text-lg">الإجمالي النهائي</span>
                      <span className="text-2xl font-extrabold text-blue-800 ltr-text">
                        {grandTotal.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">المواصفات الفنية</h2>
                  <div className="space-y-2 text-sm text-gray-700 leading-relaxed font-medium">
                    <p>تتشرف شركة بولي تكس POLYTEX أن تقدم لكم خزانات المياه البولي ايثيلين النقي البيور.</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 mb-2 pr-2">
                      <li>نقوم بإضافة مادة (UV) لمقاومة أشعة الشمس ومنع التشققات وتأثير الرطوبة.</li>
                      <li><strong>الطبقة الخارجية:</strong> بيضاء لامتصاص أشعة الشمس.</li>
                      <li><strong>الطبقة الوسطى:</strong> سوداء لمنع الضوء ونمو الطحالب والبكتيريا.</li>
                      <li><strong>الطبقة الداخلية:</strong> بيضاء وناعمة لضمان نقاء المياه ومنع الرواسب.</li>
                    </ul>
                    <p>مزود بـ 3 جلب نحاس لسهولة الفتح والتركيب، وأحزمة دائرية خارجية لتقليل الضغط وزيادة العمر الافتراضي.</p>
                    <p className="text-blue-800 font-bold mt-2 text-xs">
                      * الأسعار المذكورة للمنتج الدرجة الأولى من البولي إيثيلين البيور الصافي المستورد السعودي (سابك).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 avoid-break">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">الشروط والأحكام</h2>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-7 text-sm font-medium">
                    <li><strong>مدة التوريد:</strong> البضاعة حاضرة في المخازن وجاهزة للتسليم.</li>
                    <li><strong>صلاحية العرض:</strong> العرض ساري لمدة أسبوع واحد.</li>
                    <li><strong>الضريبة:</strong> الأسعار الموضحة غير شاملة ضريبة القيمة المضافة.</li>
                    <li><strong>طريقة السداد:</strong> يتم السداد وفق الاتفاق المعتمد بين الطرفين.</li>
                  </ol>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">التوقيع والاعتماد</h2>
                  <div>
                    <p className="font-semibold text-gray-800">مع خالص التحية والتقدير،</p>
                    <p className="font-serif text-3xl text-blue-800 mt-4 font-bold" style={{ fontFamily: "'Aref Ruqaa Ink', serif" }}>
                      م. محمد إبراهيم
                    </p>
                    <p className="text-gray-600 mt-2">المدير التنفيذي - شركة بولي تكس</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 mb-12">
            <button
              onClick={generatePdf}
              className="bg-blue-900 text-white font-bold py-3 px-8 rounded-xl cursor-pointer text-lg transition duration-300 hover:bg-blue-800 shadow-lg inline-flex items-center gap-2"
            >
              <span>📄</span> تصدير العرض كـ PDF
            </button>
          </div>
        </>
      )}
    </>
  );
}
