---
updated: 2026-07-18
phase: 7 — Content scale-up + niceties (7a-review-tools + 7c-topic-dashboard merged; 7d topic-notes-depth ongoing, batch 3; 7b bank depth ongoing, batch 22)
---

# PROJECT_STATE — NBDHE Prep

> Living snapshot. Keep under 60 lines. Update the top 3 sections every session.
> This is the file you hand to Claude Code / Cowork so it doesn't re-read the whole vault.

## One-liner
A web + installable-PWA NBDHE prep app: full 2026 blueprint coverage, practice + timed mock
exams + cases + analytics, easy to use. Primary user: my girlfriend (accounts + backend so
progress syncs across her devices).

## Current phase
**Phase 7 — Review tools + content depth: 7a-review-tools merged (2026-07-13); 7c-topic-dashboard
merged (2026-07-17, PR #53).** `/settings` toggles `dashboard_mode` (`'method' | 'topic'`, new
`profiles.dashboard_mode` column + migration `20260717000002_dashboard_mode.sql`, needs a manual
SQL-editor apply like prior Phase 7 migrations — degrades to `'method'` until then). Topic mode
renders `/dashboard` as a grid of the live taxonomy score areas (same distinct-`score_area`-by-
`sort_order` query `/analytics` uses); each tile opens `/topics/[slug]` with a short original
overview (`lib/topics.ts`) then Practice/Flashcards links scoped to that area. **7d-topic-notes-
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
`PeriodontalChartingDiagram` and `NerveBlockLandmarksDiagram`. All six
diagrams are wired into `/topics/[slug]` via the `TOPIC_DIAGRAMS` map and use theme CSS-var
Tailwind utilities so they hold up in light and dark mode — verified by rendering each new diagram
to static SVG against the compiled Tailwind theme CSS and screenshotting in light/dark mode before
committing, which caught and fixed a caption overflow, a label collision, a viewBox-edge text clip,
and a leader line crossing its own label. Next: 6/13 topics have a diagram; pick 1-2 more from the
remaining topics (Physiology, Biochemistry and Nutrition, Microbiology and Immunology, Pathology,
Dental Hygiene Care Planning, Supportive Treatment Services, Professional Responsibility, Research
Principles and Community Health), then resume 7b-bank-depth. `/review` is an
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
Vault holds **158 questions** + **5 cases** (perio, pediatric ECC, anticoagulant, geriatric
xerostomia, special-needs autism) + **23 flashcards**.
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

## Next actions
1. **Continue 7d-topic-notes-depth** (ongoing, one focused batch per run, same shape as
   7b-bank-depth) — batch 1 (PR #55, merged) deepened "Anatomic Sciences" and "Periodontal
   Disease Management"; batch 2 (PR #56) deepened "Dental Radiography" and "Preventive
   Agents" with substantive notes + a `RadiographicLandmarksDiagram` and `CariesProcessDiagram`
   SVG each; batch 3 (this run, PR #57) deepened "Patient Assessment" (six-point periodontal
   probing, reading a probe's mm markings) and "Pharmacology" (LA sodium-channel blockade, IANB
   as the highest-yield injection) with a `PeriodontalChartingDiagram` and
   `NerveBlockLandmarksDiagram` (`components/topics/`, wired via `TOPIC_DIAGRAMS` in
   `lib/topics.ts`). Next batch: 6/13 topics now have a diagram — pick 1-2 more from the
   remaining topics (Physiology, Biochemistry and Nutrition, Microbiology and Immunology,
   Pathology, Dental Hygiene Care Planning, Supportive Treatment Services, Professional
   Responsibility, Research Principles and Community Health) and deepen notes for the ones
   without one yet.
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
   (4 questions + 1 flashcard, PR #48), and batch 22 (4 questions + 1 flashcard, PR #50) are
   authored in the vault, `content:check`-clean, but **not yet imported into the live Supabase
   project** (this container's egress blocks `*.supabase.co`, so `npm run content:import` can't
   run here — import from a machine with egress, or hand-seed via the SQL editor as batches 5/6
   were).
4. Rotate the Supabase `service_role` key (it was pasted into a chat on 2026-07-12 to seed the
   sample case). Note: this container's network egress blocks `*.supabase.co`, so
   `npm run content:import` can't run from Claude web sessions — apply migrations via the SQL
   editor and seed with SQL, or run the importer from a machine with egress.

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
