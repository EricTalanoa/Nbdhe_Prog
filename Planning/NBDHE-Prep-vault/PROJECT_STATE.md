---
updated: 2026-07-11
phase: 2 — Core practice loop
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 2 — Core practice loop: 2a-renderer code complete (2026-07-11), pending live smoke test.**
Phase 1 (content model + ingestion) is code complete, still pending its live-DB verification.
Added for 2a: auth-gated `/practice` page pulling `approved`/`live` questions (with `options` +
`rationales`) into a shuffled study set (default 10, `?n=` up to 50), a `QuestionRenderer`
covering all three formats with EXCEPT/NOT visually flagged in negative stems, immediate
correct/incorrect feedback with the correct-answer rationale + per-distractor explanations, and an
end-of-set score summary. No new tables — pure UI over the Phase 1 schema. PR:
https://github.com/EricTalanoa/Nbdhe_Prog/pull/1 (open, not merged).
`npm run content:check` (33/33), `npm run lint`, and `next build` are green. **Not yet smoke-tested
against a live DB** — no `.env.local`/service-role key in the build sandbox, and Phase 1's
migrations/import still haven't been run against Supabase either.

## Next 3 actions
1. Apply migration `..._seed_taxonomy.sql`, then `SUPABASE_SERVICE_ROLE_KEY=… npm run content:import`;
   confirm `/questions` **and** `/practice` work on the deployed URL (closes out Phase 1 exit +
   verifies 2a live). Move more authored items from `review` → `approved` so `/practice` has more
   than 1 question to draw from.
2. Next chunk: **2b-tracking** — `sessions`/`responses`/`bookmarks` migration + persistence, wired
   into the `/practice` flow, with graceful degradation if the tables aren't applied yet.
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
