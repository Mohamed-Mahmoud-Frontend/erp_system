-- ARCHIVED HISTORICAL SNAPSHOT. DO NOT APPLY OR INITIALIZE A DATABASE WITH THIS FILE.
-- Only supabase/migrations/*.sql is authoritative. Retained as drift-audit evidence.
-- ============================================================
--  Water Tank Factory ERP — legacy base schema (0001 through 0005)
--  Use supabase/migrations for current installations and upgrades.
--  This historical snapshot does not include later RPCs or quotation sharing.
--  Order matters — don't reorder sections.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ===========================================================================
-- SECTION 1: clients, quotations, orders
-- ===========================================================================

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

create table if not exists quotations (
  id                 uuid primary key default gen_random_uuid(),
  factory_id         uuid,
  client_id          uuid not null references clients(id) on delete restrict,
  status             text not null default 'draft'
                       check (status in ('draft','sent','approved','rejected')),
  pdf_url            text,
  converted_order_id uuid,
  created_at         timestamptz not null default now()
);

comment on column quotations.status             is 'draft | sent | approved | rejected';
comment on column quotations.converted_order_id is 'Set when quotation is converted to an order';

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

-- Back-reference from quotations → orders (added after orders exists)
alter table quotations
  add constraint quotations_converted_order_id_fkey
  foreign key (converted_order_id) references orders(id) on delete set null;

create index if not exists clients_factory_id_idx   on clients(factory_id);
create index if not exists clients_type_idx         on clients(type);
create index if not exists quotations_client_id_idx on quotations(client_id);
create index if not exists quotations_status_idx    on quotations(status);
create index if not exists orders_client_id_idx     on orders(client_id);
create index if not exists orders_status_idx        on orders(status);


-- ===========================================================================
-- SECTION 2: invoices, payments, cheques
-- ===========================================================================

create table if not exists invoices (
  id             uuid    primary key default gen_random_uuid(),
  factory_id     uuid,
  order_id       uuid    not null references orders(id) on delete restrict,
  invoice_number text    not null unique,
  total          numeric not null check (total >= 0),
  balance_due    numeric not null check (balance_due >= 0),
  created_at     timestamptz not null default now()
);

comment on column invoices.invoice_number is 'Human-readable, e.g. INV-2024-0001 — unique per factory';
comment on column invoices.total          is 'Total invoice amount (exact decimal, never float)';
comment on column invoices.balance_due    is 'Remaining unpaid balance; updated when payments are recorded';

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

create index if not exists invoices_order_id_idx   on invoices(order_id);
create index if not exists invoices_factory_id_idx on invoices(factory_id);
create index if not exists payments_invoice_id_idx on payments(invoice_id);
create index if not exists payments_method_idx     on payments(method);
create index if not exists cheques_payment_id_idx  on cheques(payment_id);
create index if not exists cheques_status_idx      on cheques(status);
create index if not exists cheques_due_date_idx    on cheques(due_date);


-- ===========================================================================
-- SECTION 3: suppliers, supplier_transactions, materials, material_movements
-- ===========================================================================

create table if not exists suppliers (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  name        text    not null,
  balance     numeric not null default 0
);

comment on column suppliers.balance is 'Running balance owed to this supplier (exact decimal)';

create table if not exists supplier_transactions (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  supplier_id uuid    not null references suppliers(id) on delete restrict,
  type        text    not null,
  amount      numeric not null,
  created_at  timestamptz not null default now()
);

create table if not exists materials (
  id             uuid    primary key default gen_random_uuid(),
  factory_id     uuid,
  type           text    not null,
  stock_qty      numeric not null default 0 check (stock_qty >= 0),
  unit           text    not null check (unit in ('kg','ton')),
  min_threshold  numeric not null default 0 check (min_threshold >= 0)
);

comment on column materials.stock_qty     is 'Current stock level (exact decimal)';
comment on column materials.unit          is 'kg | ton';
comment on column materials.min_threshold is 'Low-stock alert fires when stock_qty drops below this';

create table if not exists material_movements (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  material_id uuid    not null references materials(id) on delete restrict,
  supplier_id uuid    references suppliers(id) on delete set null,
  order_id    uuid    references orders(id)    on delete set null,
  direction   text    not null check (direction in ('in','out')),
  is_return   boolean not null default false,
  qty         numeric not null check (qty > 0),
  created_at  timestamptz not null default now()
);

comment on column material_movements.direction is 'in = arriving; out = consumed';
comment on column material_movements.is_return is 'true = return movement (written off, does NOT restore stock)';

create index if not exists suppliers_factory_id_idx           on suppliers(factory_id);
create index if not exists supplier_transactions_supplier_idx on supplier_transactions(supplier_id);
create index if not exists materials_factory_id_idx           on materials(factory_id);
create index if not exists material_movements_material_idx    on material_movements(material_id);
create index if not exists material_movements_order_idx       on material_movements(order_id);
create index if not exists material_movements_direction_idx   on material_movements(direction);


-- ===========================================================================
-- SECTION 4: workers, attendance, worker_transactions
-- ===========================================================================

create table if not exists workers (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  name        text    not null,
  daily_wage  numeric not null check (daily_wage >= 0)
);

create table if not exists attendance (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  worker_id   uuid    not null references workers(id) on delete restrict,
  work_date   date    not null,
  status      text    not null check (status in ('present','absent','half_day','quarter_day')),
  extra_units numeric not null default 0 check (extra_units >= 0),
  unique (worker_id, work_date)
);

comment on column attendance.status      is 'present | absent | half_day | quarter_day';
comment on column attendance.extra_units is 'Extra production units completed today';

create table if not exists worker_transactions (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  worker_id   uuid    not null references workers(id) on delete restrict,
  type        text    not null check (type in ('advance','deduction','bonus')),
  amount      numeric not null check (amount > 0),
  created_at  timestamptz not null default now()
);

create index if not exists workers_factory_id_idx             on workers(factory_id);
create index if not exists attendance_worker_id_idx           on attendance(worker_id);
create index if not exists attendance_work_date_idx           on attendance(work_date);
create index if not exists worker_transactions_worker_id_idx  on worker_transactions(worker_id);
create index if not exists worker_transactions_created_at_idx on worker_transactions(created_at);


-- ===========================================================================
-- SECTION 5: Stock auto-decrement trigger
-- ===========================================================================
--
-- Rules (per project brief):
--   Normal out subtracts; normal in adds; returns never change usable stock.
--   This trigger is the only movement stock writer.

create or replace function decrement_material_stock()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if NEW.is_return then
    return NEW;
  elsif NEW.direction = 'out' then
    update materials
       set stock_qty = stock_qty - NEW.qty
     where id = NEW.material_id;

  elsif NEW.direction = 'in' then
    update materials
       set stock_qty = stock_qty + NEW.qty
     where id = NEW.material_id;
  end if;

  -- is_return=true: movement recorded, stock unchanged (written off)
  return NEW;
end;
$$;

create trigger trg_material_stock_auto_adjust
  after insert on material_movements
  for each row execute function decrement_material_stock();


-- ===========================================================================
-- SECTION 6: Row Level Security — all 13 tables
-- ===========================================================================
-- MVP policy: any authenticated user has full access.
-- To tighten later to per-factory: change USING(true) →
--   USING((auth.jwt() ->> 'factory_id')::uuid = factory_id)
-- No schema changes required.

alter table clients              enable row level security;
alter table quotations           enable row level security;
alter table orders               enable row level security;
alter table invoices             enable row level security;
alter table payments             enable row level security;
alter table cheques              enable row level security;
alter table suppliers            enable row level security;
alter table supplier_transactions enable row level security;
alter table materials            enable row level security;
alter table material_movements   enable row level security;
alter table workers              enable row level security;
alter table attendance           enable row level security;
alter table worker_transactions  enable row level security;

create policy "authenticated_full_access_clients"
  on clients for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_quotations"
  on quotations for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_orders"
  on orders for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_invoices"
  on invoices for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_payments"
  on payments for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_cheques"
  on cheques for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_suppliers"
  on suppliers for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_supplier_transactions"
  on supplier_transactions for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_materials"
  on materials for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_material_movements"
  on material_movements for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_workers"
  on workers for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_attendance"
  on attendance for all to authenticated using (true) with check (true);

create policy "authenticated_full_access_worker_transactions"
  on worker_transactions for all to authenticated using (true) with check (true);
