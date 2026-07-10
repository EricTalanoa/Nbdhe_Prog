# Schema — Supabase (Postgres)

Design notes for Claude Code. All user-owned rows get **Row-Level Security** so a user only sees
their own data. Content tables (questions, taxonomy, cases) are readable by any authenticated user
and writable only by an admin role.

## Content tables

### taxonomy
Seeded from `01-Planning/blueprint-mapping.md`. Self-referential tree.
```
id            uuid pk
spec_version  text        -- 'after_update_2026' | 'prior'
component     text        -- 'discipline' | 'case'
area          text        -- e.g. 'Provision of Clinical Dental Hygiene Services'
domain        text        -- e.g. 'Periodontal Disease Management' (nullable for area rows)
subdomain     text        -- e.g. 'Nonsurgical periodontal therapy' (nullable)
score_area    text        -- one of the 13 reporting areas (+ 'case') for analytics roll-up
sort_order    int
```

### questions
```
id            uuid pk
slug          text unique   -- stable human id, e.g. 'q-anat-0001'
taxonomy_id   uuid fk -> taxonomy
format        text          -- 'completion' | 'question' | 'negative'
stem          text
difficulty    text          -- 'easy' | 'medium' | 'hard'
status        text          -- 'draft' | 'review' | 'approved' | 'live'
case_id       uuid fk -> cases (nullable)      -- set if this item belongs to a case
testlet_id    uuid fk -> testlets (nullable)
reference     text
created_at, updated_at
```

### options
```
id            uuid pk
question_id   uuid fk -> questions
label         text          -- 'A'..'E'
body          text
is_correct    boolean
distractor_rationale text   -- why this wrong option is wrong (null for the key)
sort_order    int
```

### rationales
(1:1 with question; kept separate so it can be withheld in exam mode / lazy-loaded)
```
question_id   uuid pk fk -> questions
correct_explanation text
```

### cases
```
id            uuid pk
title         text
patient_box   jsonb   -- { demographics, chief_complaint, background_history, current_findings }
patient_type  text    -- 'adult' | 'pediatric' | 'geriatric' | 'special_needs' | 'medically_compromised' | ...
notes         text
```

### case_media / testlets
```
case_media:  id, case_id fk, kind ('chart'|'radiograph'|'photo'), storage_path, caption, source
testlets:    id, title, scenario text, notes    -- community health/research parent stimulus
```

## Auth
Supabase Auth with **magic link (email OTP)** — no passwords. On first sign-in, create a
`profiles` row keyed to `auth.users.id`.

## User tables (RLS: owner-only)

### profiles
```
id            uuid pk = auth.users.id
display_name  text
target_exam_date date
created_at
```

### sessions
```
id            uuid pk
user_id       uuid fk -> profiles
kind          text     -- 'practice' | 'timed' | 'mock' | 'review_missed' | 'review_flagged' | 'case'
config        jsonb    -- areas/subdomains chosen, N, timer, difficulty
started_at, finished_at
score_summary jsonb    -- overall + per-score-area at completion
```

### responses
```
id            uuid pk
session_id    uuid fk -> sessions
user_id       uuid fk -> profiles
question_id   uuid fk -> questions
selected_option_id uuid fk -> options (nullable if skipped)
is_correct    boolean
answered_at
time_ms       int
```

### bookmarks
```
user_id, question_id  (composite pk)
flagged       boolean
note          text
created_at
```

### review_schedule   (Phase 7 — spaced repetition)
```
user_id, question_id  (composite pk)
ease          real
interval_days int
due_at        timestamptz
last_result   text
```

## Analytics
Per-area progress = aggregate `responses` joined to `questions.taxonomy_id -> score_area`.
Readiness band = function of (coverage %, recent accuracy) per score area; keep the thresholds in
app config so they're easy to tune. Don't try to reproduce the real 49–99 scale — show a clear
band + per-area % instead (see PROJECT_STATE open question).

## RLS quick rules
- `profiles/sessions/responses/bookmarks/review_schedule`: `user_id = auth.uid()`.
- content tables: `select` for any authenticated user; writes gated to an admin claim/role.
