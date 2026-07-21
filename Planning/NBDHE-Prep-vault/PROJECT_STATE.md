---
updated: 2026-07-21
phase: 8 — Launch readiness (8a-signin-modal merged PR #66; 8b-dashboard-polish merged PR #67; 8c-injection-hardening merged PR #68; 8d-theme-toggle merged PR #69; 8e-progress-reset merged PR #70; 8f-content-thin-areas open, this run; 7d/7b ongoing in the background)
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 8 — Launch readiness (owner-requested, 2026-07-20), ahead of the ongoing 7b/7d depth
batches: 8a-signin-modal merged (PR #66) — the landing page's "Sign in"/"Start practicing" CTAs
open the magic-link form in a modal instead of navigating to `/login` (kept as a working fallback
route). 8b-dashboard-polish merged (PR #67) — `TopicTile` (by-exam-topic grid, shared with the
`/topics` index) gained a small per-area Lucide icon (`topicIcon()` lookup in `lib/topics.ts`,
generic fallback for an unmapped area); `/dashboard`'s header collapsed from two rows into one
toolbar row (title/email left, mode toggle + icon-only Settings/Sign-out right) with small spacing
bumps between sections — no new tiles, no migration. 8c-injection-hardening merged (PR #68) — a
full pre-launch security audit (RLS on all 12 tables, Supabase query construction, XSS
render paths, auth/session/magic-link flow, content importer) came back clean; fixed the two gaps
it found — `recordResponse`/`finishSession` (`app/practice/actions.ts`) now verify session
ownership and recompute correctness/score server-side instead of trusting client-supplied values
(closes a self-scoring integrity gap, not a cross-user leak — RLS already scoped everything to
`auth.uid()`), and `export-seed-sql.mjs`'s dollar-quote guard now also rejects content ending in a
trailing lone `$`. Added a baseline security-header set (CSP, X-Frame-Options, X-Content-Type-
Options, Referrer-Policy, Permissions-Policy, HSTS) via `next.config.mjs`, verified with a real
production build + headless-Chromium smoke test (caught a strict `script-src` breaking Next.js
App Router hydration before it shipped — kept `'unsafe-inline'` as a documented tradeoff, a
nonce-based CSP is a noted follow-up). 8d-theme-toggle open (this run) — `profiles.theme`
(migration `20260720000001_theme_preference.sql`, `'light' | 'dark' | 'system'`, default
`'system'`, degrades gracefully until applied) wires up the `.dark` HSL palette that already
existed in `app/globals.css`/`tailwind.config.ts` but was never toggled: a static inline
`ThemeScript` runs first in `<body>` to flip the `dark` class on `<html>` before paint (no
flash-of-wrong-theme), a `ThemeSync` mounted app-wide like `PwaManager` re-applies live on OS
theme changes and pulls a signed-in user's `profiles.theme` down as the account's source of truth
on mount, and a `/settings` 3-way Light/Dark/System toggle applies instantly client-side then
persists via a new `setTheme` server action. Verified with a real production build + a
headless-Chromium smoke test (forcing `localStorage` dark/light and reloading correctly toggled
the class + computed `--background` var before paint; `/settings` still auth-redirects; CSP/
security headers from 8c untouched, zero console errors). **8e-progress-reset open (this run)** —
a "Danger zone" card on `/topics/[slug]` (`components/topics/reset-progress.tsx`) two-step-confirms
(first click arms it, second deletes) then calls a new `resetTopicProgress` server action
(`app/topics/actions.ts`) that clears the signed-in user's own study history for that one topic:
`responses` for that topic's questions, any `sessions` left empty afterward (a session mixing this
topic with others, like a multi-area builder set or mock exam, keeps its other responses and isn't
deleted), `bookmarks`, `review_schedule`, and `flashcard_schedule` for that area's dedicated
flashcards — every delete additionally scoped to `eq("user_id", userId)`. `sessions`/`responses`
never had an owner-delete RLS policy (only select/insert/update); migration
`20260721000001_progress_reset_delete_policies.sql` adds one (manual apply pending, same pattern
as prior migrations) — until applied, deletes against those two tables are silently denied by RLS
(0 rows), so the action compares expected-vs-actual deleted counts and surfaces
`migrationPending: true` to the UI instead of falsely claiming a full reset (merged PR #70).
**8f-content-thin-areas open (this run)** — re-ranked all 14 score areas by item count after
batch 23's leveling pass; the four thinnest were Physiology (6), Biochemistry and Nutrition (6),
Microbiology and Immunology (6), and Pathology (7), well behind Periodontal Disease Management
(26) and Dental Hygiene Care Planning (40). Added 8 original questions (2 per area, all on
concepts not yet in the bank — trigeminal motor innervation of mastication, PTH's three
calcium-raising target-organ effects, vitamin A and epithelial keratinization, xylitol's
non-fermentable biochemistry, gram-negative LPS as the red complex's inflammatory trigger, a
neutrophil chemotaxis defect and aggressive periodontitis, Fordyce granules as a normal variant,
hyperplasia-vs-hypertrophy applied to drug-induced gingival enlargement) + 2 flashcards
(fc-phys-0001, fc-bioc-0001 — the bank's first flashcards for either domain). Physiology/
Biochemistry and Nutrition/Microbiology and Immunology now sit at 8 each, Pathology at 9. Bank
now **199 questions** + 10 cases + 27 flashcards. `npm run content:check` (199/199 notes) and
`npm run build` both pass. Next AUTOPILOT chunk: 8g-blueprint-audit.**

Phase 7 — Review tools + content depth: 7a-review-tools merged (2026-07-13); 7c-topic-dashboard
merged (2026-07-17, PR #53).** `/dashboard` renders the `dashboard_mode` (`'method' | 'topic'`,
`profiles.dashboard_mode` column + migration `20260717000002_dashboard_mode.sql`, needs a manual
SQL-editor apply like prior Phase 7 migrations — degrades to `'method'` until then) either as
today's Practice/Review/Exam groups or as a grid of the live taxonomy score areas (same
distinct-`score_area`-by-`sort_order` query `/analytics` uses); each topic tile opens
`/topics/[slug]` with a short original overview (`lib/topics.ts`) then Practice/Flashcards links
scoped to that area. **7f-topic-toggle-relocate + 7e-trick-questions (both requested directly by
the project owner, open in PR #58):** the method/topic toggle moved off `/settings` onto a
one-tap `ModeToggle` segmented control at the top of `/dashboard` (`app/dashboard/actions.ts`);
cases now show up under whichever topic their linked items most commonly belong to
(`caseTopicAreas()` in `lib/topics.ts`, since a case has no `score_area` of its own) as a "Cases in
this topic" section on `/topics/[slug]`; a standalone `/topics` index (shared `TopicGrid`) is
reachable from a new "Topic notes" tile in the dashboard's Review group for by-study-method users.
Separately, "trick" questions — items with deliberately close answer choices, or a single word
that flips the key — got a `questions.is_trick` + `profiles.show_trick_badge` migration
(`20260718000001_trick_questions.sql`, pending manual apply, degrades to `false`), `trick: true`
frontmatter support in the importer, a `/settings` toggle (off by default) that shows a "Trick"
badge on questions in practice/the question bank (never in `/mock`, to keep exam simulation
realistic), and a first content batch — one original trick item per score area (14, not the
often-quoted 13 — `Physiology` is its own reporting area too) spanning anatomy, physiology,
biochemistry, microbiology, pathology, pharmacology, assessment, radiography, care planning,
perio management, preventive agents, supportive services, professional responsibility, and
research/community health. Bank now **172 questions**. **7g-practice-ux (requested directly,
open):** a `PageHeader` `backHref="back"` sentinel (`components/ui/back-button.tsx`, calls
`router.back()`) on `/practice/build` and `/sets` so "change filters"/"all sets" mid-flow doesn't
strand you away from an in-progress set; `PracticeSession` gained a "Skip for now" button (defers
the current question to the end of a local reorderable queue, `index`/`results` untouched) and an
always-available "End set now" (previously timed-tests-only) so an untimed set can end early too.
**7d-topic-notes-
depth (ongoing):** batch 1 (PR #55, merged) deepened the "Anatomic Sciences" and "Periodontal
Disease Management" overview notes with substantive original paragraphs, and added two hand-drawn
SVG diagrams under `components/topics/` — `ToothAnatomyDiagram` (enamel/dentin/pulp/cementum/CEJ
cross-section) and `PerioPocketDiagram` (healthy-sulcus vs. periodontal-pocket, PD vs. CAL). Batch
2 (PR #56) deepened the "Dental Radiography" and "Preventive Agents" overview notes
(ALARA + kVp/mA-time technique tradeoffs and the mental-foramen-vs-periapical-lesion reading
pitfall; the demineralization/remineralization cycle, critical pH ~5.5, and fluoride's three
protective mechanisms) and added two more diagrams — `RadiographicLandmarksDiagram` (mental
foramen vs. periapical lesion) and `CariesProcessDiagram` (demin/remin ion exchange). Batch 3
(this run, PR #57) deepened "Patient Assessment" (six-point periodontal probing — facial DB/B/MB,
lingual DL/L/ML — and reading a probe's mm markings against the gingival margin) and
"Pharmacology" (LA sodium-channel blockade, differential nerve-fiber blockade order,
vasoconstrictor tradeoffs, and the IANB as the most commonly tested injection), adding
`PeriodontalChartingDiagram` and `NerveBlockLandmarksDiagram`. Batch 4 (this run, PR #59) deepened
"Biochemistry and Nutrition" (the Stephan curve — plaque pH vs. time after a sugar exposure,
critical pH ~5.5, why exposure frequency beats total sugar quantity, plus vitamin C's role in
collagen hydroxylation) and "Microbiology and Immunology" (dental plaque biofilm as an ordered
succession: acquired pellicle → early streptococcal colonizers → Fusobacterium-mediated
coaggregation → a mature biofilm's oxygen gradient concentrating the anaerobic red complex
deepest in the pocket), adding `StephanCurveDiagram` and `BiofilmFormationDiagram`. All eight
diagrams are wired into `/topics/[slug]` via the `TOPIC_DIAGRAMS` map and use theme CSS-var
Tailwind utilities so they hold up in light and dark mode — verified by rendering each new diagram
to static SVG against the compiled Tailwind theme CSS and screenshotting in light/dark mode before
committing, which caught and fixed a caption overflow, a label collision, viewBox-edge/overlap
text clips, and a leader line crossing its own label. Next: 8/13 topics have a diagram; pick 1-2
more from the remaining topics (Physiology, Pathology, Dental Hygiene Care Planning, Supportive
Treatment Services, Professional Responsibility, Research Principles and Community Health), then
resume 7b-bank-depth. `/review` is an
SM-2-lite spaced-repetition flashcard queue (`lib/srs.ts`): pulls due + new cards, flip to reveal
the correct answer + rationale, self-grade Again/Hard/Good/Easy to reschedule `due_at`; a "report
a problem" form files a `question_reports` row. Migration `20260713000001_review_tools.sql`
(`review_schedule` + `question_reports`, owner-only RLS) is **applied to the live project
(2026-07-13)**, so `/review` persists schedules and error reports. Dashboard links "Flashcard
review". **7b (ongoing)** — 10 batches (b1 LA PR#16, b2 Care Planning/Perio PR#20, b3 Radiography/
Assessment PR#22, b4 Preventive/Professional/Supportive/Research PR#23, b5 +2 cases + 4 linked
items PR#26, b6 2nd-pass Care Planning/Perio subdomains PR#28, b7 2nd-pass Radiography/Assessment/
Preventive Agents + 1 flashcard PR#32, b8 Pharmacology/Microbiology/Immunology/Biochemistry/
Physiology/Pathology/Anatomy/medically-compromised PR #34, b9 2nd-pass on the last remaining
1-item subdomains — Anatomic Sciences (root formation/cementogenesis, mandibular molar roots),
Biochemistry and Nutrition (sugar-frequency/Stephan curve), Research Principles (p-value
interpretation), Community Health (Health Belief Model), Pathology (hypersensitivity types),
Patient Assessment (overjet), Dental Radiography (personnel dosimeter) — PR #35, b10 3rd-pass on
Local Anesthesia/Care Planning/Perio Management — 4 Care Planning items filling the last untouched
subdomains (planning of individualized instruction, instruction: oral conditions, treatment
strategies-diagnosis, treatment strategies-case presentation), 2 Local Anesthesia (mechanism of
action, PSA-block hematoma), 2 Perio Management (locally delivered antimicrobials, red-complex
etiology) — PR #36; b11 4th-pass on Perio Management/Local Anesthesia — 4 Perio Management items
filling the last thin subdomains to 2 items each (chemotherapeutic agents/host modulation, implant
care/mucositis vs peri-implantitis, surgical support services/dressing purpose, reassessment/
persistent-pocket referral), 2 Local Anesthesia (mylohyoid accessory innervation, ester-vs-amide
allergy), 2 flashcards (host modulation, mylohyoid innervation) — PR #37; b12 Supportive Treatment
Services + Professional Responsibility depth pass — 3 Supportive Treatment Services items
including the domain's last uncovered subdomain (emerging technologies/glycine air polishing,
properties and manipulation of materials/alginate setting time, impressions and study
casts/disinfection), 4 Professional Responsibility items bringing every subdomain to 2 items
(ethical principles/nonmaleficence, regulatory compliance/supervision levels, patient and
professional communication/referral handoff, documentation and risk management/informed refusal),
1 flashcard (glycine air polishing) — PR #38; b13 — the first `geriatric`-type case,
`case-geri-0001` (polypharmacy-related xerostomia + new root caries) with 2 linked items
(q-geri-0001 Preventive Agents/fluoride methods of administration — prescription 5,000 ppm
toothpaste for root-caries risk; q-geri-0002 Dental Hygiene Care Planning/individualized patient
education-dental caries — adapting hygiene instruction for reduced manual dexterity) — PR #39; b14
— the first `special_needs`-type case, `case-spec-0001` (nonverbal adult with autism spectrum
disorder) with 2 linked items (q-spec-0001 Dental Hygiene Care Planning/anxiety and pain
control-general — tell-show-do behavior guidance; q-spec-0002 Dental Hygiene Care
Planning/individualized patient education-instruction: oral conditions — home-care adaptations for
sensory sensitivity) + 1 flashcard (fc-plan-0001, tell-show-do), filling the last two 1-item
Care Planning subdomains to 2 items each); b15 — 2nd-pass depth on the last remaining 1-item
subdomains in Anatomic Sciences, Dental Radiography, Patient Assessment, and Preventive Agents:
q-anat-0007 (dental anatomy general/lingual surface terminology), q-anat-0008 (head and neck
anatomy/lateral pterygoid-mandibular protrusion), q-radi-0009 (emerging technologies/digital
sensor dose + immediacy), q-radi-0010 (recognition of normalities and abnormalities/periapical
granuloma-cyst radiolucency), q-asmt-0009 (head and neck examination/TMJ screening technique,
negative format), q-asmt-0010 (oral evaluation/recurrent aphthous ulcer), q-prev-0007 (fluorides
toxicology/certainly lethal dose), q-prev-0008 (pit and fissure sealants/etch-contamination
technique, negative format) + 1 flashcard (fc-prev-0003, saliva contamination and sealant
retention) — PR #42; b16 — filled every remaining 1-item Dental Hygiene Care Planning subdomain to
2+ items: 8 questions (q-plan-0014 infection control/Spaulding classification, q-plan-0015
instruction: dental caries/fluoride "spit don't rinse", q-plan-0016 instruction: periodontal
diseases/periodontitis vs. gingivitis irreversibility, q-plan-0017 treatment plan/re-evaluation
appointment purpose, q-plan-0018 planning of individualized instruction/health literacy
adaptation, q-plan-0019 diagnosis/human-needs diagnostic statement structure, q-plan-0020 case
presentation/findings-before-treatment sequencing, q-anes-0013 anxiety and pain control-local
anesthesia/ester-amide cross-sensitivity for topical anesthetic selection) + 1 flashcard
(fc-plan-0002, Spaulding classification) — PR #43; b17 — filled the last five 1-item subdomains
anywhere in the bank: q-prev-0009 (Preventive Agents/other preventive agents, CPP-ACP
remineralization mechanism), q-comm-0004 (Community Health/assessing-designing-implementing-
evaluating community programs, needs-assessment-first planning sequence), q-rsch-0005 (Research
Principles/analyzing scientific literature, confounding variable), q-rsch-0006 (Research
Principles/applying research results, the evidence-based-decision-making triad), q-supp-0008
(Supportive Treatment Services/emerging technologies, diode laser as a nonsurgical periodontal
adjunct, negative format) + 1 flashcard (fc-rsch-0001, SnNout/SpPin mnemonics) — PR #44; b18 —
5th-pass depth on the two highest-yield clinical areas: 2 Perio Management items on subdomains
that hadn't gone past 2 items (q-perio-0017 chemotherapeutic agents/essential-oil mouthrinse
mechanism vs. chlorhexidine substantivity, q-perio-0018 surgical support services/guided tissue
regeneration membrane selective-repopulation principle), 2 Local Anesthesia items on topics not
yet covered (q-anes-0014 Vazirani-Akinosi closed-mouth block for trismus, q-anes-0015 epinephrine
dose ceiling in significant cardiovascular disease) + 1 flashcard (fc-anes-0004, cardiac
epinephrine dose limit) — PR #45; b19 — 6th-pass depth on Perio Management's thinnest
subdomains: q-perio-0019 (implant care/smoking as the strongest *modifiable* peri-implantitis
risk factor), q-perio-0020 (reassessment and evaluation/CAL vs. probing depth as the reliable
outcome measure), q-perio-0021 (maintenance/risk-based recall shortening for a smoker with
residual pockets), 1 Local Anesthesia item on a previously uncovered topic (q-anes-0016,
prilocaine/articaine dose-dependent methemoglobinemia) + 1 flashcard (fc-perio-0003,
peri-implantitis modifiable risk factor) — PR #46; b20 — rotated depth across all three
highest-yield areas per the authoring guidelines (every subdomain bank-wide already had ≥2 items,
so this batch pushed a few of the thinnest ones to the next pass): q-plan-0022 (recognition of
emergency situations/anaphylaxis management — epinephrine IM in the anterolateral thigh,
positioning, EMS activation), q-plan-0023 (anxiety and pain control-general/systematic
desensitization vignette, distinguished from the already-covered tell-show-do), q-perio-0022
(nonsurgical periodontal therapy/one-stage full-mouth disinfection vs. traditional quadrant
scaling and root planing), q-anes-0017 (local anesthesia/sodium bicarbonate buffering and its
onset-speed mechanism) + 1 flashcard (fc-anes-0005, buffering mechanism) — PR #47; b21 — rotated
depth across Care Planning, Perio Management, and both Local-Anesthesia-tagged areas:
q-anes-0018 (Care Planning/anxiety and pain control-local anesthesia — tricyclic antidepressant +
epinephrine interaction, standard cartridge concentrations vs. epinephrine-impregnated retraction
cord), q-plan-0024 (Care Planning/infection control — percutaneous sharps-injury post-exposure
protocol), q-perio-0023 (Perio Management/etiology and pathogenesis — host inflammatory response
as the direct driver of collagen/bone destruction, bacteria as initiator only), q-anes-0019
(Scientific Basis/Pharmacology-Local Anesthesia — differential nerve fiber blockade order by
fiber diameter/myelination) + 1 flashcard (fc-anes-0006, TCA-epinephrine interaction) — PR #48;
b22 — continued rotating depth across Care Planning, Perio Management, and both
Local-Anesthesia-tagged areas: q-plan-0025 (individualized patient education-instruction: oral
conditions — dentin hypersensitivity management, potassium nitrate vs. stannous fluoride
mechanism), q-perio-0024 (prescribed therapy-chemotherapeutic agents — systemic
amoxicillin+metronidazole adjunct for Grade C periodontitis), q-anes-0020 (Scientific
Basis/Pharmacology-Local Anesthesia — duration-of-action agent selection, bupivacaine for a long
procedure with postoperative coverage), q-anes-0021 (Care Planning/anxiety and pain
control-local anesthesia — nonselective beta-blocker + epinephrine unopposed alpha-stimulation
interaction, distinguished from the previously-covered TCA interaction) + 1 flashcard
(fc-perio-0004, amoxicillin+metronidazole regimen) — PR #50.
Vault holds **172 questions** (158 + 14 trick-question batch, 7e) + **5 cases** (perio, pediatric
ECC, anticoagulant, geriatric xerostomia, special-needs autism) + **23 flashcards**.
Every domain/subdomain combination in the bank now has ≥2 items (Physiology has no blueprint
subdomains, so its 3 domain-level items already represent full coverage; Supportive Treatment
Services' "Emerging technologies" subdomain had 0 items before batch 12). Also shipped (features, not
chunks): seafoam & white visual refresh (PR #24); topic sets `/sets` + subdomain filter (PR #25);
flashcard categories — study a topic set as flashcards (PR #29); **dedicated flashcards** — a
`flashcards` content type (term→concept) with its own SM-2 schedule, `fc-*.md` importer support,
and 10 authored cards merged into `/review` (PR #30). **Last confirmed seeded to live
(2026-07-13): 70 questions / 3 cases / 10 flashcards** (flashcards migration
`20260713000002_flashcards.sql` applied; batch-6 questions + `fc-*` cards seeded via SQL editor).
**Batches 7-21 (6 questions + 1 flashcard, then 8, then 8, then 8, then 6 questions + 2 flashcards,
then 7 questions + 1 flashcard, then 1 case + 2 questions, then 1 case + 2 questions + 1 flashcard,
then 8 questions + 1 flashcard, then 8 questions + 1 flashcard, then 5 questions + 1 flashcard,
then 4 questions + 1 flashcard, then 4 questions + 1 flashcard, then 4 questions + 1 flashcard)
are authored in the vault but not yet seeded to live** — see Next 3 actions.

Phase 6 (mock exam + PWA) is complete. `/mock` runs a
format-accurate mock: Component A (discipline items) → optional break → Component B (case-based,
`PatientBox` pinned above each) → results, each section on a per-item countdown (`lib/mock.ts`)
that auto-advances at zero; finishes with overall %, a readiness band, and per-component +
per-score-area breakdowns (persists a `mock`-kind session). 6b-pwa makes the app installable:
`app/manifest.ts` (standalone, SVG icons), a dependency-free `public/sw.js` (cache-first static,
network-first navigations with an `/offline` fallback), a `PwaManager` that registers the SW and
shows an install prompt, theme-color + apple-web-app metadata in the root layout, and the PWA
assets allowlisted in the auth middleware. Runtime-verified locally: `/manifest.webmanifest`,
`/sw.js` (correct MIME), `/icon.svg`, `/offline` all serve public while `/dashboard` still
auth-redirects. **Next: Phase 7** (content depth + review tools). NBDHE app is feature-complete
through Phase 6.

Phase 5 (cases & testlets) is complete and live-verified: `cases`/`testlets`/
`case_media` tables exist (RLS matching other content tables) with `questions.case_id`/
`testlet_id` now real FKs. The vault import pipeline parses `case-*.md` notes and resolves a
question's `case: <slug>` frontmatter into `case_id`, validated offline in `content:check`. A
read-only `PatientBox` component + `/cases` and `/cases/[slug]` pages are live (auth-gated,
linked from the dashboard), and `/cases/[slug]` now has a "Start case" button. `/practice?case=
<slug>` (5b-case-nav, PR #11) plays a case's linked approved items in slug order as a `case`-kind
session, with `PatientBox` rendered as a persistent stimulus above every item via a new
`stimulus` prop on `PracticeSession` — answering, flagging, and response recording all reuse the
existing practice-loop machinery unchanged. One original sample case (`case-perio-0001`, Rule 0)
with two linked items is authored. **Live-verified (2026-07-13):** migration
`20260712000002_cases_testlets.sql` is applied to the live project and the sample case is seeded —
confirmed `cases`=1, case-linked `questions`=2, total `questions`=35, so `/cases` and
`/practice?case=case-perio-0001` now run against real data.

Phase 4 (analytics + readiness) is complete: `/analytics` computes, from the user's `responses`
joined through `questions.taxonomy_id → taxonomy.score_area`: overall accuracy, a weakest-areas
ranking, a per-score-area readiness band (Not yet / Approaching / Ready) with coverage % + recent
accuracy, "Study next" suggestions that deep-link into a filtered practice set, and a per-day
accuracy trend — all dependency-free CSS. Readiness thresholds are tunable in `lib/readiness.ts`.
Phase 3 is complete: `/practice/build` (area/difficulty/N/time-limit) plus
`/practice?mode=missed|flagged` review queues and `/practice?t=<secs>` timed tests. Phase 1
(content) and Phase 2 (renderer + session/response tracking) are confirmed working against the live
Supabase project (`NBDHE-Prep`, `otqwhkfhjhixzjtaxhzk`):
- Both pending migrations (`..._seed_taxonomy.sql`, `..._sessions_responses.sql`) are applied.
- `npm run content:import` ran against the live project: `questions` (33), `options` (132),
  `rationales` (33), `taxonomy` (60) all populated from `02-Content/q-*.md`.
- The Vercel production deployment is built from `main` @ `820661a` (`nbdhe-prog.vercel.app`).
  `/questions` and `/practice` are live and correctly auth-gate (redirect to `/login`).
- A real practice run persisted: a `sessions` row (kind `practice`, `finished_at` +
  `score_summary` set) with a matching `responses` row — confirming the owner-only RLS write
  path works end-to-end on the deployed app, not just in code.
- Content triage done (2026-07-12): all 33 authored items reviewed for accuracy + Rule 0 and
  promoted `review` → `approved` (frontmatter + live `questions.status`).
- Cases live (2026-07-12): `20260712000002_cases_testlets.sql` applied and `case-perio-0001` +
  its 2 linked items seeded — live now holds 35 questions, 1 case, 2 case-linked questions.

0. **PR #58 merged; both migrations applied live** (`20260717000002_dashboard_mode.sql` and
   `20260718000001_trick_questions.sql`). `npm run content:import` was run locally to seed the 172
   questions (hit a `service_role` key masking issue mid-troubleshooting — the JWT secret was
   rotated as part of resolving it — last known state was re-running the import with the freshly
   rotated key; **confirm the run actually finished clean** and that `questions` shows 172 rows
   with the 14 `is_trick=true` items live). Once confirmed, click-test: the `ModeToggle` at the top
   of `/dashboard` switches layouts; a topic with a linked case (e.g. Preventive Agents or Dental
   Hygiene Care Planning, via `case-geri-0001`) shows a "Cases in this topic" section; toggling
   "Trick-question indicator" on in `/settings` shows the amber "Trick" badge in `/practice`/
   `/questions` (never `/mock`); on `/practice`, "change filters"/"all sets" now has a real Back
   button (`/practice/build`, `/sets`) instead of dumping you at `/dashboard`; and a practice
   session shows "Skip for now" + "End set now".
0.5. **Case media (charts/radiographs/photos) — still not started.** All 5 cases
   (`case-perio-0001`, `case-pedo-0001`, `case-med-0001`, `case-geri-0001`, `case-spec-0001`) have
   zero `case_media` rows; the importer has no media-authoring path (schema.md: "add via Supabase
   Storage + a manual insert once a case needs it"), and `PatientBox`/`/cases/[slug]` already
   render `media` whenever rows exist. This needs, in order: (1) a Supabase Storage bucket (public
   read) — not created yet, matching the still-open board.md backlog item; (2) real, properly
   licensed/owned images per Rule 0 (own clinical photos with identifiers removed, or licensed
   educational dental photography — never AI-fabricated or scraped) for the concepts the project
   owner was given directly in-conversation on 2026-07-18 (periodontal charting + generalized
   erythema/calculus + a bone-loss radiograph for the perio case; white-spot lesions/early
   cavitation on the maxillary primary incisors for the pedo case; heavy bleeding on
   probing/subgingival calculus for the anticoagulated case; root-surface caries + xerostomia signs
   for the geriatric case; generalized marginal inflammation for the special-needs case); (3)
   upload + insert `case_media` rows (`case_id`, `kind`, `storage_path`, `caption`, `sort_order`).
1. **Continue 7d-topic-notes-depth** (ongoing, one focused batch per run, same shape as
   7b-bank-depth) — batch 1 (PR #55, merged) deepened "Anatomic Sciences" and "Periodontal
   Disease Management"; batch 2 (PR #56) deepened "Dental Radiography" and "Preventive
   Agents" with substantive notes + a `RadiographicLandmarksDiagram` and `CariesProcessDiagram`
   SVG each; batch 3 (PR #57) deepened "Patient Assessment" (six-point periodontal probing,
   reading a probe's mm markings) and "Pharmacology" (LA sodium-channel blockade, IANB as the
   highest-yield injection) with a `PeriodontalChartingDiagram` and `NerveBlockLandmarksDiagram`;
   batch 4 (this run, PR #59) deepened "Biochemistry and Nutrition" (the Stephan curve, vitamin
   C/collagen hydroxylation) and "Microbiology and Immunology" (dental plaque biofilm formation
   as an ordered succession, ending in the anaerobic red complex deepest in the pocket) with a
   `StephanCurveDiagram` and `BiofilmFormationDiagram` (`components/topics/`, wired via
   `TOPIC_DIAGRAMS` in `lib/topics.ts`). Next batch: 8/13 topics now have a diagram — pick 1-2
   more from the remaining topics (Physiology, Pathology, Dental Hygiene Care Planning,
   Supportive Treatment Services, Professional Responsibility, Research Principles and Community
   Health) and deepen notes for the ones without one yet.
2. Resume **7b-bank-depth** (ongoing) after 7d batches — keep deepening the bank, one focused
   batch/run. Batch 22 rotated depth across Care Planning (instruction: oral conditions/dentin
   hypersensitivity management; anxiety and pain control-local anesthesia/beta-blocker +
   epinephrine interaction), Perio Management (chemotherapeutic agents/systemic
   amoxicillin+metronidazole adjunct), and Local Anesthesia (duration-of-action agent selection)
   — every subdomain bank-wide already has ≥2 items, so future batches keep pushing the thinnest
   ones to the next pass. A Community Health testlet is still the next *new* content type, but
   that needs its own infra chunk first (`scripts/import-questions.mjs` has no testlet
   parser/upsert yet, and no UI wires a testlet's scenario into the practice-loop stimulus the way
   `PatientBox` does for cases — see AUTOPILOT.md's open item). Otherwise, keep rotating depth
   through the highest-yield clinical areas (Local Anesthesia, Care Planning, Perio Management)
   and keep authoring dedicated flashcards (`fc-*.md`) alongside questions. Also: apply batches
   7-22 content live (see #3 below).
3. Batch 7 (6 questions + 1 flashcard, PR #32), batch 8 (8 questions, PR #34), batch 9
   (8 questions, PR #35), batch 10 (8 questions, PR #36), batch 11 (6 questions + 2
   flashcards, PR #37), batch 12 (7 questions + 1 flashcard, PR #38), batch 13 (1 case + 2
   questions, PR #39), batch 14 (1 case + 2 questions + 1 flashcard, PR #40), batch 15
   (8 questions + 1 flashcard, PR #42), batch 16 (8 questions + 1 flashcard, PR #43), batch 17
   (5 questions + 1 flashcard, PR #44), batch 18 (4 questions + 1 flashcard, PR #45), batch 19
   (4 questions + 1 flashcard, PR #46), batch 20 (4 questions + 1 flashcard, PR #47), batch 21
   (4 questions + 1 flashcard, PR #48), batch 22 (4 questions + 1 flashcard, PR #50), and the
   7e trick-question batch (14 questions, PR #58) are authored in the vault, `content:check`-clean,
   but **not yet imported into the live Supabase project** (this container's egress blocks
   `*.supabase.co`, so `npm run content:import` can't run here — import from a machine with
   egress, or hand-seed via the SQL editor as batches 5/6 were; the 7e batch also needs the
   `is_trick` column from `20260718000001_trick_questions.sql` applied first).
4. ~~Rotate the Supabase `service_role` key~~ — **done 2026-07-18** (JWT secret rolled from the
   Supabase dashboard, which regenerates both `anon` and `service_role`; the old key from the
   2026-07-12 chat exposure — and a second masked-paste incident on 2026-07-18 — is invalidated).
   Rotating signs out any active sessions (magic-link re-login only, no data loss); `.env.local`
   was updated with the new `anon` key. Note: this container's network egress still blocks
   `*.supabase.co`, so `npm run content:import` can't run from Claude web sessions — apply
   migrations via the SQL editor and seed with SQL, or run the importer from a machine with
   egress.

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
