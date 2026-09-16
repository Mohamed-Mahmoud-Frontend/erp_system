-- Catalog audit: live public schema had 11 comment differences and one
-- missing non-unique index. No column/type/default/nullability/constraint/RLS
-- discrepancy was found. This migration never changes or deletes row data.

-- Record the six existing live descriptions as the canonical wording.
COMMENT ON COLUMN public.attendance.extra_units IS 'Extra production units completed today';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Human-readable, e.g. INV-2024-0001 — unique per factory';
COMMENT ON COLUMN public.material_movements.direction IS 'in = arriving; out = consumed';
COMMENT ON COLUMN public.material_movements.is_return IS 'true = return movement (written off, does NOT restore stock)';
COMMENT ON COLUMN public.materials.min_threshold IS 'Low-stock alert fires when stock_qty drops below this';
COMMENT ON COLUMN public.materials.stock_qty IS 'Current stock level (exact decimal)';

-- Restore five descriptions already required by 0003/0004 but missing live.
COMMENT ON COLUMN public.material_movements.qty IS 'Quantity moved (always positive; direction determines sign)';
COMMENT ON COLUMN public.supplier_transactions.type IS 'Freeform — e.g. purchase, payment, return, adjustment';
COMMENT ON COLUMN public.worker_transactions.amount IS 'Always positive; direction is determined by type';
COMMENT ON COLUMN public.worker_transactions.type IS 'advance | deduction | bonus';
COMMENT ON COLUMN public.workers.daily_wage IS 'Base daily wage in EGP (exact decimal)';

-- 0004 declares this index; legacy schema_full.sql omitted it.
CREATE INDEX IF NOT EXISTS worker_transactions_type_idx
  ON public.worker_transactions USING btree (type);
