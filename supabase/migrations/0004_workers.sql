-- Migration: 0004_workers.sql
-- Tables: workers, attendance, worker_transactions

-- ── workers ───────────────────────────────────────────────────────────────
create table if not exists workers (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  name        text    not null,
  daily_wage  numeric not null check (daily_wage >= 0)
);

comment on column workers.daily_wage is 'Base daily wage in EGP (exact decimal)';

-- ── attendance ────────────────────────────────────────────────────────────
create table if not exists attendance (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  worker_id   uuid    not null references workers(id) on delete restrict,
  work_date   date    not null,
  status      text    not null check (status in ('present','absent','half_day','quarter_day')),
  extra_units numeric not null default 0 check (extra_units >= 0),

  -- One attendance record per worker per day
  unique (worker_id, work_date)
);

comment on column attendance.status      is 'present | absent | half_day | quarter_day';
comment on column attendance.extra_units is 'Number of extra production units completed (added to daily earnings)';

-- ── worker_transactions ───────────────────────────────────────────────────
create table if not exists worker_transactions (
  id          uuid    primary key default gen_random_uuid(),
  factory_id  uuid,
  worker_id   uuid    not null references workers(id) on delete restrict,
  type        text    not null check (type in ('advance','deduction','bonus')),
  amount      numeric not null check (amount > 0),
  created_at  timestamptz not null default now()
);

comment on column worker_transactions.type   is 'advance | deduction | bonus';
comment on column worker_transactions.amount is 'Always positive; direction is determined by type';

-- ── Indexes ──────────────────────────────────────────────────────────────
create index if not exists workers_factory_id_idx              on workers(factory_id);
create index if not exists attendance_worker_id_idx            on attendance(worker_id);
create index if not exists attendance_work_date_idx            on attendance(work_date);
create index if not exists worker_transactions_worker_id_idx   on worker_transactions(worker_id);
create index if not exists worker_transactions_type_idx        on worker_transactions(type);
create index if not exists worker_transactions_created_at_idx  on worker_transactions(created_at);
