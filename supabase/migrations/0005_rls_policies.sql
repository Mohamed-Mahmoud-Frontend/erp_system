-- Migration: 0005_rls_policies.sql
-- Enable Row Level Security on every business table.
-- MVP policy: any authenticated user can read and write all rows.
--
-- The policy is structured so that tightening to per-factory access requires
-- only changing the USING / WITH CHECK expression to:
--   (auth.jwt() ->> 'factory_id')::uuid = factory_id
-- — no table or column restructuring needed.

-- Helper: all policies check auth.uid() IS NOT NULL (= "must be authenticated")
-- and use "for all" to cover SELECT / INSERT / UPDATE / DELETE in one rule.

-- ── clients ───────────────────────────────────────────────────────────────
alter table clients enable row level security;

create policy "authenticated_full_access_clients"
  on clients
  for all
  to authenticated
  using (true)
  with check (true);

-- ── quotations ────────────────────────────────────────────────────────────
alter table quotations enable row level security;

create policy "authenticated_full_access_quotations"
  on quotations
  for all
  to authenticated
  using (true)
  with check (true);

-- ── orders ────────────────────────────────────────────────────────────────
alter table orders enable row level security;

create policy "authenticated_full_access_orders"
  on orders
  for all
  to authenticated
  using (true)
  with check (true);

-- ── invoices ──────────────────────────────────────────────────────────────
alter table invoices enable row level security;

create policy "authenticated_full_access_invoices"
  on invoices
  for all
  to authenticated
  using (true)
  with check (true);

-- ── payments ──────────────────────────────────────────────────────────────
alter table payments enable row level security;

create policy "authenticated_full_access_payments"
  on payments
  for all
  to authenticated
  using (true)
  with check (true);

-- ── cheques ───────────────────────────────────────────────────────────────
alter table cheques enable row level security;

create policy "authenticated_full_access_cheques"
  on cheques
  for all
  to authenticated
  using (true)
  with check (true);

-- ── suppliers ─────────────────────────────────────────────────────────────
alter table suppliers enable row level security;

create policy "authenticated_full_access_suppliers"
  on suppliers
  for all
  to authenticated
  using (true)
  with check (true);

-- ── supplier_transactions ─────────────────────────────────────────────────
alter table supplier_transactions enable row level security;

create policy "authenticated_full_access_supplier_transactions"
  on supplier_transactions
  for all
  to authenticated
  using (true)
  with check (true);

-- ── materials ─────────────────────────────────────────────────────────────
alter table materials enable row level security;

create policy "authenticated_full_access_materials"
  on materials
  for all
  to authenticated
  using (true)
  with check (true);

-- ── material_movements ────────────────────────────────────────────────────
alter table material_movements enable row level security;

create policy "authenticated_full_access_material_movements"
  on material_movements
  for all
  to authenticated
  using (true)
  with check (true);

-- ── workers ───────────────────────────────────────────────────────────────
alter table workers enable row level security;

create policy "authenticated_full_access_workers"
  on workers
  for all
  to authenticated
  using (true)
  with check (true);

-- ── attendance ────────────────────────────────────────────────────────────
alter table attendance enable row level security;

create policy "authenticated_full_access_attendance"
  on attendance
  for all
  to authenticated
  using (true)
  with check (true);

-- ── worker_transactions ───────────────────────────────────────────────────
alter table worker_transactions enable row level security;

create policy "authenticated_full_access_worker_transactions"
  on worker_transactions
  for all
  to authenticated
  using (true)
  with check (true);
