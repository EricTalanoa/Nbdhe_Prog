-- Phase 7a: review tools — spaced-repetition schedule + question error reports.
-- Owner-only RLS like the other user tables (user_id = auth.uid()).
--
-- Manual apply step (this repo can't run migrations from here; MCP writes + *.supabase.co
-- egress are blocked in web sessions): paste this into the Supabase SQL editor, same as the
-- taxonomy / sessions / cases migrations before it. The UI degrades gracefully until then —
-- /review treats every card as new and grading/reporting are best-effort no-ops.

create table public.review_schedule (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  ease real not null default 2.5,          -- SM-2-style ease factor (min 1.3)
  interval_days int not null default 0,    -- current spacing; 0 = brand new / relearning
  due_at timestamptz not null default now(),
  last_result text,                        -- 'again' | 'hard' | 'good' | 'easy'
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index review_schedule_user_due_idx on public.review_schedule (user_id, due_at);

alter table public.review_schedule enable row level security;

create policy "review_schedule: owner can select"
  on public.review_schedule for select using (auth.uid() = user_id);
create policy "review_schedule: owner can insert"
  on public.review_schedule for insert with check (auth.uid() = user_id);
create policy "review_schedule: owner can update"
  on public.review_schedule for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review_schedule: owner can delete"
  on public.review_schedule for delete using (auth.uid() = user_id);

create table public.question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  reason text not null,                    -- 'wrong_answer' | 'typo' | 'ambiguous' | 'other'
  note text,
  status text not null default 'open',     -- 'open' | 'reviewed' | 'resolved'
  created_at timestamptz not null default now()
);

create index question_reports_user_idx on public.question_reports (user_id);
create index question_reports_question_idx on public.question_reports (question_id);

alter table public.question_reports enable row level security;

create policy "question_reports: owner can select"
  on public.question_reports for select using (auth.uid() = user_id);
create policy "question_reports: owner can insert"
  on public.question_reports for insert with check (auth.uid() = user_id);
