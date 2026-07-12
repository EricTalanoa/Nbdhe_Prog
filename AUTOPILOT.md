# AUTOPILOT — recurring build plan

This file lets an autonomous agent advance the project **one half-phase per run** with no memory of
prior runs. The checklist below is the shared state: each run does the first unchecked chunk, checks
its box, and opens a PR. When every box is checked, the project is code-complete.

Phase definitions live in `Planning/NBDHE-Prep-vault/01-Planning/build-order.md`; the DB schema in
`Planning/NBDHE-Prep-vault/05-Dev/schema.md`; authoring rules (Rule 0: all content ORIGINAL) in
`01-Planning/content-authoring-guidelines.md`. Current status is in `PROJECT_STATE.md`.

## Standing operating procedure (every run)

1. `git checkout main && git pull`.
2. Read `PROJECT_STATE.md` and this file. Find the **first unchecked** chunk below.
3. Create a branch `feat/<chunk-id>` (e.g. `feat/2a-renderer`).
4. Implement that chunk only, following `build-order.md` + `schema.md` + the authoring guidelines.
   - Any new DB tables → add a numbered migration in `supabase/migrations/`. You cannot apply
     migrations to Supabase; document the manual apply step in the PR and make the UI degrade
     gracefully if the tables aren't present yet.
5. Verify: `npm run content:check` (must pass) and `npm run build` (must compile). Smoke-test the
   dev server if useful.
6. Commit (end messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`), push the
   branch, and open a PR against `main` with `gh pr create`. **Do not merge.**
7. In this file, check the chunk's box and add the PR link. Update `PROJECT_STATE.md` (current phase
   + next actions) and `03-Kanban/board.md`. Commit + push those to the same branch.
8. If every box below is checked, open a final "project code-complete" summary PR and stop.

## Constraints (do not break)
- Pages auth-gated (redirect to `/login` if no user), like `/dashboard` and `/questions`.
- Content tables read-only to clients; user-owned tables owner-only RLS (`user_id = auth.uid()`).
- shadcn/ui: install with `npx shadcn@2.3.0 add <component>` — the latest CLI emits Tailwind v4 /
  oklch files that break this v3 build. Theme tokens are HSL in `app/globals.css`.
- Auth is magic-link (email OTP). Only reveal rationale AFTER the user answers.
- Rule 0: never invent or paste real NBDHE items; all authored content is original.
- One chunk per run. Keep PRs reviewable. Record open decisions in the PR, don't block.

## Chunks (do the first unchecked one)

### Phase 2 — Core practice loop
- [x] **2a-renderer** — Question renderer for all three formats (completion/question/negative, with
  the EXCEPT/NOT stem visually flagged). Study mode: select an answer, submit, then show
  correct/incorrect feedback + correct-answer rationale + per-distractor explanations (data already
  in `questions`/`options`/`rationales`). A basic practice-set flow through N questions with an end
  summary. PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/1
- [x] **2b-tracking** — Migration `..._sessions_responses.sql` creating `sessions`, `responses`,
  `bookmarks` (owner-only RLS) per schema.md. Persist sessions + responses; add bookmark/flag.
  Degrade gracefully if tables not yet applied. PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/2

### Phase 3 — Sessions & modes
- [ ] **3a-builder** — Quick-practice builder: pick areas/subdomains, N, difficulty; generates a
  session from the chosen filters.
- [ ] **3b-queues** — Review-missed and review-flagged queues; custom timed test (timer + submit).

### Phase 4 — Analytics + readiness
- [ ] **4a-rollup** — Per-score-area roll-up (13 areas + case area), accuracy trend, weak-area
  ranking, from `responses` joined to `questions.taxonomy_id → score_area`.
- [ ] **4b-readiness** — Readiness band (Not yet / Approaching / Ready) per score area from
  (coverage %, recent accuracy) with tunable thresholds in app config; "study next" suggestions.

### Phase 5 — Cases & testlets
- [ ] **5a-cases** — `cases` + `testlets` tables + patient-box component; media via Supabase
  Storage (static images ok). Author one original sample case (Rule 0).
- [ ] **5b-case-nav** — Case navigation: parent stimulus + linked child items; wire case items into
  the practice loop.

### Phase 6 — Full mock exam + PWA
- [ ] **6a-mock** — Format-accurate mock: two sessions, timers, optional breaks, final scoreband.
- [ ] **6b-pwa** — PWA manifest + service worker, offline question caching, install prompt, mobile
  UX pass.

### Phase 7 — Content scale-up + niceties
- [ ] **7a-review-tools** — Spaced-repetition scheduling (`review_schedule`), flashcards,
  error-reporting workflow.
- [ ] **7b-bank-depth** — Deepen the question bank across all 13 areas (wide → deep; Local
  Anesthesia gets extra depth), authored to the blueprint. Ongoing; one focused batch per run.
