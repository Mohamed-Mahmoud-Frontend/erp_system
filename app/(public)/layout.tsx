import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import PublicHeader from "./public-header";
import BrandLogo from "../(dashboard)/brand-logo";

export const metadata: Metadata = {
  title: {
    template: "%s | مميز",
    default: "مميز | مصنع خزانات المياه وحلول التخزين المتطورة",
  },
  description:
    "مصنع متخصص في تصنيع خزانات المياه البولي إيثيلين بجميع الأحجام والمواصفات المعتمدة صحياً. نخدم المقاولين والتجار والأفراد في جميع أنحاء مصر بضمان حقيقي 10 سنوات.",
  icons: {
    icon: "/LOGOMOMAYAZ.png",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
        {/* Responsive Mobile-Ready Header */}
        <PublicHeader />

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="sm:col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="inline-block" aria-label="مميز">
                <BrandLogo eager className="h-10 w-auto brightness-200" />
              </Link>
              <p className="text-sm leading-relaxed text-slate-400">
                مصنع مميز لتصنيع خزانات مياه الشرب البولي إيثيلين متعددة الطبقات بأعلى معايير الأمان الصحي والجودة العالمية.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ضمان 10 سنوات
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  معتمد صحياً
                </span>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-blue-500" />
                روابط سريعة
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">الرئيسية</Link></li>
                <li><Link href="/#products" className="text-slate-400 hover:text-white transition-colors">كتالوج الخزانات</Link></li>
                <li><Link href="/#about" className="text-slate-400 hover:text-white transition-colors">عن المصنع وجودة التصنيع</Link></li>
                <li><Link href="/quote" className="text-slate-400 hover:text-white transition-colors">طلب عرض سعر مباشر</Link></li>
              </ul>
            </div>

            {/* Factory Portal */}
            <div>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-cyan-400" />
                فريق العمل والإدارة
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors font-medium">
                    <span>تسجيل دخول الموظفين</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">ERP</span>
                  </Link>
                </li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">مساحة عمل لوحة التحكم</Link></li>
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">إدارة المخزون والمبيعات</Link></li>
              </ul>
            </div>

            {/* Contact details */}
            <div>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
                تواصل مع المصنع
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-400 mt-0.5">📍</span>
                  <span>المنطقة الصناعية، جمهورية مصر العربية</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-400">📞</span>
                  <a href="tel:01000000000" dir="ltr" className="hover:text-blue-300 transition-colors font-mono font-bold">
                    01000000000
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-400">✉️</span>
                  <span dir="ltr" className="font-mono text-xs">info@polymer-factory.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} شركة ومصنع مميز · جميع الحقوق محفوظة.</p>
            <p dir="ltr" className="tracking-wider text-slate-400 font-mono text-[11px]">SMART SOLUTIONS FOR A BRIGHTER TOMORROW</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
