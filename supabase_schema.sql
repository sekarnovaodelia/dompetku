-- ============================================
-- DompetKu - Supabase Database Schema
-- Copy & paste ini ke Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Tabel: profiles (Data User Tambahan)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-buat profile saat user baru register
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. Tabel: fund_sources (Sumber Dana)
-- ============================================
create table fund_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  icon text default 'account_balance_wallet',
  balance numeric default 0,
  created_at timestamptz default now()
);

-- ============================================
-- 3. Tabel: transactions (Transaksi)
-- ============================================
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric not null,
  type text check (type in ('pemasukan', 'pengeluaran')) not null,
  fund_source_id uuid references fund_sources(id) on delete set null,
  date date not null default current_date,
  time time not null default current_time,
  note text,
  synced boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- 4. Tabel: debts (Piutang)
-- ============================================
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  person_name text not null,
  amount numeric not null,
  note text,
  date date not null default current_date,
  is_paid boolean default false,
  paid_at timestamptz,
  synced boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- 5. Aktifkan Row Level Security (RLS)
-- ============================================
alter table profiles enable row level security;
alter table fund_sources enable row level security;
alter table transactions enable row level security;
alter table debts enable row level security;

-- ============================================
-- 6. RLS Policies
-- ============================================

-- Profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Fund Sources
create policy "Users can view own fund_sources"
  on fund_sources for select
  using (auth.uid() = user_id);

create policy "Users can insert own fund_sources"
  on fund_sources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own fund_sources"
  on fund_sources for update
  using (auth.uid() = user_id);

create policy "Users can delete own fund_sources"
  on fund_sources for delete
  using (auth.uid() = user_id);

-- Transactions
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Debts
create policy "Users can view own debts"
  on debts for select
  using (auth.uid() = user_id);

create policy "Users can insert own debts"
  on debts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own debts"
  on debts for update
  using (auth.uid() = user_id);

create policy "Users can delete own debts"
  on debts for delete
  using (auth.uid() = user_id);
