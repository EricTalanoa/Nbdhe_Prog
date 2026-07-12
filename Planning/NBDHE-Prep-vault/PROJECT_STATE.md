---
updated: 2026-07-12
phase: 4 — Analytics + readiness (4a-rollup merged)
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 4 — Analytics + readiness: 4a-rollup merged (2026-07-12).** `/analytics` computes, from
the user's `responses` joined through `questions.taxonomy_id → taxonomy.score_area`: overall
accuracy, a weakest-areas ranking (accuracy asc, low-sample flagged), a per-score-area breakdown
in blueprint order (including not-yet-started areas), and a per-day accuracy trend — all as
dependency-free CSS bars. Dashboard links "View progress". Phase 3 is complete: `/practice/build`
(area/difficulty/N/time-limit) plus `/practice?mode=missed|flagged` review queues and
`/practice?t=<secs>` timed tests. Phase 1 (content) and Phase 2 (renderer + session/response
tracking) are confirmed working against the live Supabase project (`NBDHE-Prep`,
`otqwhkfhjhixzjtaxhzk`):
- Both pending migrations (`..._seed_taxonomy.sql`, `..._sessions_responses.sql`) are applied.
- `npm run content:import` ran against the live project: `questions` (33), `options` (132),
  `rationales` (33), `taxonomy` (60) all populated from `02-Content/q-*.md`.
- The Vercel production deployment is built from `main` @ `820661a` (`nbdhe-prog.vercel.app`).
  `/questions` and `/practice` are live and correctly auth-gate (redirect to `/login`).
- A real practice run persisted: a `sessions` row (kind `practice`, `finished_at` +
  `score_summary` set) with a matching `responses` row — confirming the owner-only RLS write
  path works end-to-end on the deployed app, not just in code.
- Content triage done (2026-07-12): all 33 authored items reviewed for accuracy + Rule 0 and
  promoted `review` → `approved` (frontmatter + live `questions.status`), so `/practice` now
  draws from the full 33-question bank instead of a set of 1.

## Next 3 actions
1. Next chunk: **4b-readiness** — readiness band (Not yet / Approaching / Ready) per score area
   from (coverage %, recent accuracy) with tunable thresholds in app config; "study next"
   suggestions off the weak-area ranking.
2. Phase 7b (ongoing): deepen the bank beyond one item per area — Local Anesthesia and the
   high-item-count clinical areas (Care Planning, Perio Management) get the most depth. Current
   spread is thin (e.g. difficulty is 9 easy / 23 medium / 1 hard across 33 items).
3. Before girlfriend onboards: verify a real domain in Resend and swap the SMTP sender.

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
