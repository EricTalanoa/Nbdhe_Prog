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
- [x] **7c-topic-dashboard** — A `/settings` page with a toggle between two dashboard layouts,
  persisted per-account (new `profiles.dashboard_mode` column + migration, `'method' | 'topic'`,
  default `'method'`, so it syncs across devices like everything else). PR:
  https://github.com/EricTalanoa/Nbdhe_Prog/pull/53
  - **By study method** — today's `/dashboard` (Practice/Review/Exam groups), unchanged.
  - **By exam topic** — a grid of the **13 official blueprint score areas** (query `taxonomy`
    distinct `score_area` ordered by `sort_order`, the same pattern `/analytics` already uses —
    don't hardcode the list). Tapping a topic goes to a new `/topics/[slug]` page: an overview/
    notes section **first** (short original summary of the topic — reuse the `content-authoring-
    guidelines.md` Rule 0 standard: written from published references, never copied verbatim from
    a source text), **then** the study options for that topic below it (practice for that area —
    reuse `/practice/build` filtering; flashcards — reuse the `/review?set=` pattern from
    `lib/question-sets.ts`). Slugs can reuse/extend `lib/question-sets.ts` if it lines up, but the
    topic *list* itself must be the 13 taxonomy areas, not the 9 curated `/sets` groupings.
  - No images/diagrams required in this chunk — just ship the toggle + grid + topic-page
    structure (notes can be a short placeholder paragraph per topic to start). Depth (fuller notes
    + original diagrams) is the next chunk below.
  - Degrade gracefully if the migration isn't applied yet (default to method mode).
- [ ] **7d-topic-notes-depth** — Ongoing, one focused batch per run (same shape as 7b-bank-depth):
  deepen each `/topics/[slug]` overview with more substantive original notes, and add **original
  SVG diagrams/illustrations** (simple line-art — tooth anatomy, perio pocket-depth chart,
  radiographic landmarks, etc. — authored the same way as the PWA's SVG icons) where a visual
  clarifies the concept. **Images must be self-drawn SVG, never scraped/downloaded photos or
  textbook figures** — this app can't verify licensing on fetched images, and Rule 0's "own or
  properly licensed/created" bar (from `content-authoring-guidelines.md`'s case/media section)
  applies here too. Start with the 1-2 topics that benefit most from a diagram, not all 13 at once.
  - Batch 1 (this run): deepened the "Anatomic Sciences" and "Periodontal Disease Management"
    overview notes in `lib/topics.ts` with substantive original paragraphs (tooth layer
    histology/CEJ/root variation for the former; biofilm-driven host inflammatory response, the
    PD-vs-CAL distinction, and the nonsurgical→surgical→maintenance continuum for the latter), and
    added two hand-drawn SVG diagrams under `components/topics/`: `ToothAnatomyDiagram`
    (labeled enamel/dentin/pulp/cementum/CEJ/root-canal/apical-foramen cross-section) and
    `PerioPocketDiagram` (two-panel healthy-sulcus-vs-periodontal-pocket comparison contrasting
    probing depth, measured from the gingival margin, against clinical attachment level, measured
    from the fixed CEJ). Both use theme CSS-var Tailwind utilities (`fill-chart-4`,
    `fill-destructive`, `fill-secondary`, `fill-accent`, `stroke-foreground`, etc.) so they stay
    legible in light and dark mode; wired into `/topics/[slug]` via a new `TOPIC_DIAGRAMS` map in
    `lib/topics.ts`, rendered under the Overview note when a topic has one. Verified by rendering
    both components to static markup and screenshotting them against the project's actual
    compiled Tailwind CSS in light and dark mode (this container can't reach Supabase to
    click-test the live auth-gated page). Next batch: continue with 1-2 more topics (e.g.
    radiographic landmarks for Dental Radiography, or a caries-process diagram for Preventive
    Agents), then keep deepening notes for the rest.
- [ ] **7b-bank-depth** — Deepen the question bank across all 13 areas (wide → deep; Local
  Anesthesia gets extra depth), authored to the blueprint. Ongoing; one focused batch per run.
  Progress: bank now 92 questions (19 easy / 60 medium / 13 hard) + 3 cases + 11 flashcards.
  - Batch 22 (PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/50): rotated depth across Care Planning, Perio Management, and both
    Local-Anesthesia-tagged areas — q-plan-0025 (Care Planning/individualized patient education-
    instruction: oral conditions: dentin hypersensitivity management, potassium nitrate vs.
    stannous fluoride mechanism), q-perio-0024 (Perio Management/prescribed therapy-
    chemotherapeutic agents: systemic amoxicillin+metronidazole adjunct for Grade C
    periodontitis), q-anes-0020 (Scientific Basis/Pharmacology-Local Anesthesia: duration-of-
    action agent selection for a long procedure with postoperative coverage), q-anes-0021 (Care
    Planning/anxiety and pain control-local anesthesia: nonselective beta-blocker + epinephrine
    unopposed alpha-stimulation interaction) + 1 flashcard (fc-perio-0004, amoxicillin+
    metronidazole regimen). Bank now 158 questions + 5 cases + 23 flashcards.
  - Batch 21 (PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/48): rotated depth across Care Planning, Perio Management, and both
    Local-Anesthesia-tagged areas — q-anes-0018 (Care Planning/anxiety and pain control-local
    anesthesia: tricyclic antidepressant + epinephrine interaction, and why retraction cord is
    the item to avoid vs. standard cartridge concentrations), q-plan-0024 (Care
    Planning/infection control: percutaneous sharps-injury post-exposure protocol), q-perio-0023
    (Perio Management/etiology and pathogenesis: host inflammatory response as the direct driver
    of collagen/bone destruction vs. bacteria as initiator), q-anes-0019 (Scientific
    Basis/Pharmacology-Local Anesthesia: differential nerve fiber blockade order by fiber
    diameter/myelination) + 1 flashcard (fc-anes-0006, TCA-epinephrine interaction). Bank now 154
    questions + 5 cases + 22 flashcards.
  - Batch 20 (PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/47): rotated depth across all
    three highest-yield areas per the authoring guidelines — q-plan-0022 (recognition of emergency
    situations/anaphylaxis management: epinephrine IM, positioning, EMS), q-plan-0023 (anxiety and
    pain control-general/systematic desensitization vignette, distinguished from tell-show-do),
    q-perio-0022 (nonsurgical periodontal therapy/one-stage full-mouth disinfection vs. quadrant
    scaling), q-anes-0017 (local anesthesia/sodium bicarbonate buffering and its onset mechanism) +
    1 flashcard (fc-anes-0005, buffering). Bank now 150 questions + 5 cases + 21 flashcards.
  - Batch 19 (PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/46): 6th-pass depth on Perio Management's thinnest
    subdomains — q-perio-0019 (implant care/smoking as the strongest *modifiable* peri-implantitis
    risk factor, vs. history-of-periodontitis as a non-modifiable distractor), q-perio-0020
    (reassessment and evaluation/why CAL beats probing depth alone as an outcome measure — CEJ as
    fixed reference point vs. recession confounding pocket depth), q-perio-0021 (maintenance/
    risk-based recall interval shortening for a smoker with residual pockets) + 1 Local Anesthesia
    item on a topic not yet covered (q-anes-0016, prilocaine/articaine dose-dependent
    methemoglobinemia via the o-toluidine metabolite) + 1 flashcard (fc-perio-0003, peri-implantitis
    modifiable risk factor). Bank now 146 questions + 5 cases + 20 flashcards.
  - Batch 18 (PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/45): 5th-pass depth on the two highest-yield clinical areas per the authoring
    guidelines' "go deep" priority — 2 Perio Management items on subdomains that hadn't gone past
    2 items (q-perio-0017 chemotherapeutic agents/essential-oil mouthrinse mechanism vs.
    chlorhexidine substantivity, q-perio-0018 surgical support services/guided tissue regeneration
    membrane selective-repopulation principle), 2 Local Anesthesia items on topics not yet covered
    (q-anes-0014 Vazirani-Akinosi closed-mouth block for trismus, q-anes-0015 epinephrine dose
    ceiling in significant cardiovascular disease) + 1 flashcard (fc-anes-0004, cardiac
    epinephrine dose limit). Bank now 142 questions + 5 cases + 19 flashcards.
  - Batch 17 (PR: https://github.com/EricTalanoa/Nbdhe_Prog/pull/44): filled the last five 1-item subdomains in the bank — q-prev-0009 (Preventive
    Agents/other preventive agents, CPP-ACP remineralization), q-comm-0004 (Community Health/
    assessing-designing-implementing-evaluating community programs, needs-assessment-first
    sequencing), q-rsch-0005 (Research Principles/analyzing scientific literature, confounding
    variable), q-rsch-0006 (Research Principles/applying research results, the EBDM triad),
    q-supp-0008 (Supportive Treatment Services/emerging technologies, diode laser as a nonsurgical
    periodontal adjunct, negative format) + 1 flashcard (fc-rsch-0001, SnNout/SpPin mnemonics).
    Every domain/subdomain combination in the bank now has >=2 items (Physiology has no
    blueprint subdomains, so its 3 domain-level items are already full coverage). Bank now 138
    questions + 5 cases + 18 flashcards.
  - Batch 16 (PR #43): filled every remaining 1-item Dental Hygiene Care Planning subdomain to
    2+ items — 8 questions (q-plan-0014 infection control/Spaulding classification, q-plan-0015
    instruction: dental caries/fluoride "spit don't rinse", q-plan-0016 instruction: periodontal
    diseases/periodontitis vs. gingivitis irreversibility, q-plan-0017 treatment plan/
    re-evaluation appointment purpose, q-plan-0018 planning of individualized instruction/health
    literacy adaptation, q-plan-0019 diagnosis/human-needs diagnostic statement structure,
    q-plan-0020 case presentation/findings-before-treatment sequencing, q-anes-0013 anxiety and
    pain control-local anesthesia/ester-amide cross-sensitivity for topical selection) + 1
    flashcard (fc-plan-0002, Spaulding classification). Bank now 133 questions + 5 cases + 17
    flashcards. Every Dental Hygiene Care Planning subdomain now has >=2 items.
  - Batch 15 (PR #42): 2nd-pass depth on the last remaining 1-item subdomains across Anatomic
    Sciences, Dental Radiography, Patient Assessment, and Preventive Agents — 8 questions
    (q-anat-0007 dental anatomy general/lingual surface terminology, q-anat-0008 head and neck
    anatomy/lateral pterygoid-mandibular protrusion, q-radi-0009 emerging technologies/digital
    sensor dose and immediacy, q-radi-0010 recognition of normalities and abnormalities/periapical
    granuloma-cyst radiolucency, q-asmt-0009 head and neck examination/TMJ screening technique,
    q-asmt-0010 oral evaluation/recurrent aphthous ulcer, q-prev-0007 fluorides toxicology/
    certainly lethal dose, q-prev-0008 pit and fissure sealants/etch-contamination technique) + 1
    flashcard (fc-prev-0003, saliva contamination and sealant retention). Bank now 125 questions +
    5 cases + 16 flashcards.
  - Batch 14 (PR #40): +1 case (case-spec-0001, nonverbal adult with autism spectrum disorder —
    the first `special_needs` patient_type case) + 2 linked items (q-spec-0001: Dental Hygiene
    Care Planning/anxiety and pain control-general, tell-show-do behavior guidance for a nonverbal
    patient; q-spec-0002: Dental Hygiene Care Planning/individualized patient education-instruction:
    oral conditions, home-care adaptations for sensory sensitivity) + 1 flashcard (fc-plan-0001,
    tell-show-do). Fills the last 1-item "Anxiety and pain control — General" and "instruction:
    oral conditions" subdomains to 2 items each. Bank now 117 questions + 5 cases + 15 flashcards.
  - Batch 13 (PR #39): +1 case (case-geri-0001, geriatric patient with polypharmacy-related
    xerostomia and new root caries — the first `geriatric` patient_type case) + 2 linked items
    (q-geri-0001: Preventive Agents/Fluorides-methods of administration, prescription 5,000 ppm
    fluoride for root-caries risk; q-geri-0002: Dental Hygiene Care Planning/individualized patient
    education-dental caries, adapting hygiene instruction for reduced manual dexterity). Bank now
    115 questions + 4 cases + 14 flashcards.
  - Batch 1 (PR #16): 5 Local Anesthesia (q-anes-0004..0008).
  - Batch 2 (PR #20): 6 Care Planning + Perio (q-plan-0003..0006, q-perio-0006..0007).
  - Batch 3 (PR #22): 6 Radiography + Assessment (q-radi-0003..0005, q-asmt-0003..0005).
  - Batch 4 (PR #23): 8 items across Preventive/Professional/Supportive/Research (q-prev-0003..0004,
    q-prof-0003..0004, q-supp-0003..0004, q-rsch-0003, q-comm-0002) — ≥1 item in every score area.
  - Batch 5 (PR #26): +2 cases (case-pedo-0001 pediatric ECC, case-med-0001 anticoagulant/
    warfarin) + 4 linked items (q-pedo-0001..0002, q-med-0001..0002). Next: 2nd-pass depth on
    high-count areas + more cases.
  - Batch 6 (PR #28): 6 2nd-pass items on Care Planning + Perio Management, filling previously
    untouched subdomains (q-plan-0007..0009: instruction-periodontal-diseases, anxiety/pain
    control-general, treatment-plan sequencing; q-perio-0008..0010: surgical support services,
    reassessment and evaluation, a 2nd maintenance item).
  - Batch 7 (PR #32): 6 items rotating through under-covered Radiography/Assessment/Preventive
    Agents subdomains (q-radi-0006 emerging technologies/CBCT, q-radi-0007 2nd-pass
    radiophysics-contrast factors; q-asmt-0006 2nd-pass medical history/ASA classification,
    q-asmt-0007 2nd-pass periodontal evaluation/Glickman furcation; q-prev-0005 other preventive
    agents/SDF, q-prev-0006 2nd-pass fluoride mechanisms) + 1 flashcard (fc-prev-0002 SDF).
  - Batch 8 (PR #34): 8 items filling the thinnest Scientific Basis subdomains + a 3rd
    medically-compromised item (q-phar-0002 general pharmacology/antibiotic prophylaxis,
    q-micr-0002 microbiology/red complex, q-immu-0002 immunology/neutrophils, q-bioc-0003
    biochemistry/vitamin C-collagen, q-phys-0003 physiology/autonomic salivary control,
    q-path-0003 oral pathology/leukoplakia, q-anat-0004 dental anatomy general/CEJ, q-med-0003
    special-needs/diabetes-periodontal link). Bank now 84 questions (17 easy / 56 medium /
    11 hard) + 3 cases + 11 flashcards.
  - Batch 9 (PR #35): 2nd-pass depth on the last remaining 1-item subdomains across Scientific
    Basis and Research/Community (q-anat-0005 Histology and Embryology/root formation-
    cementogenesis, q-anat-0006 dental anatomy root/mandibular first molar roots, q-bioc-0004
    Nutrition/sugar frequency-Stephan curve, q-rsch-0004 statistical concepts/p-value
    interpretation, q-comm-0003 Community Health/Health Belief Model, q-path-0004 general
    pathology/hypersensitivity types, q-asmt-0008 occlusal evaluation/overjet, q-radi-0008
    radiologic health/personnel dosimeter). Every discipline subdomain now has >=2 items. Bank
    now 92 questions (19 easy / 60 medium / 13 hard) + 3 cases + 11 flashcards.
  - Batch 10 (PR #36): 3rd-pass depth on the high-yield areas called out in Next 3 actions — Local
    Anesthesia, Care Planning, Perio Management. 4 Care Planning items filled the last previously
    untouched subdomains (q-plan-0010 planning of individualized instruction, q-plan-0011
    instruction: oral conditions/xerostomia, q-plan-0012 treatment strategies-diagnosis,
    q-plan-0013 treatment strategies-case presentation/informed consent); 2 Local Anesthesia items
    (q-anes-0009 mechanism of action/sodium channel blockade, q-anes-0010 PSA block hematoma
    complication); 2 Perio Management items (q-perio-0011 locally delivered antimicrobials,
    q-perio-0012 red-complex etiology). Bank now 100 questions + 3 cases + 11 flashcards. Every
    Dental Hygiene Care Planning subdomain now has >=1 item.
  - Batch 11 (PR #37): 4th-pass depth on Perio Management + Local Anesthesia. 4 Perio Management
    items bring the last thin subdomains up to 2 items each (q-perio-0013 chemotherapeutic
    agents/host modulation-SDD, q-perio-0014 implant care/mucositis vs peri-implantitis,
    q-perio-0015 surgical support services/periodontal dressing purpose, q-perio-0016
    reassessment and evaluation/persistent-pocket referral); 2 Local Anesthesia items on topics
    not yet covered (q-anes-0011 mylohyoid accessory innervation/IANB failure, q-anes-0012 ester
    vs amide true-allergy mechanism); 2 flashcards (fc-perio-0002 host modulation, fc-anes-0003
    mylohyoid innervation). Bank now 106 questions + 3 cases + 13 flashcards.
  - Batch 12 (PR #38): Supportive Treatment Services + Professional Responsibility depth pass. 3
    Supportive Treatment Services items, including the domain's last uncovered subdomain
    (q-supp-0005 emerging technologies/glycine air polishing, q-supp-0006 properties and
    manipulation of materials/alginate setting time, q-supp-0007 impressions and study
    casts/disinfection); 4 Professional Responsibility items bringing every subdomain in the
    domain to 2 items (q-prof-0005 ethical principles/nonmaleficence, q-prof-0006 regulatory
    compliance/supervision levels, q-prof-0007 patient and professional communication/referral
    handoff, q-prof-0008 documentation and risk management/informed refusal); 1 flashcard
    (fc-supp-0001 glycine air polishing). Bank now 113 questions + 3 cases + 14 flashcards. Every
    Supportive Treatment Services and Professional Responsibility subdomain now has >=2 items
    (Supportive Treatment Services' "Emerging technologies" subdomain had 0 items before this
    batch).

  Features (not chunks): seafoam & white visual refresh (PR #24); pre-built topic sets `/sets` +
  subdomain filtering (PR #25); flashcard categories — study any topic set as flashcards
  (`/review?set=…`, PR #29); dedicated flashcards content type — `flashcards` +
  `flashcard_schedule` tables (migration `..._flashcards.sql`), `fc-*.md` importer support, 10
  authored cards, merged into `/review` with their own SM-2 schedule (PR #30). New migration +
  10 cards need a live apply/seed.

  Open item for a future batch: a Community Health testlet (scenario + linked items) is still
  unauthored — the `testlets` table exists (schema.md) and question notes already carry a
  `testlet` frontmatter field, but `scripts/import-questions.mjs` has no testlet parser/upsert
  yet and nothing wires a testlet's scenario into the practice-loop stimulus the way cases do.
  Authoring a testlet note before that plumbing exists would produce content the app can't
  serve, so this needs its own chunk (importer + practice-loop wiring) before/alongside content.
