---
updated: 2026-07-13
phase: 7 — Content scale-up + niceties (7a-review-tools merged; 7b bank depth ongoing, batch 6)
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 7 — Review tools + content depth: 7a-review-tools merged (2026-07-13).** `/review` is an
SM-2-lite spaced-repetition flashcard queue (`lib/srs.ts`): pulls due + new cards, flip to reveal
the correct answer + rationale, self-grade Again/Hard/Good/Easy to reschedule `due_at`; a "report
a problem" form files a `question_reports` row. Migration `20260713000001_review_tools.sql`
(`review_schedule` + `question_reports`, owner-only RLS) is **applied to the live project
(2026-07-13)**, so `/review` persists schedules and error reports. Dashboard links "Flashcard
review". **7b (ongoing)** — 6 batches (b1 LA PR#16, b2 Care Planning/Perio PR#20, b3 Radiography/
Assessment PR#22, b4 Preventive/Professional/Supportive/Research PR#23, b5 +2 cases + 4 linked
items PR#26, b6 2nd-pass Care Planning/Perio subdomains — this PR). Vault holds **70 questions**
(14 easy / 49 medium / 7 hard) + **3 cases** (perio, pediatric ECC, anticoagulant) — **batch 6 is
authored + validated in the vault but not yet seeded to live** (live still = 64/3 as of
2026-07-13; seed via SQL editor next). (Live writes go through the SQL editor; MCP writes +
`*.supabase.co` egress are blocked in Claude web sessions.) Also shipped (features, not chunks):
pre-built topic sets `/sets` + subdomain filter (PR #25), and a seafoam & white visual refresh
(PR #24).

Phase 6 (mock exam + PWA) is complete. `/mock` runs a
format-accurate mock: Component A (discipline items) → optional break → Component B (case-based,
`PatientBox` pinned above each) → results, each section on a per-item countdown (`lib/mock.ts`)
that auto-advances at zero; finishes with overall %, a readiness band, and per-component +
per-score-area breakdowns (persists a `mock`-kind session). 6b-pwa makes the app installable:
`app/manifest.ts` (standalone, SVG icons), a dependency-free `public/sw.js` (cache-first static,
network-first navigations with an `/offline` fallback), a `PwaManager` that registers the SW and
shows an install prompt, theme-color + apple-web-app metadata in the root layout, and the PWA
assets allowlisted in the auth middleware. Runtime-verified locally: `/manifest.webmanifest`,
`/sw.js` (correct MIME), `/icon.svg`, `/offline` all serve public while `/dashboard` still
auth-redirects. **Next: Phase 7** (content depth + review tools). NBDHE app is feature-complete
through Phase 6.

Phase 5 (cases & testlets) is complete and live-verified: `cases`/`testlets`/
`case_media` tables exist (RLS matching other content tables) with `questions.case_id`/
`testlet_id` now real FKs. The vault import pipeline parses `case-*.md` notes and resolves a
question's `case: <slug>` frontmatter into `case_id`, validated offline in `content:check`. A
read-only `PatientBox` component + `/cases` and `/cases/[slug]` pages are live (auth-gated,
linked from the dashboard), and `/cases/[slug]` now has a "Start case" button. `/practice?case=
<slug>` (5b-case-nav, PR #11) plays a case's linked approved items in slug order as a `case`-kind
session, with `PatientBox` rendered as a persistent stimulus above every item via a new
`stimulus` prop on `PracticeSession` — answering, flagging, and response recording all reuse the
existing practice-loop machinery unchanged. One original sample case (`case-perio-0001`, Rule 0)
with two linked items is authored. **Live-verified (2026-07-13):** migration
`20260712000002_cases_testlets.sql` is applied to the live project and the sample case is seeded —
confirmed `cases`=1, case-linked `questions`=2, total `questions`=35, so `/cases` and
`/practice?case=case-perio-0001` now run against real data.

Phase 4 (analytics + readiness) is complete: `/analytics` computes, from the user's `responses`
joined through `questions.taxonomy_id → taxonomy.score_area`: overall accuracy, a weakest-areas
ranking, a per-score-area readiness band (Not yet / Approaching / Ready) with coverage % + recent
accuracy, "Study next" suggestions that deep-link into a filtered practice set, and a per-day
accuracy trend — all dependency-free CSS. Readiness thresholds are tunable in `lib/readiness.ts`.
Phase 3 is complete: `/practice/build` (area/difficulty/N/time-limit) plus
`/practice?mode=missed|flagged` review queues and `/practice?t=<secs>` timed tests. Phase 1
(content) and Phase 2 (renderer + session/response tracking) are confirmed working against the live
Supabase project (`NBDHE-Prep`, `otqwhkfhjhixzjtaxhzk`):
- Both pending migrations (`..._seed_taxonomy.sql`, `..._sessions_responses.sql`) are applied.
- `npm run content:import` ran against the live project: `questions` (33), `options` (132),
  `rationales` (33), `taxonomy` (60) all populated from `02-Content/q-*.md`.
- The Vercel production deployment is built from `main` @ `820661a` (`nbdhe-prog.vercel.app`).
  `/questions` and `/practice` are live and correctly auth-gate (redirect to `/login`).
- A real practice run persisted: a `sessions` row (kind `practice`, `finished_at` +
  `score_summary` set) with a matching `responses` row — confirming the owner-only RLS write
  path works end-to-end on the deployed app, not just in code.
- Content triage done (2026-07-12): all 33 authored items reviewed for accuracy + Rule 0 and
  promoted `review` → `approved` (frontmatter + live `questions.status`).
- Cases live (2026-07-12): `20260712000002_cases_testlets.sql` applied and `case-perio-0001` +
  its 2 linked items seeded — live now holds 35 questions, 1 case, 2 case-linked questions.

## Next 3 actions
1. Seed batch 6 (q-plan-0007..0009, q-perio-0008..0010) to the live project via the SQL editor —
   vault is at 70 questions but live is still 64 until this runs.
2. Next chunk: **7b-bank-depth** (ongoing) — keep deepening the bank, one focused batch/run.
   Radiography, Assessment, and Preventive Agents still have the fewest items; keep rotating
   through under-covered subdomains rather than only the highest-count areas.
3. Rotate the Supabase `service_role` key (it was pasted into a chat on 2026-07-12 to seed the
   sample case). Note: this container's network egress blocks `*.supabase.co`, so
   `npm run content:import` can't run from Claude web sessions — apply migrations via the SQL
   editor and seed with SQL, or run the importer from a machine with egress.

## Stack (decided)
- Frontend: Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · PWA (manifest + SW)
- Backend: Supabase (Postgres + Auth + Storage), Row-Level Security per user
- Host: Vercel (frontend) + Supabase cloud
- Content: original questions authored to blueprint (see authoring guidelines) — NO real exam items

## Key constraints (do not break)
- **Integrity/copyright: all questions ORIGINAL.** Never use remembered/real NBDHE items.
  Sharing real items violates JCNDE rules of conduct — protects me and her. Non-negotiable.
- Target the **2026 "After Update" test specs** (Local Anesthesia broken out; update ~Oct 2026).
- Local-first feel but real accounts: offline study should work, sync when online.

## Repo / links
- Repo: https://github.com/EricTalanoa/Nbdhe_Prog.git
- Blueprint source: 00-Meta + 01-Planning/blueprint-mapping.md
- Board: 03-Kanban/board.md · Dashboards: 04-Dashboards/

## Decisions (locked)
- **Auth: magic link** (Supabase email OTP) — simplest for her, no password to manage.
- **Readiness: per-area % + a band** (Not yet / Approaching / Ready). No fake 49–99 scale number.
- **Perio charts: static images for MVP**, interactive charting deferred to Phase 7+.
- (Any of these can change — update here first, then the affected code.)

## Open questions
- None blocking Phase 0. Revisit readiness thresholds once real response data exists.
