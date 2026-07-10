---
kanban-plugin: board
---

## Backlog

- [ ] Phase 2: question renderer (completion/question/negative)
- [ ] Phase 2: study mode + rationale panel + per-distractor explanations
- [ ] Phase 2: session + response tracking, bookmark/flag
- [ ] Phase 3: quick-practice builder (areas/subdomains/N/difficulty)
- [ ] Phase 3: review-missed + review-flagged queues
- [ ] Phase 4: per-score-area analytics + weak-area ranking
- [ ] Phase 4: readiness band + "study next"
- [ ] Phase 5: cases + testlets + patient-box component
- [ ] Phase 5: Supabase Storage media (charts/radiographs/photos)
- [ ] Phase 6: format-accurate mock exam (two sessions, timers)
- [ ] Phase 6: PWA manifest + service worker + offline caching
- [ ] Phase 7: spaced repetition + flashcards + error reporting
- [ ] Phase 7: deepen question bank (Local Anesthesia depth)

## This Phase (Phase 1)



## In Progress

- [ ] Phase 1: apply taxonomy seed + run import against live DB, verify /questions on deployed URL

## Done

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
