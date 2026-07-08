-- Organizador Pessoal — schema inicial
-- Tabelas com RLS por usuário: cada pessoa só enxerga os próprios dados.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  context text not null default 'pessoal' check (context in ('pessoal', 'profissional')),
  reminder_minutes integer check (reminder_minutes is null or reminder_minutes > 0),
  reminded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null default '',
  context text not null default 'pessoal' check (context in ('pessoal', 'profissional')),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color_index integer not null default 1 check (color_index between 1 and 8),
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.expense_categories (id) on delete set null,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  context text not null default 'pessoal' check (context in ('pessoal', 'profissional')),
  payment_method text,
  created_at timestamptz not null default now()
);

create index events_user_starts_idx on public.events (user_id, starts_at);
create index notes_user_updated_idx on public.notes (user_id, updated_at desc);
create index expenses_user_date_idx on public.expenses (user_id, date desc);
create index expense_categories_user_idx on public.expense_categories (user_id);

alter table public.events enable row level security;
alter table public.notes enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;

create policy "events_select_own" on public.events
  for select using ((select auth.uid()) = user_id);
create policy "events_insert_own" on public.events
  for insert with check ((select auth.uid()) = user_id);
create policy "events_update_own" on public.events
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "events_delete_own" on public.events
  for delete using ((select auth.uid()) = user_id);

create policy "notes_select_own" on public.notes
  for select using ((select auth.uid()) = user_id);
create policy "notes_insert_own" on public.notes
  for insert with check ((select auth.uid()) = user_id);
create policy "notes_update_own" on public.notes
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "notes_delete_own" on public.notes
  for delete using ((select auth.uid()) = user_id);

create policy "expense_categories_select_own" on public.expense_categories
  for select using ((select auth.uid()) = user_id);
create policy "expense_categories_insert_own" on public.expense_categories
  for insert with check ((select auth.uid()) = user_id);
create policy "expense_categories_update_own" on public.expense_categories
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expense_categories_delete_own" on public.expense_categories
  for delete using ((select auth.uid()) = user_id);

create policy "expenses_select_own" on public.expenses
  for select using ((select auth.uid()) = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert with check ((select auth.uid()) = user_id);
create policy "expenses_update_own" on public.expenses
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete using ((select auth.uid()) = user_id);
