"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "../(dashboard)/brand-logo";

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group" aria-label="مميز · الرئيسية">
              <BrandLogo eager className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="تنقل الموقع">
            <Link
              href="/"
              className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors py-2"
            >
              الرئيسية
            </Link>
            <Link
              href="/#products"
              className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors py-2"
            >
              منتجاتنا
            </Link>
            <Link
              href="/#about"
              className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors py-2"
            >
              من نحن
            </Link>
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2"
            >
              دخول الموظفين
            </Link>

            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all transform active:scale-95"
            >
              طلب عرض سعر
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة الرئيسية"}
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Content */}
      {isOpen && (
        <div
          className="fixed inset-0 top-20 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-20 bg-white border-b border-slate-200 shadow-xl z-50 md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-5 pt-4 pb-6 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span>الرئيسية</span>
              <svg className="w-5 h-5 text-slate-400 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/#products"
              onClick={closeMenu}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span>منتجاتنا ومواصفاتها</span>
              <svg className="w-5 h-5 text-slate-400 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/#about"
              onClick={closeMenu}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span>عن مصنع مميز</span>
              <svg className="w-5 h-5 text-slate-400 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/login"
              onClick={closeMenu}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                دخول موظفي المصنع
              </span>
              <svg className="w-5 h-5 text-slate-400 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/quote"
              onClick={closeMenu}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md active:scale-98 transition-all"
            >
              طلب عرض سعر مباشر
            </Link>

            <a
              href="tel:01000000000"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span>اتصل بنا: 01000000000</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
