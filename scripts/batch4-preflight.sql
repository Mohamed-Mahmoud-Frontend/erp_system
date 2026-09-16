SELECT 'workers' AS item,count(*) AS total FROM public.workers
UNION ALL SELECT 'attendance',count(*) FROM public.attendance
UNION ALL SELECT 'invalid_transaction_types',count(*) FROM public.worker_transactions WHERE type NOT IN ('advance','deduction','bonus')
UNION ALL SELECT 'nonfinite_wages',count(*) FROM public.workers WHERE daily_wage>='Infinity'::numeric;
