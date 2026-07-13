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
   branch, and open a PR against `main` with `gh pr create`.
7. In this file, check the chunk's box and add the PR link. Update `PROJECT_STATE.md` (current phase
   + next actions) and `03-Kanban/board.md`. Commit + push those to the same branch.
8. **Auto-merge (standing instruction from the project owner, 2026-07-12): once everything from
   steps 6–7 is pushed and step 5's checks are green, merge the PR (squash) — don't wait for manual
   review.** Skip only if the PR isn't cleanly mergeable (conflicts) or CI on the PR is failing; in
   that case leave it open and say why.
9. If every box below is checked, open a final "project code-complete" summary PR, merge it, and stop.

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
- [x] **3a-builder** — Quick-practice builder: pick areas/subdomains, N, difficulty; generates a
  session from the chosen filters. `/practice/build` (native GET form, score-area + difficulty +
  set-size) submits to `/practice`, which filters the approved pool by those params and records
  them in the session `config`. PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/6
- [x] **3b-queues** — Review-missed and review-flagged queues; custom timed test (timer + submit).
  `/practice?mode=missed` (wrong `responses`) and `?mode=flagged` (flagged `bookmarks`) build
  review sets with the matching session `kind`; the builder gained a time-limit option and
  `/practice?t=<secs>` runs a countdown that auto-submits (with an "End test now" button).
  PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/7

### Phase 4 — Analytics + readiness
- [x] **4a-rollup** — Per-score-area roll-up (13 areas + case area), accuracy trend, weak-area
  ranking, from `responses` joined to `questions.taxonomy_id → score_area`. `/analytics` shows
  overall accuracy, weakest areas (accuracy asc, low-sample flagged), a per-area breakdown in
  blueprint order (incl. not-yet-started areas), and a per-day accuracy trend. Dashboard links it.
  PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/8
- [x] **4b-readiness** — Readiness band (Not yet / Approaching / Ready) per score area from
  (coverage %, recent accuracy) with tunable thresholds in app config; "study next" suggestions.
  Thresholds live in `lib/readiness.ts` (`READINESS` + `readinessBand`); `/analytics` shows a band
  chip per area, coverage %, recent accuracy, and a "Study next" list linking straight into a
  filtered practice set for each suggested area. PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/9

### Phase 5 — Cases & testlets
- [x] **5a-cases** — `cases` + `testlets` tables + patient-box component; media via Supabase
  Storage (static images ok). Author one original sample case (Rule 0). PR:
  https://github.com/EricTalanoa/Nbdhe_Prog/pull/10
- [x] **5b-case-nav** — Case navigation: parent stimulus + linked child items; wire case items into
  the practice loop. `/practice?case=<slug>` plays a case's approved items in slug order as a
  `case`-kind session, with `PatientBox` shown as a persistent stimulus above every item (new
  `stimulus` prop on `PracticeSession`); `/cases/[slug]` gained a "Start case" button.
  PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/11

### Phase 6 — Full mock exam + PWA
- [x] **6a-mock** — Format-accurate mock: two sessions, timers, optional breaks, final scoreband.
  `/mock` runs Component A (discipline items) → optional break → Component B (case-based, patient
  box pinned above each item) → results, each section on a per-item countdown that auto-advances;
  finishes with an overall %, a readiness band (thresholds in `lib/mock.ts`), per-component and
  per-score-area breakdowns. Persists a `mock`-kind session + responses. Dashboard links it.
  PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/13
- [x] **6b-pwa** — PWA manifest + service worker, offline question caching, install prompt, mobile
  UX pass. `app/manifest.ts` (installable, standalone, SVG icons) + a dependency-free
  `public/sw.js` (cache-first static, network-first navigations with an `/offline` fallback) +
  `PwaManager` (registers the SW, shows an install prompt on `beforeinstallprompt`); theme-color +
  apple-web-app metadata in the root layout; middleware allowlists the PWA assets. PR:
  https://github.com/EricTalanoa/Nbdhe_Prog/pull/14

### Phase 7 — Content scale-up + niceties
- [x] **7a-review-tools** — Spaced-repetition scheduling (`review_schedule`), flashcards,
  error-reporting workflow. Migration `..._review_tools.sql` adds `review_schedule` +
  `question_reports` (owner-only RLS). `/review` is an SM-2-lite flashcard queue (`lib/srs.ts`):
  flip to reveal the key + rationale, self-grade Again/Hard/Good/Easy → reschedules `due_at`; a
  "report a problem" form writes `question_reports`. Degrades gracefully (every card treated as
  new; grade/report are no-ops) until the migration is applied. PR:
  https://github.com/EricTalanoa/Nbdhe_Prog/pull/15
- [ ] **7b-bank-depth** — Deepen the question bank across all 13 areas (wide → deep; Local
  Anesthesia gets extra depth), authored to the blueprint. Ongoing; one focused batch per run.
  Progress: bank now 45 questions. Batch 1 (2026-07-13, PR #16) added 5 original Local Anesthesia
  items (q-anes-0004..0008: max-dose basis, articaine plasma hydrolysis, prilocaine/
  methemoglobinemia, pKa & onset, epinephrine in cardiovascular disease) — Malamed-referenced,
  incl. the bank's 2nd `hard` item. Batch 2 (2026-07-13) added 5 items covering previously-thin
  subdomains: q-plan-0003 (Treatment strategies — Treatment plan), q-plan-0004 (Individualized
  patient education — instruction: periodontal diseases), q-plan-0005 (Infection control
  application, negative-format), q-perio-0006 (Prescribed therapy — Surgical support services),
  q-perio-0007 (Maintenance) — Darby & Walsh / Wilkins / CDC infection-control / Newman & Carranza
  referenced. Next batches: remaining Care Planning subdomains (patient-education variants,
  Treatment strategies — Diagnosis/Case presentation) and Perio (Implant care, Reassessment and
  evaluation), plus other under-2-item areas.
