'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import UiIcon from './ui-icon';
import BrandLogo from './brand-logo';

export type NavItem = {href: string; label: string; group: string; icon: string};

export default function DashboardShell({children, links, email, signOut}: {
  children: React.ReactNode; links: NavItem[]; email: string; signOut: React.ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const current = links.filter(link => pathname === link.href ||
    (link.href !== '/dashboard' && pathname.startsWith(link.href + '/')))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const visibleLinks = links.filter(link => link.label.includes(query.trim()) || link.group.includes(query.trim()));

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (window.matchMedia('(max-width: 767px)').matches) {
          dialogRef.current?.showModal();
          dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
        } else searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  function closeMenu() {
    dialogRef.current?.close();
    setQuery('');
  }

  const navigation = <nav aria-label="القائمة الرئيسية">
    {Array.from(new Set(visibleLinks.map(link => link.group))).map(group =>
      <div className="nav-group" key={group}>
        <p className="nav-caption">{group}</p>
        {visibleLinks.filter(link => link.group === group).map(link =>
          <Link onClick={closeMenu} href={link.href} key={link.href} className="nav-item"
            aria-current={current?.href === link.href ? 'page' : undefined}>
            <UiIcon name={link.icon}/><span>{link.label}</span>
            {current?.href === link.href && <span className="nav-dot"/>}
          </Link>)}
      </div>)}
    {visibleLinks.length === 0 && <p className="nav-no-results" role="status">لا يوجد قسم بهذا الاسم.</p>}
  </nav>;

  return <div className="erp-shell">
    <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
    <aside className="erp-sidebar">
      <Link href="/dashboard" className="erp-brand">
        <BrandLogo eager />
        <span className="brand-caption">نظام إدارة المصنع</span>
      </Link>
      <label className="nav-search"><UiIcon name="search"/>
        <input ref={searchRef} aria-label="بحث في الأقسام" placeholder="ابحث عن قسم…" value={query} onChange={e => setQuery(e.target.value)}/>
        <kbd dir="ltr">⌘ K</kbd>
      </label>
      <div className="sidebar-navigation">{navigation}</div>
      <div className="sidebar-note"><span className="status-dot"/>مساحة عمل المصنع<small>كل تفاصيل العمل، في مكان واحد</small></div>
    </aside>
    <div className="erp-workspace">
      <header className="erp-topbar">
        <div className="topbar-title">
          <button ref={menuRef} type="button" className="mobile-menu" aria-haspopup="dialog" aria-controls="mobile-navigation"
            aria-label="فتح القائمة" onClick={() => dialogRef.current?.showModal()}><UiIcon name="menu"/></button>
          <Link className="topbar-brand" href="/dashboard" aria-label="مميز · لوحة التحكم"><BrandLogo eager /></Link>
          <span className="topbar-breadcrumb"><Link href="/dashboard">مساحة العمل</Link><span>/</span><strong>{current?.label || 'تفاصيل القسم'}</strong></span>
        </div>
        <div className="topbar-account">
          <Link href="/dashboard/account" className="account-link" aria-label="إعدادات حسابي">
            <span className="account-avatar">{email.slice(0, 1).toUpperCase()}</span>
            <span className="account-email" dir="ltr">{email}</span>
          </Link>{signOut}
        </div>
      </header>
      <dialog ref={dialogRef} id="mobile-navigation" className="mobile-navigation" aria-labelledby="mobile-nav-title"
        onClose={() => {setQuery(''); menuRef.current?.focus();}}
        onClick={event => {if (event.target === event.currentTarget) closeMenu();}}>
        <div className="mobile-nav-panel">
          <div className="mobile-nav-heading"><div><BrandLogo /><span id="mobile-nav-title" className="sr-only">مميز · أقسام النظام</span></div><button type="button" onClick={closeMenu} aria-label="إغلاق القائمة"><UiIcon name="close"/></button></div>
          <label className="nav-search"><UiIcon name="search"/><input aria-label="بحث في أقسام الموبايل" placeholder="ابحث عن قسم…" value={query} onChange={e => setQuery(e.target.value)}/></label>
          {navigation}
        </div>
      </dialog>
      <main id="main-content" tabIndex={-1} className="erp-content">
        {!pathname.startsWith('/dashboard/delivery-notes/') && <div className="workspace-print-brand"><BrandLogo eager /><span>مميز · إدارة المصنع</span></div>}
        {children}
      </main>
      <footer className="erp-footer"><div className="footer-brand"><BrandLogo /><span>مميز · حلول أذكى لإدارة أعمالك</span></div><span className="brand-motto" dir="ltr">SMART SOLUTIONS FOR A BRIGHTER TOMORROW</span></footer>
    </div>
  </div>;
}
