'use client';
import Link from 'next/link';
import UiIcon from '../ui-icon';
import BrandLogo from '../brand-logo';
export default function DashboardError({retry}: {retry: () => void}) {
  return <section className="workspace-state" role="alert">
    <BrandLogo className="state-logo" />
    <span className="state-symbol"><UiIcon name="clock"/></span>
    <h1>تعذر تحميل هذه الصفحة</h1>
    <p>قد تكون هناك مشكلة مؤقتة في الاتصال. أعد المحاولة لعرض أحدث البيانات.</p>
    <div className="state-actions"><button onClick={retry} type="button">إعادة المحاولة</button><Link href="/dashboard">العودة إلى لوحة التحكم</Link></div>
  </section>;
}
