-- Tournament Manager — Supabase schema
-- Run this once in your Supabase project's SQL editor (Database -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Teams: filled in by the public registration form
-- ---------------------------------------------------------------------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  captain_name text not null,
  captain_phone text not null,
  captain_email text,
  player_count int,
  players text,                 -- free-text list of player names, one per line
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'partial', 'paid')),
  notes text,
  registered_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Transactions: money collected, logged by the admin
-- ---------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete set null,
  payer_name text not null,       -- who gave the money
  amount numeric(10, 2) not null check (amount > 0),
  collected_by text not null,     -- who received/collected it
  mode text not null default 'cash'
    check (mode in ('cash', 'upi', 'bank_transfer', 'other')),
  txn_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Expenditures: money spent, logged by the admin
-- ---------------------------------------------------------------------
create table if not exists expenditures (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  category text not null default 'other'
    check (category in ('ground', 'referee', 'trophy', 'equipment', 'refreshments', 'medical', 'printing', 'other')),
  amount numeric(10, 2) not null check (amount > 0),
  paid_by text not null,
  exp_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Public (anon) visitors may only INSERT a team registration.
-- Everything else (viewing teams, all transaction/expenditure access)
-- requires an authenticated admin session.
-- ---------------------------------------------------------------------
alter table teams enable row level security;
alter table transactions enable row level security;
alter table expenditures enable row level security;

create policy "anyone can register a team" on teams
  for insert to anon
  with check (true);

create policy "admin can view teams" on teams
  for select to authenticated
  using (true);

create policy "admin can update teams" on teams
  for update to authenticated
  using (true) with check (true);

create policy "admin can delete teams" on teams
  for delete to authenticated
  using (true);

create policy "admin manages transactions" on transactions
  for all to authenticated
  using (true) with check (true);

create policy "admin manages expenditures" on expenditures
  for all to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- Next step (do this in the Supabase dashboard, not SQL):
-- Authentication -> Users -> Add user -> create one admin login
-- (email + password). That's the only account that can sign in to /#/admin.
-- ---------------------------------------------------------------------
