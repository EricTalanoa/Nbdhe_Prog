# Features & MVP

Goal: everything the good prep sources have, but genuinely easy to use. Below is the full feature
set, then the MVP cut (what ships first).

## What good NBDHE prep tools offer (the bar to hit)
- Large question bank mapped to the official blueprint, with **rationales** (why right AND why the
  distractors are wrong) and references.
- **Study mode** (immediate feedback) vs **exam/timed mode** (feedback withheld to the end).
- **Full-length mock exams** that mirror the real format (350 items, two sessions, ~7.5h) plus
  shorter configurable practice tests.
- **Domain/subdomain drills** — e.g. "Local Anesthesia only," "Radiography only."
- **Case-based & testlet practice** with patient box + charts/radiographs.
- **Performance analytics** by score area, weak-area surfacing, and a readiness estimate.
- **Review missed questions** + **spaced repetition** so weak items resurface.
- **Bookmarks/flags** and personal notes on questions.
- **Flashcards** for high-yield facts.
- Cross-device **progress sync** (accounts).
- Mobile-friendly / installable for studying anywhere.

## Full feature list (by module)

### Auth & account
- Sign in (magic link preferred), profile, target exam date, reset progress.

### Question engine
- Renders all item formats (completion / question / negative), 3–5 options, one correct.
- Immediate-feedback (study) and deferred-feedback (exam) modes.
- Rationale panel: correct answer + per-distractor explanation + reference.
- Flag/bookmark, "add personal note," report-an-error.

### Session types
- Quick practice (choose N items, choose areas/subdomains, difficulty).
- Full mock exam (format-accurate; two timed sessions; optional breaks; final scoreband).
- Custom timed test (pick length + timer).
- Case/testlet practice.
- Review: missed-only, flagged-only, spaced-repetition due queue.
- Flashcards.

### Cases & testlets
- Patient box (demographics, chief complaint, background/history, current findings).
- Attached media: dental chart image, radiographs, clinical photos (zoomable).
- Parent stimulus with linked child items; navigate within a case.

### Analytics
- Overall % + per-score-area breakdown (the 13 areas + case area).
- Trend over time; weak areas ranked; "what to study next."
- Readiness band (e.g. Not yet / Approaching / Ready) derived from area coverage + accuracy.

### Content/admin (for you + her, low-key)
- JSON import pipeline for authored questions (seed from vault).
- Simple review workflow: draft → review → approved → live.

### PWA / offline
- Installable; cache question sets for offline study; sync attempts when back online.

## MVP cut (ship this first)
The smallest thing that's actually useful to her:
1. Auth + account.
2. Question engine with **study mode** + rationales.
3. **Quick practice** by area/subdomain + **review missed**.
4. Progress analytics (overall + per-area %).
5. A seed bank of original questions across all 13 areas (start shallow, go wide, then deepen).
6. Installable PWA shell.

**Defer to post-MVP:** full 350-item timed mock, case/testlet media + interactive charts,
spaced-repetition scheduling, flashcards, error-reporting workflow.

## Explicit non-goals (for now)
- No payments/monetization (it's for her; keep it simple).
- No public leaderboards or social.
- No real/remembered exam items — ever (see content-authoring-guidelines.md).
