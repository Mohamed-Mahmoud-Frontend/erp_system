-- Migration: 0001_clients_and_orders.sql
-- Tables: clients, quotations, orders
-- Notes:
--   - factory_id is nullable now; will become NOT NULL in a future multi-tenant migration.
--   - All money/qty fields use NUMERIC to avoid floating-point precision issues.
--   - created_at defaults to now() in UTC; app layer displays in Egypt local time.

-- Enable pgcrypto for gen_random_uuid() if not already enabled
create extension if not exists "pgcrypto";

-- ── clients ────────────────────────────────────────────────────────────────
create table if not exists clients (
  id           uuid primary key default gen_random_uuid(),
  factory_id   uuid,
  name         text not null,
  type         text not null check (type in ('trader','contractor','individual','company','office')),
  price_tier   text,
  credit_days  int  not null default 0,
  phone        text,
  address      text,
  created_at   timestamptz not null default now()
);

comment on column clients.factory_id  is 'Reserved for multi-tenancy — nullable for single-factory MVP';
comment on column clients.type        is 'trader | contractor | individual | company | office';
comment on column clients.credit_days is 'Number of days the client is allowed to pay after invoicing';

-- ── quotations ─────────────────────────────────────────────────────────────
create table if not exists quotations (
  id                 uuid primary key default gen_random_uuid(),
  factory_id         uuid,
  client_id          uuid not null references clients(id) on delete restrict,
  status             text not null default 'draft'
                       check (status in ('draft','sent','approved','rejected')),
  pdf_url            text,
  converted_order_id uuid,               -- FK added after orders table exists (see below)
  created_at         timestamptz not null default now()
);

comment on column quotations.status             is 'draft | sent | approved | rejected';
comment on column quotations.converted_order_id is 'Set when quotation is converted to an order';

-- ── orders ─────────────────────────────────────────────────────────────────
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  factory_id    uuid,
  client_id     uuid not null references clients(id) on delete restrict,
  quotation_id  uuid references quotations(id) on delete set null,
  product_spec  jsonb not null default '{}',
  quantity      int  not null default 1 check (quantity > 0),
  status        text not null default 'pending'
                  check (status in ('pending','in_production','completed','cancelled')),
  created_at    timestamptz not null default now()
);

comment on column orders.product_spec is 'Free-form JSON spec for the tank (size, material, colour, etc.)';
comment on column orders.status       is 'pending | in_production | completed | cancelled';

-- Now add the self-referencing FK from quotations → orders
alter table quotations
  add constraint quotations_converted_order_id_fkey
  foreign key (converted_order_id) references orders(id) on delete set null;

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists clients_factory_id_idx    on clients(factory_id);
create index if not exists clients_type_idx          on clients(type);
create index if not exists quotations_client_id_idx  on quotations(client_id);
create index if not exists quotations_status_idx     on quotations(status);
create index if not exists orders_client_id_idx      on orders(client_id);
create index if not exists orders_status_idx         on orders(status);
