---
kanban-plugin: board
---

## Backlog

- [ ] Phase 5: cases + testlets + patient-box component
- [ ] Phase 5: Supabase Storage media (charts/radiographs/photos)
- [ ] Phase 6: format-accurate mock exam (two sessions, timers)
- [ ] Phase 6: PWA manifest + service worker + offline caching
- [ ] Phase 7: spaced repetition + flashcards + error reporting
- [ ] Phase 7: deepen question bank (Local Anesthesia depth)

## This Phase (Phase 4)

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
