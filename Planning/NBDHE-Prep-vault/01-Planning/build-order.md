# Build Order (phased)

Each phase is shippable and testable on its own. Move Kanban cards as these complete; update
PROJECT_STATE at each phase boundary.

## Phase 0 — Foundation
- Next.js 14 (App Router, TS) + Tailwind + shadcn/ui scaffold.
- Supabase project; env wiring; Vercel deploy of the empty shell.
- Auth (magic link) + `users` profile row on signup.
- Base tables + **Row-Level Security ON** from day one.
- **Exit:** you can sign in on the deployed URL and see an empty dashboard.

## Phase 1 — Content model + ingestion
- Create `taxonomy`, `questions`, `options`, `rationales` tables.
- Seed `taxonomy` from `blueprint-mapping.md`.
- JSON import script (vault question notes → DB).
- Author ~3 original questions per discipline area to exercise the pipeline.
- **Exit:** seeded questions visible via a raw list page.

## Phase 2 — Core practice loop
- Question renderer for all item formats (completion/question/negative).
- Study mode: answer → immediate feedback → rationale + per-distractor explanation.
- Session + response tracking; bookmark/flag.
- **Exit:** she can do a practice set and see rationales.

## Phase 3 — Sessions & modes
- Quick practice builder (pick areas/subdomains/N/difficulty).
- Review-missed + review-flagged queues.
- Custom timed test.
- **Exit:** multiple session types work and record results.

## Phase 4 — Analytics + readiness
- Per-score-area roll-up (13 areas + case area), trend, weak-area ranking.
- Readiness band + "study next" suggestions.
- **Exit:** dashboard shows meaningful per-area progress.

## Phase 5 — Cases & testlets
- `cases` + `testlets` parent objects; patient-box component.
- Media via Supabase Storage (static chart/radiograph/photo images for now).
- Case navigation (parent stimulus + linked child items).
- **Exit:** a full case with linked items is playable.

## Phase 6 — Full mock exam + PWA polish
- Format-accurate mock (two sessions, timers, optional breaks, final scoreband).
- PWA: manifest + service worker, offline question caching, install prompt, mobile UX pass.
- **Exit:** she can take a timed mock and install the app on her phone.

## Phase 7 — Content scale-up + niceties
- Author the full bank across all areas (wide → deep; Local Anesthesia gets extra depth).
- Spaced repetition scheduling; flashcards; error-reporting workflow.
- **Exit:** bank is deep enough for real prep; review tools complete.

## Sequencing notes
- Content authoring runs **in parallel** with dev from Phase 1 onward — it's the long pole.
- Don't gold-plate charts early: static images unblock cases; interactive charting is Phase 7+.
