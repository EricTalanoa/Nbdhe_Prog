---
updated: 2026-07-10
phase: 1 — Content model + ingestion
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 1 — Content model + ingestion: code complete (2026-07-10), pending live seed.**
Tables existed from Phase 0. Added: taxonomy seed migration (`..._seed_taxonomy.sql`, idempotent,
all 13 score areas + Research/Community), an import pipeline (`scripts/import-questions.mjs`:
vault `q-*.md` → questions/options/rationales via service role), 33 original questions across all
13 areas (Local Anesthesia x3), and an auth-gated raw list page at `/questions`.
`npm run content:check` validates notes + taxonomy tagging offline (no DB) and passes 33/33;
`next build` is green. **Not yet run against live DB** — needs migrations applied + import run.

## Next 3 actions
1. Apply migration `..._seed_taxonomy.sql`, then `SUPABASE_SERVICE_ROLE_KEY=… npm run content:import`;
   confirm `/questions` lists them on the deployed URL (Phase 1 exit).
2. Start Phase 2: question renderer (completion/question/negative) + study mode with rationale +
   per-distractor explanations; session/response tracking.
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
