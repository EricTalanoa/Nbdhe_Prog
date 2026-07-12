-- Phase 2b: sessions, responses, bookmarks (user-owned, RLS owner-only).
-- Persists the /practice study-mode flow: one session per practice set, one response row
-- per answered question, plus a flag/note bookmark per (user, question).

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,                -- 'practice' | 'timed' | 'mock' | 'review_missed' | 'review_flagged' | 'case'
  config jsonb not null default '{}'::jsonb,  -- areas/subdomains chosen, N, timer, difficulty
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score_summary jsonb                -- overall + per-score-area, set on finish
);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_option_id uuid references public.options (id),  -- null if skipped
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  time_ms int
);

create table public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  flagged boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index sessions_user_id_idx on public.sessions (user_id);
create index responses_session_id_idx on public.responses (session_id);
create index responses_user_id_idx on public.responses (user_id);
create index responses_question_id_idx on public.responses (question_id);
create index bookmarks_user_id_idx on public.bookmarks (user_id);

alter table public.sessions enable row level security;
alter table public.responses enable row level security;
alter table public.bookmarks enable row level security;

create policy "sessions: owner can select"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions: owner can insert"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions: owner can update"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "responses: owner can select"
  on public.responses for select
  using (auth.uid() = user_id);

create policy "responses: owner can insert"
  on public.responses for insert
  with check (auth.uid() = user_id);

create policy "bookmarks: owner can select"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "bookmarks: owner can insert"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "bookmarks: owner can update"
  on public.bookmarks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "bookmarks: owner can delete"
  on public.bookmarks for delete
  using (auth.uid() = user_id);
