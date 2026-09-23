import Link from 'next/link';
import { getAccess, allowed } from '@/lib/access';
import { createClient } from '@/lib/supabase/server';
import UiIcon from '../ui-icon';
import TankScene from '../../tank-scene';
import DashboardCharts, { type OrderStats, type InvoiceStats } from './dashboard-charts';

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const access = await getAccess();
  const params = await searchParams;
  if (!access?.active) return <p role="alert">لا توجد صلاحيات فعالة لهذا الحساب.</p>;

  const db = await createClient();

  const [materialsRes, quotesRes, ordersRes, invoicesRes] = await Promise.all([
    allowed(access, 'production') ? db.from('materials').select('*') : Promise.resolve(null),
    allowed(access, 'sales') ? db.from('quotations').select('*').eq('status', 'draft').order('created_at', { ascending: false }).limit(5) : Promise.resolve(null),
    (allowed(access, 'production') || allowed(access, 'sales')) ? db.from('orders').select('id, status') : Promise.resolve(null),
    allowed(access, 'sales') ? db.from('invoice_balances').select('total, paid_amount, balance_due, due_date') : Promise.resolve(null),
  ]);

  const materials = materialsRes;
  const quotes = quotesRes;
  const low = materials?.data?.filter((m) => m.stock_qty <= m.min_threshold);

  // Compute Order Stats for Charts
  let orderStats: OrderStats | null = null;
  if (ordersRes?.data) {
    const orders = ordersRes.data;
    orderStats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      in_production: orders.filter((o) => o.status === 'in_production').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };
  }

  // Compute Invoice Stats for Charts
  let invoiceStats: InvoiceStats | null = null;
  if (invoicesRes?.data) {
    const inv = invoicesRes.data;
    const now = new Date();
    invoiceStats = {
      totalCount: inv.length,
      totalAmount: inv.reduce((sum, i) => sum + (Number(i.total) || 0), 0),
      paidAmount: inv.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0),
      balanceDue: inv.reduce((sum, i) => sum + Math.max(0, Number(i.balance_due) || 0), 0),
      paidCount: inv.filter((i) => Number(i.balance_due) <= 0).length,
      overdueCount: inv.filter((i) => Number(i.balance_due) > 0 && i.due_date && new Date(i.due_date) < now).length,
      pendingCount: inv.filter((i) => Number(i.balance_due) > 0).length,
    };
  }

  const shortcuts = [
    { href: 'delivery-notes/new', label: 'إذن تسليم جديد', description: 'جهّز الأصناف وأصدر إذن التسليم', icon: 'file', show: allowed(access, 'sales') || allowed(access, 'production') },
    { href: 'orders/new', label: 'أمر تشغيل جديد', description: 'ابدأ طلبًا وحدد تفاصيل الإنتاج', icon: 'factory', show: allowed(access, 'sales') || allowed(access, 'production') },
    { href: 'clients/new', label: 'إضافة عميل', description: 'سجّل بيانات عميلك الجديد', icon: 'users', show: allowed(access, 'sales') },
    { href: 'materials/movements/new', label: 'حركة مخزون', description: 'تابع الوارد والمنصرف من الخامات', icon: 'box', show: allowed(access, 'production') },
    { href: 'workers/attendance', label: 'تسجيل الحضور', description: 'تابع حضور فريق العمل اليوم', icon: 'clock', show: allowed(access, 'attendance') },
  ].filter((s) => s.show);

  return (
    <div className="dashboard-home w-full max-w-full min-w-0">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">مساحة عملك اليومية</p>
          <h1>نظرة عامة على المصنع</h1>
          <p>تابع تفاصيل الإنتاج، المخزون، والماليات من مكان واحد.</p>
        </div>
        <span className="date-chip"><UiIcon name="clock" />
          {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full', timeZone: 'Africa/Cairo' }).format(new Date())}
        </span>
      </div>

      {params.denied && (
        <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
          ليست لديك صلاحية الوصول إلى هذا القسم.
        </p>
      )}

      {/* Welcome Banner */}
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="welcome-tag">
            <span className="status-dot" />
            لوحة إدارة المصنع
          </span>
          <h2>كل تفاصيل مصنعك.<br /><span>في إيدك.</span></h2>
          <p>من طلب العميل إلى حركة المخزون، وصول أسرع لأقسامك ومتابعة أبسط لأعمالك.</p>
          <Link href="/dashboard/account" className="welcome-link">
            إدارة حسابك <UiIcon name="arrow" />
          </Link>
        </div>
        <div className="welcome-art"><TankScene /></div>
      </section>

      {access.role === 'employee' && access.permissions.length === 0 && (
        <p className="surface-card p-6">لم يحدد المدير أقسامًا لحسابك بعد.</p>
      )}

      {/* Top Metrics Cards */}
      <div className="metric-grid">
        {materials && (
          <>
            <div className="metric-card">
              <span className="metric-icon"><UiIcon name="box" /></span>
              <p>أصناف الخامات</p>
              <strong>{materials.error ? '—' : materials.data?.length ?? 0}</strong>
              <small>الأصناف المسجلة بالمخزون</small>
            </div>
            <div className="metric-card">
              <span className="metric-icon amber"><UiIcon name="clock" /></span>
              <p>تحتاج متابعة</p>
              <strong>{materials.error ? '—' : low?.length ?? 0}</strong>
              <small>خامات عند الحد الأدنى أو أقل</small>
            </div>
          </>
        )}
        {quotes && (
          <div className="metric-card">
            <span className="metric-icon"><UiIcon name="file" /></span>
            <p>أحدث عروض الأسعار</p>
            <strong>{quotes.error ? '—' : quotes.data.length}</strong>
            <small>آخر ٥ طلبات في حالة مسودة</small>
          </div>
        )}
        {orderStats && (
          <div className="metric-card">
            <span className="metric-icon"><UiIcon name="factory" /></span>
            <p>أوامر التشغيل</p>
            <strong>{orderStats.total}</strong>
            <small>{orderStats.in_production} قيد التشغيل حالياً</small>
          </div>
        )}
      </div>

      {/* Interactive Charts Section */}
      <DashboardCharts
        orderStats={orderStats}
        materialStats={materials?.data}
        invoiceStats={invoiceStats}
      />

      {/* Quick Shortcuts */}
      {shortcuts.length > 0 && (
        <section>
          <div className="section-heading">
            <h2>إجراءات سريعة</h2>
            <span>ابدأ من هنا</span>
          </div>
          <div className="shortcut-grid">
            {shortcuts.map((s) => (
              <Link className="shortcut-card" key={s.href} href={'/dashboard/' + s.href}>
                <span className="shortcut-icon"><UiIcon name={s.icon} /></span>
                <div>
                  <strong>{s.label}</strong>
                  <p>{s.description}</p>
                </div>
                <UiIcon name="arrow" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Overview Cards */}
      <div className="overview-grid">
        {materials && (
          <section className="surface-card">
            <div className="section-heading">
              <h2>متابعة المخزون</h2>
              <span className="soft-badge">الخامات</span>
            </div>
            {materials.error ? (
              <p role="alert" className="text-red-700">تعذر تحميل ملخص المخزون. أعد المحاولة.</p>
            ) : low?.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><UiIcon name="check" /></span>
                <h3>المخزون بوضع جيد</h3>
                <p>لا توجد خامات عند الحد الأدنى حسب الأرصدة المسجلة.</p>
              </div>
            ) : (
              <div className="overview-list">
                {low?.map((m) => (
                  <div className="overview-row" key={m.id}>
                    <span>
                      <strong>{m.type}</strong>
                      <small>الحد الأدنى: {m.min_threshold} {m.unit}</small>
                    </span>
                    <span className="stock-warning">{m.stock_qty} {m.unit}</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/materials" className="section-link">
              عرض المخزون بالكامل <UiIcon name="arrow" />
            </Link>
          </section>
        )}

        {quotes && (
          <section className="surface-card">
            <div className="section-heading">
              <h2>طلبات عروض الأسعار</h2>
              <span className="soft-badge">الأحدث</span>
            </div>
            {quotes.error ? (
              <p role="alert" className="text-red-700">تعذر تحميل عروض الأسعار. أعد المحاولة.</p>
            ) : quotes.data.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><UiIcon name="file" /></span>
                <h3>لا توجد طلبات جديدة</h3>
                <p>ستظهر أحدث مسودات عروض الأسعار هنا.</p>
              </div>
            ) : (
              <div className="overview-list">
                {quotes.data.map((q) => (
                  <div className="overview-row" key={q.id}>
                    <span>
                      <strong>طلب <bdi>{q.id.slice(0, 8)}</bdi></strong>
                      <small>بانتظار متابعة عرض السعر</small>
                    </span>
                    <span className="soft-badge">مسودة</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/quotations" className="section-link">
              كل عروض الأسعار <UiIcon name="arrow" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
