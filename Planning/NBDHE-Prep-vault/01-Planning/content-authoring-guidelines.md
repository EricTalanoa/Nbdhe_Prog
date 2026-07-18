# Content Authoring Guidelines

## Rule 0 — Integrity (non-negotiable, read first)
**Every question in this app must be ORIGINAL, written from published knowledge.**
- Do **not** use, transcribe, paraphrase, or "reconstruct from memory" real NBDHE items. The
  JCNDE guide is explicit: exam content is confidential, copyrighted, and sharing remembered
  questions is a **rules-of-conduct violation** that can void results and carry legal penalties.
  That risk lands on a candidate too — so this rule protects her, not just the project.
- Write items **to the blueprint**, grounded in standard dental-hygiene references (e.g. Wilkins'
  *Clinical Practice of the Dental Hygienist*; Darby & Walsh *Dental Hygiene: Theory & Practice*;
  Malamed for local anesthesia; standard perio, radiology, pharmacology, and pathology texts).
- If a source item ever gets pasted in "to base a question on," **don't** — start from the concept
  and the reference instead.

## Item-writing standards
- Single best answer; **3–5 options; exactly one correct.** Others are plausible distractors.
- Format tag one of: `completion` · `question` · `negative`. For `negative`, capitalize EXCEPT/NOT
  in the stem.
- Stem is self-contained and tests one concept. Avoid "all of the above / none of the above."
- Keep options parallel in length and grammar; don't let the correct one be the giveaway-longest.
- **Rationale is mandatory:** explain why the key is correct **and** why each distractor is wrong.
- Cite a reference (text + topic/edition) in `reference`.
- Difficulty: `easy` / `medium` / `hard` (best guess; tune later from response data).

## Trick questions (`trick: true`)
The real exam sometimes tests careful reading as much as knowledge: two options that look almost
identical, or a stem where a single word (a negation, a qualifier like "always"/"initial"/"most",
a drug name one letter off) flips which option is keyed. Tag an item `trick: true` in frontmatter
when that's the actual skill being tested — **not** as a synonym for "hard." An item can be
`difficulty: easy` and still be a trick item if the concept is simple but the reading is the trap.
- Still Rule 0: an original trick item, never a remembered/reconstructed real one.
- The close options should be **substantively different** in truth value, not just wording — a
  distractor that's actually just as correct as the key isn't a trick question, it's a bad
  question. Keep exactly one best answer and write a real distractor rationale for the near-miss
  option explaining precisely what makes it wrong.
- Works with any `format` (completion/question/negative) — it's an orthogonal tag, not a fourth
  format.
- `trick: true` is opt-in per item; omit the field (or `trick: false`) for a normal item.
- The in-app indicator (Settings toggle, off by default) is a *study aid* — the real exam never
  flags these, so don't lean on it while practicing if you want a realistic read on your pacing.

## Taxonomy tagging
Use the exact `area` / `domain` / `subdomain` strings from `blueprint-mapping.md`. If something
doesn't fit, add it to the mapping first, then tag — never invent ad-hoc labels.

## Case & testlet authoring
- A case = original patient box (demographics, chief complaint, background/history, current
  findings) + optional media + 1..N linked items. Invent the patient; don't reuse real cases.
- Testlets (community health/research) = a scenario + a set of linked items, same rules.
- Media (charts/radiographs/photos): use your own or properly licensed/created images. Note the
  source in the media record.

## Review workflow
`draft` → `review` → `approved` → `live`. Nothing goes `live` without a second look for accuracy
and for Rule 0 compliance. Track status in each note's frontmatter (Dataview surfaces the queue).

## Quality bar per area (initial target)
Go **wide before deep**: a handful of solid items in every one of the 13 areas first, so the
practice/analytics loop is real, then deepen — Local Anesthesia and the high-item-count clinical
areas (Care Planning, Perio Management) get the most depth.
