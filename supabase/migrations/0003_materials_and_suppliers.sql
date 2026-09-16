-- Migration: 0003_materials_and_suppliers.sql
-- Tables: suppliers, supplier_transactions, materials, material_movements
-- Notes:
--   - suppliers created before materials so material_movements can FK to both.
--   - stock_qty uses NUMERIC to allow fractional kg/ton values.
--   - The INSERT trigger below is the only stock adjustment mechanism.

-- ── suppliers ──────────────────────────────────────────────────────────────
create table if not exists suppliers (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  name        text    not null,
  balance     numeric not null default 0
);

comment on column suppliers.balance is 'Running balance owed to this supplier (exact decimal)';

-- ── supplier_transactions ─────────────────────────────────────────────────
create table if not exists supplier_transactions (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  supplier_id uuid    not null references suppliers(id) on delete restrict,
  type        text    not null,
  amount      numeric not null,
  created_at  timestamptz not null default now()
);

comment on column supplier_transactions.type is 'Freeform — e.g. purchase, payment, return, adjustment';

-- ── materials ─────────────────────────────────────────────────────────────
create table if not exists materials (
  id             uuid    primary key default gen_random_uuid(),
  factory_id     uuid,
  type           text    not null,
  stock_qty      numeric not null default 0 check (stock_qty >= 0),
  unit           text    not null check (unit in ('kg','ton')),
  min_threshold  numeric not null default 0 check (min_threshold >= 0)
);

comment on column materials.stock_qty     is 'Current stock level (exact decimal, never float)';
comment on column materials.unit          is 'kg | ton';
comment on column materials.min_threshold is 'Triggers low-stock alert / n8n webhook when stock_qty drops below this';

-- ── material_movements ────────────────────────────────────────────────────
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

comment on column material_movements.direction is 'in = stock arriving; out = stock consumed';
comment on column material_movements.is_return is 'true = this is a return movement (written off, does NOT restore stock_qty)';
comment on column material_movements.qty       is 'Quantity moved (always positive; direction determines sign)';

-- ── Indexes ──────────────────────────────────────────────────────────────
create index if not exists suppliers_factory_id_idx            on suppliers(factory_id);
create index if not exists supplier_transactions_supplier_idx  on supplier_transactions(supplier_id);
create index if not exists materials_factory_id_idx            on materials(factory_id);
create index if not exists material_movements_material_idx     on material_movements(material_id);
create index if not exists material_movements_order_idx        on material_movements(order_id);
create index if not exists material_movements_direction_idx    on material_movements(direction);

-- ── Stock auto-decrement trigger ──────────────────────────────────────────
--
-- Rule (confirmed in project brief):
--   Normal out movements decrement stock, normal in movements increment stock.
--   Returns in either direction leave usable stock unchanged (written off).
--
-- The trigger runs in the same transaction as the INSERT, so the decrement
-- is atomic with the movement record.

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
    -- Consume stock: deduct from materials
    update materials
       set stock_qty = stock_qty - NEW.qty
     where id = NEW.material_id;

    -- Guard: stock_qty has a CHECK (stock_qty >= 0) on the table,
    -- so Postgres will raise an error automatically if we go negative.
    -- No extra check needed here.

  elsif NEW.direction = 'in' then
    -- Receive stock: add to materials
    update materials
       set stock_qty = stock_qty + NEW.qty
     where id = NEW.material_id;
  end if;

  -- is_return=true rows are recorded but don't touch stock_qty (written off).
  return NEW;
end;
$$;

create trigger trg_material_stock_auto_adjust
  after insert on material_movements
  for each row execute function decrement_material_stock();

comment on function decrement_material_stock() is
  'Automatically adjusts materials.stock_qty when a material_movement is inserted.
   Normal out decrements; normal in increments.
   Returns in either direction leave usable stock unchanged.';
