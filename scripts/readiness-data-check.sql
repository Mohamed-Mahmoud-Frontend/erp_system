SET timezone='UTC';
SELECT jsonb_build_object(
 'suppliers_as_before', (SELECT jsonb_build_object('count',count(*),'md5',md5(coalesce(string_agg((to_jsonb(s)-'opening_balance')::text,E'\n' ORDER BY (to_jsonb(s)-'opening_balance')::text),''))) FROM public.supplier_balances s),
 'invoice_sequence_2026',(SELECT last_value FROM public.invoice_sequences WHERE year=2026),
 'invoice_total',(SELECT sum(total) FROM public.invoices),
 'invoice_balance',(SELECT sum(balance_due) FROM public.invoice_balances),
 'pending_sync_events',(SELECT count(*) FROM public.sync_events)
) AS verification;
