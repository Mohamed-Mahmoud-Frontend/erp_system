-- Migration: 0002_invoices_and_payments.sql
-- Tables: invoices, payments, cheques
-- Notes:
--   - All monetary values are NUMERIC (exact decimal), never FLOAT.
--   - invoice_number has a UNIQUE constraint for idempotency.
--   - balance_due is maintained by application logic / triggers (added later).

-- ── invoices ───────────────────────────────────────────────────────────────
create table if not exists invoices (
  id             uuid    primary key default gen_random_uuid(),
  factory_id     uuid,
  order_id       uuid    not null references orders(id) on delete restrict,
  invoice_number text    not null unique,
  total          numeric not null check (total >= 0),
  balance_due    numeric not null check (balance_due >= 0),
  created_at     timestamptz not null default now()
);

comment on column invoices.invoice_number is 'Human-readable number, e.g. INV-2024-0001 — unique per factory';
comment on column invoices.total          is 'Total invoice amount (exact decimal, never float)';
comment on column invoices.balance_due    is 'Remaining unpaid balance; updated when payments are recorded';

-- ── payments ───────────────────────────────────────────────────────────────
create table if not exists payments (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  invoice_id  uuid    not null references invoices(id) on delete restrict,
  method      text    not null check (method in ('cash','transfer','cheque')),
  amount      numeric not null check (amount > 0),
  paid_at     date    not null,
  created_at  timestamptz not null default now()
);

comment on column payments.method  is 'cash | transfer | cheque';
comment on column payments.paid_at is 'Date the payment was physically received (stored as DATE, UTC)';

-- ── cheques ────────────────────────────────────────────────────────────────
create table if not exists cheques (
  id          uuid primary key default gen_random_uuid(),
  factory_id  uuid,
  payment_id  uuid not null references payments(id) on delete restrict,
  due_date    date not null,
  status      text not null default 'pending'
                check (status in ('pending','cleared','bounced'))
);

comment on column cheques.status   is 'pending | cleared | bounced';
comment on column cheques.due_date is 'Date the cheque is due to be deposited/cleared';

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists invoices_order_id_idx      on invoices(order_id);
create index if not exists invoices_factory_id_idx    on invoices(factory_id);
create index if not exists payments_invoice_id_idx    on payments(invoice_id);
create index if not exists payments_method_idx        on payments(method);
create index if not exists cheques_payment_id_idx     on cheques(payment_id);
create index if not exists cheques_status_idx         on cheques(status);
create index if not exists cheques_due_date_idx       on cheques(due_date);
