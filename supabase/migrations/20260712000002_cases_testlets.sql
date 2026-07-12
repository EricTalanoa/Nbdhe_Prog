-- Phase 5a: cases + testlets parent tables + case media, plus the FKs from `questions`
-- that content_stubs.sql deferred until these tables existed.
--
-- Content tables (like taxonomy/questions/options/rationales): RLS on, readable by any
-- authenticated user, no client write policy — writes go through the service role via
-- scripts/import-questions.mjs, same as the Phase 1 content pipeline.
--
-- Manual apply step (this repo can't run `supabase db push` from here): apply this file's
-- SQL against the live Supabase project via the SQL editor, same as the taxonomy/sessions
-- migrations before it.

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,        -- e.g. 'case-perio-0001'
  title text not null,
  patient_box jsonb not null,       -- { demographics, chief_complaint, background_history, current_findings }
  patient_type text,                -- 'adult' | 'pediatric' | 'geriatric' | 'special_needs' | 'medically_compromised'
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testlets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,        -- e.g. 'testlet-comm-0001'
  title text not null,
  scenario text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.case_media (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  kind text not null,               -- 'chart' | 'radiograph' | 'photo'
  storage_path text not null,       -- path within the (to-be-created) Supabase Storage bucket
  caption text,
  source text,                      -- attribution/provenance, per authoring guidelines
  sort_order int not null default 0
);

-- content_stubs.sql left these as bare uuid columns because cases/testlets didn't exist
-- yet; wire the real FKs now that they do. Existing rows are all null, so this is safe.
alter table public.questions
  add constraint questions_case_id_fkey foreign key (case_id) references public.cases (id);
alter table public.questions
  add constraint questions_testlet_id_fkey foreign key (testlet_id) references public.testlets (id);

alter table public.cases enable row level security;
alter table public.testlets enable row level security;
alter table public.case_media enable row level security;

create policy "cases: authenticated can read"
  on public.cases for select
  to authenticated
  using (true);

create policy "testlets: authenticated can read"
  on public.testlets for select
  to authenticated
  using (true);

create policy "case_media: authenticated can read"
  on public.case_media for select
  to authenticated
  using (true);
