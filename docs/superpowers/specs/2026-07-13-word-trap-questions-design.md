# Word-Trap Questions + Trick-Question Hints Toggle — Design

**Date:** 2026-07-13
**Status:** Approved by Eric (chat, 2026-07-13)
**Chunk:** 7b bank depth, batch 7 + companion feature

## Motivation

The real NBDHE leans on wording precision: near-miss distractors and stems where a single
word (*initial*, *most*, *best*, *EXCEPT*) flips the correct answer. The bank should train
that skill deliberately: add original word-trap items across every area, and let the app
optionally reveal which questions are traps (and what the pivotal word was) as a teaching
aid — off by default so practice stays exam-realistic.

## Scope

1. Schema: mark trap questions and store the trap explanation.
2. A per-user setting that toggles trap visibility, on a new `/settings` page.
3. Renderer support: pre-answer badge + post-answer callout when the setting is on.
4. Content: 16 new word-trap questions spread across all areas (7b batch 7).

Out of scope: a dedicated "trap drill" mode, auditing/re-wording existing items, settings
UI for display name / exam date (page is built so these can join later).

## 1. Data model

New migration `supabase/migrations/20260713000003_trap_questions.sql`:

- `alter table public.questions add column trap_note text;`
  Nullable. Non-null means the item is a wording trap; the value is the learner-facing
  callout text, e.g. *"The word 'initial' is doing the work here — 'definitive' would make
  B correct."* No separate boolean; presence of the note is the flag.
- `alter table public.profiles add column show_trap_hints boolean not null default false;`
  Default OFF: questions look exam-realistic until the user opts in.

No RLS changes needed — `questions` is already authenticated-read, `profiles` is
owner-only with an existing owner-update policy.

## 2. Vault format + importer

- Question notes gain an **optional `# Trap` body section** (after `# Rationale`). It
  holds the trap callout text. Body sections keep the note readable in Obsidian and match
  the existing `# Stem` / `# Options` / `# Correct answer` / `# Rationale` pattern.
- `scripts/import-questions.mjs`: parse the `# Trap` section into `questions.trap_note`
  (null when absent). `--check` validation: if the section heading is present it must be
  non-empty.
- Update `02-Content/_templates/question.md` with the optional section and a comment.

## 3. Settings page

- New auth-gated route `app/settings/page.tsx`, linked from the dashboard.
- One control: a "Reveal trick questions" toggle with a one-line explanation ("Shows a
  badge on wording-trap questions and explains the trap after you answer. Off = questions
  look exactly like the real exam.").
- Reads `profiles.show_trap_hints`; writes via a server action (owner-only RLS update,
  same pattern as existing owner writes).

## 4. Renderer behavior

- `components/practice/types.ts`: `PracticeQuestion` gains `trap_note: string | null`;
  session components accept/thread a `showTrapHints: boolean` resolved server-side from
  the profile.
- `QuestionRenderer`, when `showTrapHints && question.trap_note`:
  - **Before answering:** an amber "wording trap" badge beside the format/difficulty
    labels (visual language matches the existing EXCEPT/NOT highlight).
  - **After submitting:** the trap note renders as a highlighted callout above the
    standard rationale text.
- When the toggle is off (or the question has no `trap_note`): rendering is byte-for-byte
  today's behavior.
- **Mock exams (`/mock`) never show trap hints regardless of the setting** — mocks
  simulate the real exam. Practice, sets, and case sessions respect the toggle.

## 5. Content batch (7b batch 7): 16 word-trap items

- Coverage: one item per each of the 13 discipline score areas, +1 Research Principles,
  +1 Community Health, +1 extra Local Anesthesia (the emphasized subdomain) = 16.
- Trap styles rotated across the batch:
  - qualifier pivots (*initial* vs *definitive*, *most* vs *first*, *best* vs *next*)
  - negative stems (EXCEPT / NOT, capitalized per authoring rules)
  - near-pair terminology (hypo-/hyper-, -plasia/-trophy, similar drug names)
  - numeric near-misses (doses, probing depths, exposure settings)
  - absolute vs conditional wording (*always/never* vs *usually/may*)
- Every item: original (Rule 0), authored to the blueprint taxonomy strings, full
  rationale (key + every distractor), reference cited, plus the `# Trap` section.
  Difficulty skews medium/hard. Same review workflow and file conventions as batches 1–6.

## 6. Rollout

- One PR: migration + importer + template + settings page + renderer changes + 16 vault
  notes.
- After merge: apply `20260713000003_trap_questions.sql` to the live project and seed the
  new items. Note: batch 6 (q-plan-0007..0009, q-perio-0008..0010) and the flashcards
  migration are also pending live seed per PROJECT_STATE — seed together.

## Testing

- `npm run content:import -- --check` (offline validation) passes with the new notes and
  the `# Trap` section parsing.
- Manual verification via dev server: toggle off → practice question renders unchanged;
  toggle on → badge appears pre-answer and callout post-answer on a trap item; non-trap
  items unaffected; `/mock` shows no trap UI with the toggle on; `/settings` persists the
  toggle across reloads.
