-- Phase 0: empty content-table stubs (taxonomy, questions, options, rationales).
-- No seed data yet. RLS on from day one: authenticated users can read; there are
-- deliberately NO client write policies — writes happen via the service role
-- (which bypasses RLS) until an admin role is introduced.

create table public.taxonomy (
  id uuid primary key default gen_random_uuid(),
  spec_version text not null,       -- 'after_update_2026' | 'prior'
  component text not null,          -- 'discipline' | 'case'
  area text not null,
  domain text,
  subdomain text,
  score_area text not null,         -- one of the 13 reporting areas (+ 'case')
  sort_order int not null default 0
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,        -- e.g. 'q-anat-0001'
  taxonomy_id uuid not null references public.taxonomy (id),
  format text not null,             -- 'completion' | 'question' | 'negative'
  stem text not null,
  difficulty text not null,         -- 'easy' | 'medium' | 'hard'
  status text not null default 'draft', -- 'draft' | 'review' | 'approved' | 'live'
  case_id uuid,                     -- fk added in Phase 5 when cases table exists
  testlet_id uuid,                  -- fk added in Phase 5 when testlets table exists
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  label text not null,              -- 'A'..'E'
  body text not null,
  is_correct boolean not null default false,
  distractor_rationale text,        -- null for the correct option
  sort_order int not null default 0
);

-- 1:1 with question; separate so it can be withheld in exam mode / lazy-loaded.
create table public.rationales (
  question_id uuid primary key references public.questions (id) on delete cascade,
  correct_explanation text not null
);

alter table public.taxonomy enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.rationales enable row level security;

create policy "taxonomy: authenticated can read"
  on public.taxonomy for select
  to authenticated
  using (true);

create policy "questions: authenticated can read"
  on public.questions for select
  to authenticated
  using (true);

create policy "options: authenticated can read"
  on public.options for select
  to authenticated
  using (true);

create policy "rationales: authenticated can read"
  on public.rationales for select
  to authenticated
  using (true);
