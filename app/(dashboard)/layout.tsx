import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import '../globals.css';
import './brand.css';
import { createClient } from '@/lib/supabase/server';
import { getAccess, allowed, type Module } from '@/lib/access';
import SignOutForm from './sign-out-form';
import DashboardShell, { type NavItem } from './dashboard-shell';

export const metadata: Metadata = {
  title: { template: '%s | مميز', default: 'مميز | إدارة المصنع' },
  robots: { index: false, follow: false },
  icons: { icon: '/LOGOMOMAYAZ.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect('/login');

  let access: Awaited<ReturnType<typeof getAccess>>;
  try {
    access = await getAccess();
  } catch {
    return (
      <html lang="ar" dir="rtl">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        </head>
        <body>
          <main className="p-6">
            <p role="alert">تعذر التحقق من صلاحيات الحساب. لم تُعرض بيانات المصنع؛ أعد تحميل الصفحة.</p>
            <Link href="/dashboard">إعادة المحاولة</Link>
            <SignOutForm />
          </main>
        </body>
      </html>
    );
  }

  const sections: (NavItem & { permission: Module | 'admin' })[] = [
    { href: 'clients', label: 'العملاء', permission: 'sales', group: 'المبيعات والعملاء', icon: 'users' },
    { href: 'invoices', label: 'الفواتير', permission: 'sales', group: 'المبيعات والعملاء', icon: 'file' },
    { href: 'cheques', label: 'الشيكات', permission: 'sales', group: 'المبيعات والعملاء', icon: 'file' },
    { href: 'quotations', label: 'عروض الأسعار', permission: 'sales', group: 'المبيعات والعملاء', icon: 'file' },
    { href: 'materials', label: 'الخامات والمخزون', permission: 'production', group: 'المصنع والتشغيل', icon: 'box' },
    { href: 'product-specs', label: 'وصفات الإنتاج', permission: 'admin', group: 'المصنع والتشغيل', icon: 'factory' },
    { href: 'suppliers', label: 'الموردون', permission: 'suppliers', group: 'المصنع والتشغيل', icon: 'users' },
    { href: 'workers/attendance', label: 'الحضور والانصراف', permission: 'attendance', group: 'فريق العمل', icon: 'clock' },
    { href: 'workers', label: 'العمال والرواتب', permission: 'payroll', group: 'فريق العمل', icon: 'users' },
    { href: 'users', label: 'إدارة الصلاحيات', permission: 'admin', group: 'الإدارة', icon: 'settings' },
    { href: 'integrations', label: 'النسخ والمزامنة', permission: 'admin', group: 'الإدارة', icon: 'settings' },
  ];

  const links: NavItem[] = access?.active
    ? [
        { href: '/dashboard', label: 'نظرة عامة', group: 'الرئيسية', icon: 'grid' },
        ...(allowed(access, 'sales') || allowed(access, 'production')
          ? [{ href: '/dashboard/orders', label: 'أوامر التشغيل', group: 'الرئيسية', icon: 'factory' }]
          : []),
        ...(allowed(access, 'sales') || allowed(access, 'production')
          ? [{ href: '/dashboard/delivery-notes', label: 'أذونات التسليم', group: 'الرئيسية', icon: 'file' }]
          : []),
        ...sections.filter((l) => allowed(access, l.permission)).map((l) => ({ ...l, href: '/dashboard/' + l.href })),
        { href: '/dashboard/account', label: 'حسابي', group: 'الإدارة', icon: 'settings' },
      ]
    : [];

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="font-sans">
        <DashboardShell links={links} email={user.email || ''} signOut={<SignOutForm />}>
          {access?.active ? (
            children
          ) : (
            <p role="alert" className="p-6 text-red-700">
              الحساب غير مفعّل للنظام. اطلب من المدير إضافة صلاحياتك أو إعادة تفعيل الحساب.
            </p>
          )}
        </DashboardShell>
      </body>
    </html>
  );
}
