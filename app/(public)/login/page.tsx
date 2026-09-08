import type { Metadata } from "next";
import { ar } from "@/lib/i18n/ar";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: ar.auth.login,
  // Login page is NOT indexed — exclude it from search engines
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
          {/* Header strip */}
          <div className="bg-gradient-to-l from-blue-600 to-blue-800 px-8 py-6">
            <div className="flex items-center gap-3">
              {/* Factory icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6 text-white"
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
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  {ar.appName}
                </h1>
                <p className="text-xs text-blue-200 mt-0.5">
                  {ar.nav.dashboard}
                </p>
              </div>
            </div>
          </div>

          {/* Form area */}
          <div className="px-8 py-7">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              {ar.auth.login}
            </h2>
            <LoginForm />
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-gray-500">
          نظام داخلي مخصص للموظفين المصرح لهم فقط
        </p>
      </div>
    </main>
  );
}
