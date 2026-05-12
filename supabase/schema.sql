-- Streak Lab schema. Run this whole file in the Supabase SQL editor.
-- Idempotent-ish: safe to run twice while iterating.

------------------------------------------------------------
-- Extensions
------------------------------------------------------------
create extension if not exists pgcrypto;

------------------------------------------------------------
-- Tables
------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'sparkles',
  color text not null default '#7c5cff',
  goal int,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  link text,
  created_at timestamptz not null default now(),
  -- local_date is provided by the client (user's local YYYY-MM-DD) so streaks line up
  -- with the user's actual day rather than UTC.
  local_date date not null
);

create index if not exists entries_user_date_idx on public.entries(user_id, local_date desc);
create index if not exists entries_category_idx on public.entries(category_id, created_at desc);
create index if not exists entries_recent_idx on public.entries(created_at desc);

------------------------------------------------------------
-- Signup lock: cap auth.users at 2.
-- Runs before auth.users insert. If 2 users already exist, blocks.
------------------------------------------------------------
create or replace function public.enforce_user_cap()
returns trigger
language plpgsql
security definer
as $$
declare
  current_count int;
begin
  select count(*) into current_count from auth.users;
  if current_count >= 2 then
    raise exception 'Signups are closed: this app is locked to 2 users.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_user_cap_trigger on auth.users;
create trigger enforce_user_cap_trigger
  before insert on auth.users
  for each row execute function public.enforce_user_cap();

------------------------------------------------------------
-- Profile auto-creation on signup
------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------
-- RLS: both authenticated users can read everything (shared accountability).
-- Writes are scoped to the owner.
------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.entries enable row level security;

drop policy if exists "profiles read for authed" on public.profiles;
create policy "profiles read for authed"
  on public.profiles for select
  to authenticated using (true);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "categories read for authed" on public.categories;
create policy "categories read for authed"
  on public.categories for select
  to authenticated using (true);

drop policy if exists "categories insert authed" on public.categories;
create policy "categories insert authed"
  on public.categories for insert
  to authenticated with check (auth.uid() = created_by);

drop policy if exists "categories update authed" on public.categories;
create policy "categories update authed"
  on public.categories for update
  to authenticated using (true) with check (true);

drop policy if exists "categories delete authed" on public.categories;
create policy "categories delete authed"
  on public.categories for delete
  to authenticated using (true);

drop policy if exists "entries read for authed" on public.entries;
create policy "entries read for authed"
  on public.entries for select
  to authenticated using (true);

drop policy if exists "entries insert own" on public.entries;
create policy "entries insert own"
  on public.entries for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "entries update own" on public.entries;
create policy "entries update own"
  on public.entries for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "entries delete own" on public.entries;
create policy "entries delete own"
  on public.entries for delete
  to authenticated using (auth.uid() = user_id);

------------------------------------------------------------
-- Shared documentation (singleton row, edited by both users).
-- Intentionally NOT added to the realtime publication: saves are explicit.
------------------------------------------------------------
create table if not exists public.shared_doc (
  id int primary key default 1,
  content text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint shared_doc_singleton check (id = 1)
);

insert into public.shared_doc (id, content) values (1, '') on conflict (id) do nothing;

alter table public.shared_doc enable row level security;

drop policy if exists "shared_doc read authed" on public.shared_doc;
create policy "shared_doc read authed"
  on public.shared_doc for select
  to authenticated using (true);

drop policy if exists "shared_doc update authed" on public.shared_doc;
create policy "shared_doc update authed"
  on public.shared_doc for update
  to authenticated using (true) with check (true);

------------------------------------------------------------
-- Chat messages between the two users.
-- Page only displays the last 30 days; older rows stay in the table.
------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_recent_idx on public.chat_messages(created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages read authed" on public.chat_messages;
create policy "chat_messages read authed"
  on public.chat_messages for select
  to authenticated using (true);

drop policy if exists "chat_messages insert own" on public.chat_messages;
create policy "chat_messages insert own"
  on public.chat_messages for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "chat_messages delete own" on public.chat_messages;
create policy "chat_messages delete own"
  on public.chat_messages for delete
  to authenticated using (auth.uid() = user_id);

------------------------------------------------------------
-- Realtime: publish the three tables
------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end$$;

do $$
declare
  t text;
begin
  foreach t in array array['entries', 'categories', 'profiles']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end$$;
