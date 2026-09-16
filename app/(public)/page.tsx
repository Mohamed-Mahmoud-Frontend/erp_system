import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الرئيسية | مصنع خزانات المياه وحلول التخزين",
};

const products = [
  {
    id: 1,
    name: "خزان 500 لتر",
    tag: "للمنازل والوحدات الصغيرة",
    description: "مثالي للاستخدام المنزلي الصغير والشقق، متوفر بـ 3 طبقات أو 4 طبقات حماية متكاملة.",
    price: "يبدأ من 2,500 ج.م",
    layers: "3 - 4 طبقات",
    useCase: "منزلي / شقق",
    warranty: "10 سنوات",
    capacity: "500 L",
  },
  {
    id: 2,
    name: "خزان 1000 لتر",
    tag: "الأكثر طلباً ومبيعاً",
    description: "الخيار الأول للفلل والبيوت السكنية، حماية قصوى من حرارة الشمس الشديدة وتكون الطحالب.",
    price: "يبدأ من 4,200 ج.م",
    layers: "4 طبقات حماية",
    useCase: "فلل وبيوت سكنية",
    warranty: "10 سنوات",
    capacity: "1,000 L",
    popular: true,
  },
  {
    id: 3,
    name: "خزان 2000 لتر",
    tag: "للعمارات والأنشطة التجارية",
    description: "مصمم لتلبية احتياجات المباني السكنية، المطاعم، والمشاريع التجارية بكفاءة ومتانة عالية.",
    price: "يبدأ من 7,800 ج.م",
    layers: "4 طبقات معززة",
    useCase: "عمارات ومشاريع",
    warranty: "10 سنوات",
    capacity: "2,000 L",
  },
  {
    id: 4,
    name: "خزان 5000 لتر",
    tag: "للمصانع والمزارع والمنشآت",
    description: "سعة فائقة وسُمك جدار مضاعف مخصص للمصانع، المشروعات الكبرى، ومزارع الإنتاج الزراعي.",
    price: "يبدأ من 18,500 ج.م",
    layers: "4 طبقات صناعية",
    useCase: "مصانع ومزارع",
    warranty: "10 سنوات",
    capacity: "5,000 L",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-slate-50/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-bold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>خامات بولي إيثيلين نقية 100% · ضمان استبدال 10 سنوات</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-snug mb-5">
              خزانات مياه تعيش معاك{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
                العمر كله
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
              نصنع خزانات البولي إيثيلين بأحدث تقنيات القولبة الدورانية والمواصفات المعتمدة صحياً. أمان تام لمياه الشرب، حماية ثلاثية من البكتيريا والطحالب، وعزل حراري متين.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link
                href="/quote"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                اطلب عرض سعر الآن
              </Link>
              <Link
                href="#products"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold rounded-full text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
              >
                تصفح الكتالوج والأسعار
              </Link>
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-14 sm:mt-16 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-3">
                <strong className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono">15+</strong>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">سنة خبرة صناعية</span>
              </div>
              <div className="p-3">
                <strong className="block text-2xl sm:text-3xl font-black text-blue-600 font-mono">+10,000</strong>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">خزان مُورد بنجاح</span>
              </div>
              <div className="p-3">
                <strong className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono">10</strong>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">سنوات ضمان شامل</span>
              </div>
              <div className="p-3">
                <strong className="block text-2xl sm:text-3xl font-black text-cyan-600 font-mono">100%</strong>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">أمان لمياه الشرب</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-slate-50/80 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-blue-600 uppercase mb-2 block">
              معايير الجودة العالمية
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">لماذا يختار عملاؤنا خزانات مميز؟</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              نهتم بأدق تفاصيل السلامة الهندسية والصحية لنوفر لك خزاناً يدوم طويلاً دون تغيير في طعم أو نقاء المياه.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "آمنة صحياً 100%",
                desc: "مصنوعة من حبيبات بلاستيك بولي إيثيلين نقية عذراء (Virgin Food-Grade) معتمدة دولياً ومحلياً لحفظ مياه الشرب والأغذية.",
                icon: "💧",
                highlight: "معتمد لمياه الشرب",
              },
              {
                title: "حماية متعددة الطبقات ضد الطحالب",
                desc: "طبقات متخصصة تمنع نفاذ الأشعة فوق البنفسجية UV تماماً، مما يمنع نمو البكتيريا والطحالب الخضراء نهائياً داخل الخزان.",
                icon: "🛡️",
                highlight: "عزل كامل للأشعة",
              },
              {
                title: "ضمان استبدال حقيقي 10 سنوات",
                desc: "نثق في كفاءة خطوط إنتاجنا وخاماتنا عالية الكثافة، لذلك نقدم شهادة ضمان استبدال معتمدة ضد أي عيوب تصنيع.",
                icon: "⭐",
                highlight: "شهادة ضمان موثقة",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-7 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-3xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50/70 px-2.5 py-1 rounded-md mb-3">
                  {feature.highlight}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section id="products" className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-blue-600 uppercase mb-2 block">
              الأحجام والمواصفات الفنية
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">كتالوج المنتجات</h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
              نوفر جميع السعات المناسبة للاستخدامات المختلفة، من الوحدات السكنية وحتى المزارع والمشروعات الصناعية الكبرى مع إمكانية تصنيع مواصفات خاصة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`relative bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  product.popular
                    ? "border-blue-500 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {product.popular && (
                  <span className="absolute -top-3.5 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                    الأكثر مبيعاً
                  </span>
                )}

                <div>
                  {/* Visual container */}
                  <div className="aspect-4/3 w-full bg-slate-50 rounded-xl mb-5 flex flex-col items-center justify-center p-4 border border-slate-100">
                    <span className="text-5xl mb-2">🛢️</span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {product.capacity}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-2">
                    {product.tag}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  {/* Specs list */}
                  <div className="space-y-1.5 py-3 border-t border-slate-100 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">طبقات العزل:</span>
                      <strong className="text-slate-700">{product.layers}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الاستخدام:</span>
                      <strong className="text-slate-700">{product.useCase}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الضمان:</span>
                      <strong className="text-emerald-600">{product.warranty}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-base sm:text-lg text-blue-700 font-black mb-4">
                    {product.price}
                  </div>
                  <Link
                    href="/quote"
                    className="block w-full py-2.5 px-4 text-center text-sm font-bold rounded-xl transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-95"
                  >
                    اطلب عرض سعر
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section (#about) */}
      <section id="about" className="py-16 sm:py-24 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                عن مصنع مميز
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-snug">
                رواد تصنيع خزانات البولي إيثيلين بأحدث المواصفات الهندسية والصحية
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                انطلق مصنع مميز برؤية واضحة تهدف إلى رفع معايير سلامة حفظ مياه الشرب في مصر والشرق الأوسط. نستخدم أحدث أفران وماكينات القولبة الدورانية الآلية بالكامل لضمان انتظام سماكة جدار الخزان وتماسك طبقاته دون أي نقاط ضعف أو لحامات.
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                يخضع كل خزان يخرج من خطوط إنتاجنا لفحوصات ضغط واختبارات سلامة كيميائية صارمة قبل تسليمه للعميل، مما جعلنا الاختيار الأول لكبرى شركات المقاولات، المشروعات القومية، والمستهلكين في كافة أنحاء الجمهورية.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <span className="text-2xl mb-1 block">🔬</span>
                  <strong className="block text-sm font-bold text-white mb-1">فحص مخبري دوري</strong>
                  <span className="text-xs text-slate-400">مطابقة خامات البولي إيثيلين للأمان الصحي</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <span className="text-2xl mb-1 block">🚚</span>
                  <strong className="block text-sm font-bold text-white mb-1">أسطول توزيع متكامل</strong>
                  <span className="text-xs text-slate-400">توصيل سريع لكافة مواقع ومحافظات مصر</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 space-y-6">
              <h3 className="text-xl font-bold text-cyan-300 border-b border-slate-700 pb-3">
                ركائز التصنيع والجودة لدينا
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-base">✓</span>
                  <div>
                    <strong className="text-white block">تقنية القولبة الدورانية قطعة واحدة (Rotomolding):</strong>
                    خزان مصبوب بالكامل بدون فواصل أو لحامات، مما يمنع حدوث أي تسريب نهائياً تحت أي ضغط.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-base">✓</span>
                  <div>
                    <strong className="text-white block">الطبقة البيضاء الملساء الداخلية:</strong>
                    طبقة فائقة النعومة تمنع التصاق الشوائب وتسهل عملية الغسيل والتعقيم الدوري بكل سهولة.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-base">✓</span>
                  <div>
                    <strong className="text-white block">الطبقة السوداء المانعة لأشعة الشمس:</strong>
                    عازل كربوني يمنع مرور الضوء تماماً إلى داخل الخزان لمنع تكوّن الفطريات والطحالب.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-base">✓</span>
                  <div>
                    <strong className="text-white block">إدارة متكاملة بأحدث الأنظمة الرقمية:</strong>
                    متابعة دقيقة لكل أمر شغل ومراقبة مخزون الخامات لضمان استقرار الجودة والتسليم في الموعد.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6">
            جاهز لتأمين احتياجات مشروعك أو منزلك من المياه؟
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            فريق المبيعات والدعم الفني لدينا مستعد لتقديم الاستشارات الفنية وحساب السعات المناسبة وتوفير أفضل عروض الأسعار والخصومات للكميات.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/quote"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold rounded-full text-blue-900 bg-white hover:bg-slate-100 shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              اطلب عرض سعر مخصص
            </Link>
            <a
              href="tel:01000000000"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold rounded-full text-white border-2 border-white/40 hover:bg-white/10 transition-all active:scale-95"
            >
              اتصال هاتفي مباشر
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
