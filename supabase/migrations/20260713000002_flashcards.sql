-- Phase 7: dedicated flashcards — authored term→concept cards, separate from the multiple-choice
-- questions, with their own spaced-repetition schedule. Content table (like questions/taxonomy):
-- readable by any authenticated user, written via the service role from the import pipeline.
--
-- Manual apply step (this repo can't run migrations from here; MCP writes + *.supabase.co egress
-- are blocked in web sessions): paste this into the Supabase SQL editor, same as prior migrations.
-- The UI degrades gracefully until then — /review just shows question-derived cards, and grading
-- of dedicated cards is a best-effort no-op.

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,        -- e.g. 'fc-anes-0001'
  taxonomy_id uuid references public.taxonomy (id),
  front text not null,              -- prompt / term
  back text not null,               -- concept / definition
  status text not null,             -- 'draft' | 'review' | 'approved' | 'live'
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index flashcards_taxonomy_idx on public.flashcards (taxonomy_id);

alter table public.flashcards enable row level security;

create policy "flashcards: authenticated can read"
  on public.flashcards for select
  to authenticated
  using (true);

-- SM-2 schedule per (user, flashcard), mirroring review_schedule for questions.
create table public.flashcard_schedule (
  user_id uuid not null references public.profiles (id) on delete cascade,
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  ease real not null default 2.5,
  interval_days int not null default 0,
  due_at timestamptz not null default now(),
  last_result text,
  updated_at timestamptz not null default now(),
  primary key (user_id, flashcard_id)
);

create index flashcard_schedule_user_due_idx on public.flashcard_schedule (user_id, due_at);

alter table public.flashcard_schedule enable row level security;

create policy "flashcard_schedule: owner can select"
  on public.flashcard_schedule for select using (auth.uid() = user_id);
create policy "flashcard_schedule: owner can insert"
  on public.flashcard_schedule for insert with check (auth.uid() = user_id);
create policy "flashcard_schedule: owner can update"
  on public.flashcard_schedule for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "flashcard_schedule: owner can delete"
  on public.flashcard_schedule for delete using (auth.uid() = user_id);
