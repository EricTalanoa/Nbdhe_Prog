---
updated: 2026-07-12
phase: 2 — Core practice loop (2a merged, 2b code complete)
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 2 — Core practice loop: 2a-renderer merged, 2b-tracking code complete (2026-07-12).**
Phase 1 (content model + ingestion) is code complete, still pending its live-DB verification.
2a (PR #1, merged): auth-gated `/practice` page + `QuestionRenderer` covering all three formats
with EXCEPT/NOT flagged, immediate correct/incorrect feedback + rationale + per-distractor
explanations, end-of-set score summary. 2b (PR #2, open): migration
`..._sessions_responses.sql` adding `sessions`/`responses`/`bookmarks` (owner-only RLS); new
`app/practice/actions.ts` server actions persist a session per practice set, a response row per
answer (with elapsed `time_ms`), and a finish-time score summary; `QuestionRenderer` now has a
bookmark/flag toggle. Every action swallows DB errors so `/practice` still works before the
migration is applied — matches the "degrade gracefully" constraint.
`npm run content:check` (33/33), `npm run lint`, and `next build` are green on both PRs. **Neither
has been smoke-tested against a live DB** — no `.env.local`/service-role key in the build sandbox,
and Phase 1's migrations/import still haven't been run against Supabase either.

## Next 3 actions
1. Apply migrations `..._seed_taxonomy.sql` and `..._sessions_responses.sql` (PR #2), then
   `SUPABASE_SERVICE_ROLE_KEY=… npm run content:import`; confirm `/questions` **and** `/practice`
   work on the deployed URL, sessions/responses/bookmarks persist, and merge PR #2. Move more
   authored items from `review` → `approved` so `/practice` has more than 1 question to draw from.
2. Next chunk: **3a-builder** — quick-practice builder (pick areas/subdomains/N/difficulty) to
   generate a filtered session instead of pulling from the whole approved bank.
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
