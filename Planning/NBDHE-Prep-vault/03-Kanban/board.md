---
kanban-plugin: board
---

## Backlog

- [ ] Phase 5: Supabase Storage media (charts/radiographs/photos)
- [ ] Phase 7: deepen question bank — ongoing (batches 1-22 + 7e trick batch + sets feature; bank
      now 172 + 5 cases + 23 flashcards; batches 6-22 and the 7e batch not yet seeded to live)
- [ ] Phase 7: testlet infra (importer parser/upsert + practice-loop stimulus wiring) — needed
      before a Community Health testlet can be authored

## This Phase (Phase 8 — Launch readiness, owner-requested 2026-07-20)

Owner priority: these come **before** the ongoing 7b/7d depth batches below.

- [x] Phase 8: **sign-in modal (8a, PR #66)** — landing page's "Sign in"/"Start practicing" CTAs
      open the magic-link form in a modal instead of navigating to `/login` (kept as a working
      fallback route the auth middleware still redirects to).
- [x] Phase 8: **dashboard polish (8b, PR #67)** — `TopicTile` (by-exam-topic grid, shared with
      the `/topics` index) gained a small per-area Lucide icon (`topicIcon()` in `lib/topics.ts`,
      generic fallback for an unmapped area); `/dashboard`'s header collapsed from two rows into
      one toolbar row (title/email left, mode toggle + icon-only Settings/Sign-out right) with
      small spacing bumps between sections. Seafoam theme/colors unchanged, no new tiles.
- [x] Phase 8: **injection hardening (8c, PR #68)** — full audit (RLS on all 12 tables, Supabase
      query construction, XSS render paths, auth/session/magic-link flow, content importer) came
      back clean; fixed the two gaps it did find — `recordResponse`/`finishSession`
      (`app/practice/actions.ts`) now verify session ownership and recompute correctness/score
      server-side instead of trusting client-supplied values, and `export-seed-sql.mjs`'s dollar-
      quote guard now also rejects content ending in a trailing lone `$`. Added a baseline
      security-header set (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
      Permissions-Policy, HSTS) via `next.config.mjs`, verified against a real production build +
      headless-browser smoke test (caught a strict `script-src` breaking Next.js hydration before
      it shipped).
- [x] Phase 8: **theme toggle (8d, this run)** — `profiles.theme` (migration
      `20260720000001_theme_preference.sql`, `'light' | 'dark' | 'system'`, default `'system'`,
      manual apply pending). Wires up the `.dark` HSL palette that already existed in
      `app/globals.css`/`tailwind.config.ts` but was never toggled: a static inline `ThemeScript`
      runs first in `<body>` so the `dark` class lands on `<html>` before paint (no
      flash-of-wrong-theme), a `ThemeSync` mounted app-wide like `PwaManager` re-applies live on
      OS theme changes and pulls a signed-in user's `profiles.theme` down on mount (cross-device
      sync), and a `/settings` 3-way Light/Dark/System toggle applies instantly then persists via
      a new `setTheme` server action. Verified with a real production build + a headless-Chromium
      smoke test (class + computed `--background` var toggle correctly on reload; `/settings`
      still auth-redirects; CSP/security headers from 8c untouched).
- [x] Phase 8: **progress reset (8e, this run)** — a "Danger zone" card on `/topics/[slug]`
      (`components/topics/reset-progress.tsx`) two-step-confirms then clears the signed-in user's
      own responses (and any session left with nothing else in it), question flags/notes, and
      both spaced-repetition schedules (question review + dedicated flashcards) for that one
      topic — `resetTopicProgress` in the new `app/topics/actions.ts`, owner-scoped to
      `auth.uid()` on every delete. Migration `20260721000001_progress_reset_delete_policies.sql`
      adds owner-delete RLS policies `sessions`/`responses` never had (manual apply pending,
      same pattern as prior migrations); until applied, the reset still clears bookmarks/
      schedules but reports back that some session/response history couldn't be removed yet
      instead of silently claiming success.
- [ ] Phase 8: content thin-areas (8f) — continue 7b-style gap-driven content in the
      least-populated score areas.
- [ ] Phase 8: blueprint audit (8g) — confirm taxonomy/content still matches the published 2026
      NBDHE Candidate Guide; fix `blueprint-mapping.md` first if drift is found.

## This Phase (Phase 7)

- [x] Phase 7: review tools — SM-2-lite flashcards `/review` + `review_schedule` +
      error reports (`question_reports`) — `lib/srs.ts` (7a) — migration applied live
- [x] Phase 7: **by-exam-topic dashboard mode (7c)** — `/settings` toggle between today's
      by-study-method dashboard and a new grid of the live taxonomy score areas; each topic opens
      `/topics/[slug]` with notes first, then that topic's study options — PR #53. Migration
      `20260717000002_dashboard_mode.sql` needs a manual SQL-editor apply (degrades to `'method'`
      until then).
- [ ] Phase 7: topic notes depth (7d, ongoing) — batch 1 (PR #55): deepened "Anatomic Sciences" +
      "Periodontal Disease Management" notes, added `ToothAnatomyDiagram` + `PerioPocketDiagram`
      original SVGs. Batch 2 (PR #56): deepened "Dental Radiography" + "Preventive Agents" notes,
      added `RadiographicLandmarksDiagram` + `CariesProcessDiagram` original SVGs
      (`components/topics/`, wired via `TOPIC_DIAGRAMS`). Batch 3 (PR #57): deepened "Patient
      Assessment" (six-point periodontal probing, reading a probe's mm markings) + "Pharmacology"
      (LA sodium-channel blockade, differential fiber blockade, IANB as the highest-yield
      injection) notes, added `PeriodontalChartingDiagram` + `NerveBlockLandmarksDiagram`. Batch 4
      (PR #59, merged): deepened "Biochemistry and Nutrition" (the Stephan curve — plaque pH vs.
      time after a sugar exposure, why exposure frequency beats total sugar quantity, vitamin
      C/collagen hydroxylation) + "Microbiology and Immunology" (dental plaque biofilm formation
      as an ordered succession — pellicle, early colonizers, Fusobacterium-mediated
      coaggregation, mature biofilm's anaerobic red complex) notes, added `StephanCurveDiagram` +
      `BiofilmFormationDiagram`. 8/13 topics now have a diagram. Next batch: pick 1-2 more
      (remaining topics without one: Physiology, Pathology, Dental Hygiene Care Planning,
      Supportive Treatment Services, Professional Responsibility, Research Principles and
      Community Health).
- [~] Phase 7: bank depth (7b, ongoing, paused for 7d) — b1-b22 across all areas + 5 cases; bank now 158
      (batch 22: rotated depth across Care Planning/Perio Management/Local Anesthesia —
      instruction: oral conditions/dentin hypersensitivity management, prescribed
      therapy-chemotherapeutic agents/amoxicillin+metronidazole adjunct, local
      anesthesia/duration-of-action agent selection, anxiety and pain control-local
      anesthesia/beta-blocker+epinephrine interaction — 4 questions + 1 flashcard)
- [x] Phase 7: **topic-toggle relocate + trick questions (7f + 7e, requested directly, PR #58
      merged)** — moved the by-method/by-topic toggle off `/settings` onto a `ModeToggle` at the
      top of `/dashboard`; cases now surface under their best-fit topic on `/topics/[slug]`
      (`caseTopicAreas()`); new `/topics` index reachable from a "Topic notes" Review tile. Added
      `questions.is_trick` + `profiles.show_trick_badge` (both migrations applied live), a
      `/settings` toggle (off by default) showing a "Trick" badge in practice/the question bank
      (never in `/mock`), `trick: true` importer + authoring-guidelines support, and a first batch
      of 14 original trick items (one per score area — 172 questions total; `content:import` run
      locally, last known mid-troubleshooting a `service_role` key issue — confirm 172 rows live).
- [ ] Phase 7: **practice-loop UX fixes (7g, requested directly, open in PR #60)** — `PageHeader`
      `backHref="back"` (`components/ui/back-button.tsx`) on `/practice/build` and `/sets` so
      "change filters"/"all sets" returns to wherever you actually came from, not a fixed
      `/dashboard`; `PracticeSession` gained "Skip for now" (defers to end of a local reorderable
      queue) and an always-available "End set now" (previously timed-tests-only).

## Done (Phase 6)

- [x] Phase 6: format-accurate mock exam — `/mock` two timed components (A discipline / B
      case-based) + break + readiness scoreband — `lib/mock.ts` (6a)
- [x] Phase 6: PWA — manifest + service worker (offline fallback) + install prompt +
      theme-color/apple metadata — `app/manifest.ts` / `public/sw.js` / `PwaManager` (6b)

## Done (Phase 5)

- [x] Phase 5: cases + testlets + case_media tables, patient-box component,
      `/cases` + `/cases/[slug]`, one original sample case — PR #10 (5a)
- [x] Phase 5: case navigation — wire case items into the practice loop —
      `/practice?case=<slug>` + "Start case" button — PR #11 (5b)

## Done (Phase 4)

- [x] Phase 4: per-score-area analytics + weak-area ranking + accuracy trend — `/analytics` (4a)
- [x] Phase 4: readiness band (Not yet/Approaching/Ready) + "study next" — `lib/readiness.ts` (4b)

## Done (Phase 3)

- [x] Phase 3: quick-practice builder — `/practice/build` filters by area/difficulty/N (3a)
- [x] Phase 3: review-missed + review-flagged queues; custom timed test (timer + submit) (3b)

## Done (Phase 2)

- [x] Phase 2: session + response tracking — PR #2
- [x] Phase 2: bookmark/flag — PR #2

## Done

**Live verification (2026-07-12)**

- [x] Phase 1: apply taxonomy seed + run import against live DB, verify /questions on deployed URL
- [x] Phase 2: apply `..._sessions_responses.sql` (PR #2), smoke-test /practice end-to-end
  (session/response persistence) on the deployed URL — a real `sessions`/`responses` row exists
  in the live project confirming the owner-only RLS write path works

**Phase 2 (2a + 2b merged 2026-07-12, PR #1 + PR #2)**

- [x] Phase 2: sessions/responses/bookmarks migration (owner-only RLS)
- [x] Phase 2: /practice persists sessions + responses + bookmark/flag via server actions,
  degrades gracefully if the migration isn't applied yet

**Phase 2 (2a-renderer merged 2026-07-11/12, PR #1)**

- [x] Phase 2: question renderer (completion/question/negative) — PR #1
- [x] Phase 2: study mode + rationale panel + per-distractor explanations — PR #1
- [x] Phase 2: /practice page — shuffled study set from approved/live questions

**Phase 1 (code complete 2026-07-10)**

- [x] Phase 1: taxonomy tables (done in Phase 0 content stubs)
- [x] Phase 1: seed taxonomy from blueprint-mapping.md (idempotent SQL migration)
- [x] Phase 1: import pipeline (vault q-*.md → DB) with offline `content:check` validator
- [x] Phase 1: author 33 original questions across all 13 score areas (Local Anesthesia x3)
- [x] Phase 1: raw questions list page at /questions

**Phase 0 (complete)**

- [x] Create Supabase project + wire env + Vercel deploy of empty shell
- [x] Scaffold Next.js 14 (App Router, TS, Tailwind, shadcn/ui)
- [x] Auth (magic link) + profiles row on signup
- [x] Base tables + RLS on from day one

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false]}
```
%%
