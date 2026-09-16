SELECT count(*) FILTER(WHERE type NOT IN ('invoice','payment') OR amount<=0 OR amount>='Infinity'::numeric) AS invalid_transactions,count(*) AS transactions FROM public.supplier_transactions;
SELECT count(*) AS suppliers FROM public.suppliers;
