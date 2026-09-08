"use client";

import { useActionState, useEffect, useRef } from "react";
import { loginAction, type LoginState } from "./actions";
import { ar } from "@/lib/i18n/ar";

const initialState: LoginState = undefined;

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email on first load
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <form action={action} noValidate className="space-y-5" id="login-form">
      {/* General error banner */}
      {state?.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          {ar.auth.email}
          <span className="text-red-500 mr-1" aria-hidden="true">
            *
          </span>
        </label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          aria-describedby={
            state?.fieldErrors?.email ? "email-error" : undefined
          }
          aria-invalid={!!state?.fieldErrors?.email}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-400 aria-invalid:ring-red-200"
          placeholder="you@example.com"
        />
        {state?.fieldErrors?.email && (
          <p id="email-error" className="text-xs text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          {ar.auth.password}
          <span className="text-red-500 mr-1" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          aria-describedby={
            state?.fieldErrors?.password ? "password-error" : undefined
          }
          aria-invalid={!!state?.fieldErrors?.password}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-400 aria-invalid:ring-red-200"
          placeholder="••••••••"
        />
        {state?.fieldErrors?.password && (
          <p id="password-error" className="text-xs text-red-600">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        id="login-submit"
        type="submit"
        disabled={pending}
        className="relative w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {ar.auth.loggingIn}
          </span>
        ) : (
          ar.auth.loginButton
        )}
      </button>
    </form>
  );
}
