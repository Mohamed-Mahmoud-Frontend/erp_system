import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { redirect } from "next/navigation";
import "../globals.css";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import { signOutAction } from "./actions";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | لوحة التحكم",
    default: "لوحة التحكم",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noarchive: true },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard — verify session on every dashboard render.
  // The proxy is an optimistic first line; this is the secure second line.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          {/* ── Top navigation bar ── */}
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {ar.appName}
                </span>
              </div>

              {/* Nav links — to be expanded in later steps */}
              <nav aria-label="القائمة الرئيسية" className="hidden md:flex items-center gap-1">
                <a
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {ar.nav.dashboard}
                </a>
                <a
                  href="/dashboard/clients"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {ar.nav.clients}
                </a>
                <a
                  href="/dashboard/invoices"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {ar.nav.invoices}
                </a>
                <a
                  href="/dashboard/orders"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  الطلبات
                </a>
                <a
                  href="/dashboard/quotations"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  عروض الأسعار
                </a>
                <a
                  href="/dashboard/materials"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {ar.nav.materials}
                </a>
                <a
                  href="/dashboard/workers"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {ar.nav.workers}
                </a>
              </nav>

              {/* User info + sign-out */}
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-gray-500 sm:block" dir="ltr">
                  {user.email}
                </span>
                <form action={signOutAction}>
                  <button
                    id="sign-out-button"
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {ar.auth.logout}
                  </button>
                </form>
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
