import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Link from "next/link";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | مصنع البوليمر لخزانات المياه",
    default: "مصنع البوليمر لخزانات المياه — جودة وثقة",
  },
  description:
    "مصنع متخصص في تصنيع خزانات المياه بجميع الأحجام والمواصفات. نخدم المقاولين والتجار والأفراد في جميع أنحاء مصر.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-black text-blue-700 tracking-tight">
                  مصنع <span className="text-blue-500">البوليمر</span>
                </Link>
              </div>
              <nav className="hidden md:flex gap-8">
                <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  الرئيسية
                </Link>
                <Link href="/#products" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  منتجاتنا
                </Link>
                <Link href="/#about" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  من نحن
                </Link>
              </nav>
              <div className="flex gap-4 items-center">
                <Link
                  href="/login"
                  className="hidden md:inline-flex text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  طلب عرض سعر
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">مصنع البوليمر</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                رواد صناعة خزانات المياه البلاستيكية عالية الجودة. نضمن لك المتانة والعمر الطويل بأفضل الأسعار التنافسية.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">الرئيسية</Link></li>
                <li><Link href="/quote" className="hover:text-blue-400 transition-colors">طلب عرض سعر</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">تسجيل دخول الموظفين</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>المنطقة الصناعية، القاهرة، مصر</li>
                <li>هاتف: 01000000000</li>
                <li>بريد إلكتروني: info@polymer-factory.com</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
            &copy; {new Date().getFullYear()} مصنع البوليمر لخزانات المياه. جميع الحقوق محفوظة.
          </div>
        </footer>
      </body>
    </html>
  );
}
