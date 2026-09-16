export default function DashboardLoading() {
  return <div className="workspace-loading" role="status" aria-label="جاري تحميل القسم">
    <span className="sr-only">جاري تحميل أحدث البيانات…</span>
    <div className="loading-bar loading-title"/><div className="loading-bar loading-subtitle"/>
    <div className="loading-cards">{[1,2,3].map(n => <div className="loading-card" key={n}/>)}</div>
    <div className="loading-table">{[1,2,3,4,5].map(n => <div className="loading-bar" key={n}/>)}</div>
  </div>;
}
