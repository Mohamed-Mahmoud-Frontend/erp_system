-- Keep current_date used by billing RPCs consistent with the Cairo dates shown
-- in statements, including calls between Cairo midnight and UTC midnight.
ALTER FUNCTION public.create_invoice_atomic(uuid,numeric,integer) SET timezone TO 'Africa/Cairo';
ALTER FUNCTION public.record_payment_atomic(uuid,numeric,text,date) SET timezone TO 'Africa/Cairo';
