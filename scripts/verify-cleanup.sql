-- Read-only proof of the Batch 1 cleanup. Never infer a delete target from
-- invoice amount alone; the live test used a unique Batch1-<UUID> client name.
SELECT jsonb_build_object(
  'checked_at', now(),
  'existing_invoice_numbers', (SELECT jsonb_agg(invoice_number ORDER BY invoice_number) FROM public.invoices),
  'invoice_0003_exists', EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number='INV-2026-0003'),
  'counter_2026', (SELECT last_value FROM public.invoice_sequences WHERE year=2026),
  'batch1_clients', (SELECT count(*) FROM public.clients WHERE name LIKE 'Batch1-%'),
  'batch1_orders', (SELECT count(*) FROM public.orders o JOIN public.clients c ON c.id=o.client_id WHERE c.name LIKE 'Batch1-%'),
  'batch1_invoices', (SELECT count(*) FROM public.invoices i JOIN public.orders o ON o.id=i.order_id JOIN public.clients c ON c.id=o.client_id WHERE c.name LIKE 'Batch1-%'),
  'batch1_payments', (SELECT count(*) FROM public.payments p JOIN public.invoices i ON i.id=p.invoice_id JOIN public.orders o ON o.id=i.order_id JOIN public.clients c ON c.id=o.client_id WHERE c.name LIKE 'Batch1-%'),
  'batch1_movements', (SELECT count(*) FROM public.material_movements m JOIN public.orders o ON o.id=m.order_id JOIN public.clients c ON c.id=o.client_id WHERE c.name LIKE 'Batch1-%'),
  'batch1_quotes', (SELECT count(*) FROM public.quotations WHERE guest_name LIKE 'Batch1-%' OR details LIKE 'Batch1-%'),
  'orphan_payments', (SELECT count(*) FROM public.payments p LEFT JOIN public.invoices i ON i.id=p.invoice_id WHERE i.id IS NULL),
  'orphan_cheques', (SELECT count(*) FROM public.cheques c LEFT JOIN public.payments p ON p.id=c.payment_id WHERE p.id IS NULL),
  'orphan_invoices', (SELECT count(*) FROM public.invoices i LEFT JOIN public.orders o ON o.id=i.order_id WHERE o.id IS NULL),
  'orphan_orders', (SELECT count(*) FROM public.orders o LEFT JOIN public.clients c ON c.id=o.client_id WHERE c.id IS NULL),
  'orphan_movements', (SELECT count(*) FROM public.material_movements m LEFT JOIN public.orders o ON o.id=m.order_id WHERE m.order_id IS NOT NULL AND o.id IS NULL)
) AS cleanup_verification;
