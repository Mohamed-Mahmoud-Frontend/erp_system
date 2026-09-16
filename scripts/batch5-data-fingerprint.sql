-- Read-only fingerprints; no business row contents or personal data exported.
SELECT 'workers' AS entity,count(*) AS rows,md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) AS fingerprint FROM public.workers t
UNION ALL SELECT 'attendance',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) FROM public.attendance t
UNION ALL SELECT 'worker_transactions',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) FROM public.worker_transactions t
UNION ALL SELECT 'worker_payouts',count(*),md5(coalesce(string_agg((to_jsonb(t)-'voided_at'-'voided_reason')::text,'' ORDER BY id),'')) FROM public.worker_payouts t
UNION ALL SELECT 'sales_returns',count(*),md5(coalesce(string_agg((to_jsonb(t)-'voided_at'-'voided_reason')::text,'' ORDER BY id),'')) FROM public.sales_returns t
UNION ALL SELECT 'invoices',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) FROM public.invoices t
UNION ALL SELECT 'invoice_balances',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) FROM public.invoice_balances t
UNION ALL SELECT 'materials',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) FROM public.materials t
UNION ALL SELECT 'material_movements',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY id),'')) FROM public.material_movements t
UNION ALL SELECT 'invoice_sequences',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY year),'')) FROM public.invoice_sequences t;
