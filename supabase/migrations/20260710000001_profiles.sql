-- Phase 0: profiles (user-owned, RLS owner-only) + auto-create on first sign-in.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  target_exam_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner can select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert a profiles row when a new auth user is created (first magic-link sign-in).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: cover any user who signed in before this migration ran.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
