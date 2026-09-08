import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الرئيسية",
};

const products = [
  {
    id: 1,
    name: "خزان 500 لتر",
    description: "مثالي للاستخدام المنزلي الصغير، متوفر بـ 3 طبقات أو 4 طبقات حماية.",
    price: "يبدأ من 2,500 ج.م",
  },
  {
    id: 2,
    name: "خزان 1000 لتر",
    description: "الأكثر مبيعاً للفلل والبيوت السكنية، حماية فائقة من أشعة الشمس والبكتيريا.",
    price: "يبدأ من 4,200 ج.م",
  },
  {
    id: 3,
    name: "خزان 2000 لتر",
    description: "مناسب للعمارات السكنية والمشاريع التجارية الصغيرة.",
    price: "يبدأ من 7,800 ج.م",
  },
  {
    id: 4,
    name: "خزان 5000 لتر",
    description: "سعة ضخمة مخصصة للمصانع، المزارع، والمقاولات الكبيرة.",
    price: "يبدأ من 18,500 ج.م",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              خزانات مياه تعيش معاك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">العمر كله</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              نصنع خزانات البولي إيثيلين بأعلى معايير الجودة العالمية. أمان تام لمياه الشرب، حماية من الطحالب، وعزل كامل للحرارة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1"
              >
                اطلب عرض سعر الآن
              </Link>
              <Link
                href="#products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                تصفح المنتجات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900">لماذا تختار خزاناتنا؟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "آمنة صحياً 100%",
                desc: "مصنوعة من بلاستيك نقي (Virgin) مصرح به دولياً لحفظ مياه الشرب والأغذية.",
                icon: "💧",
              },
              {
                title: "حماية متعددة الطبقات",
                desc: "طبقات متخصصة لمنع نمو البكتيريا والطحالب، وعزل كامل لأشعة الشمس الضارة.",
                icon: "🛡️",
              },
              {
                title: "ضمان 10 سنوات",
                desc: "نثق في جودة منتجاتنا، لذلك نقدم ضماناً استبدالاً حقيقياً ضد أي عيوب صناعة.",
                icon: "⭐",
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">كتالوج المنتجات</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              نوفر جميع الأحجام التي تناسب احتياجاتك، من الاستخدام المنزلي البسيط وحتى المشاريع الصناعية العملاقة.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group relative bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="aspect-square w-full bg-slate-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                  <div className="text-6xl">🛢️</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{product.name}</h3>
                <p className="text-sm text-slate-600 mb-4 h-16">{product.description}</p>
                <div className="text-blue-700 font-black mb-6">
                  {product.price}
                </div>
                <Link
                  href="/quote"
                  className="block w-full py-3 px-4 bg-white border-2 border-slate-200 rounded-xl text-center font-bold text-slate-700 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  اطلب الآن
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-blue-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-700 via-blue-900 to-slate-900" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-black text-white mb-6">جاهز لتأمين احتياجاتك من المياه؟</h2>
          <p className="text-xl text-blue-100 mb-10">
            فريق المبيعات لدينا مستعد للإجابة على جميع استفساراتك وتقديم أفضل عروض الأسعار.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full text-blue-900 bg-white hover:bg-slate-50 shadow-xl transition-transform transform hover:-translate-y-1"
          >
            اطلب عرض سعر مخصص
          </Link>
        </div>
      </section>
    </div>
  );
}
