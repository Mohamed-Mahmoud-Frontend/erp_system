SELECT 'duplicate_invoices' AS check_name, coalesce(jsonb_agg(d),'[]') AS result FROM (
  SELECT order_id,count(*) AS invoice_count FROM public.invoices GROUP BY order_id HAVING count(*)>1
) d
UNION ALL
SELECT 'order_statuses',coalesce(jsonb_agg(s),'[]') FROM (
  SELECT status,count(*) AS order_count FROM public.orders GROUP BY status ORDER BY status
) s;
