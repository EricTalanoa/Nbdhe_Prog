# Blueprint Mapping — 2026 NBDHE → App Taxonomy

Source: *NBDHE 2026 Candidate Guide* (JCNDE, updated 12/15/2025).
This is the authoritative taxonomy. The `taxonomy` DB table is seeded from this file, and every
question note's frontmatter must use these exact `area` / `domain` / `subdomain` strings.

## Which spec we target
The guide publishes **two** specs: "Prior to Update" and "After Update" (update anticipated
**~October 2026**). We build to the **After Update** spec because the app targets the 2026 exam
and beyond, and because it breaks out **Local Anesthesia** as its own subdomain (this was the
under-served niche worth emphasizing). We keep a `spec_version` field on taxonomy rows so we can
support the pre-update spec too if a candidate tests before the switchover.

## Structure at a glance
- **Discipline-Based Component — 200 items** (3 areas)
- **Case-Based Component — 150 items** (12–15 patient cases, ~75 items/session)
- Total: **350 items.** Scale score 49–99; **75 = pass**. Pass/fail only, no guessing penalty.
- Remediation feedback is reported at the **overall level, the 13 discipline areas, and the case
  area.** So analytics should be able to roll up to those 13 areas (see "Score areas" below).

---

## Component A — Discipline-Based (200 items)

### Area 1 — Scientific Basis for Dental Hygiene Practice (56 items)
- **Anatomic Sciences**
  - Anatomy — Head and neck anatomy
  - Anatomy — Dental anatomy (general)
  - Anatomy — Dental anatomy (root)
  - Histology and Embryology
- **Physiology**
- **Biochemistry and Nutrition**
  - Biochemistry
  - Nutrition
- **Microbiology and Immunology**
  - Microbiology
  - Immunology
- **Pathology**
  - General pathology
  - Oral pathology
- **Pharmacology**
  - Local Anesthesia   ← newly broken out; emphasize
  - General pharmacology

### Area 2 — Provision of Clinical Dental Hygiene Services (124 items)
- **Patient Assessment**
  - Medical and dental history
  - Head and neck examination
  - Periodontal evaluation
  - Oral evaluation
  - Occlusal evaluation
- **Dental Radiography**
  - Principles of radiophysics and radiobiology
  - Principles of radiologic health
  - Technique
  - Recognition of normalities and abnormalities
  - Emerging technologies
- **Dental Hygiene Care Planning**
  - Infection control (application)
  - Recognition of emergency situations and provision of appropriate care
  - Individualized patient education — planning of individualized instruction
  - Individualized patient education — instruction: dental caries
  - Individualized patient education — instruction: periodontal diseases
  - Individualized patient education — instruction: oral conditions
  - Anxiety and pain control — Local anesthesia
  - Anxiety and pain control — General (e.g., relaxation techniques)
  - Recognition and management of patients with special needs
  - Treatment strategies — Diagnosis
  - Treatment strategies — Treatment plan
  - Treatment strategies — Case presentation
- **Periodontal Disease Management**
  - Etiology and pathogenesis of periodontal diseases
  - Prescribed therapy — Nonsurgical periodontal therapy
  - Prescribed therapy — Surgical support services
  - Prescribed therapy — Chemotherapeutic agents
  - Prescribed therapy — Implant care
  - Reassessment and evaluation
  - Maintenance
- **Preventive Agents**
  - Fluorides — Mechanisms of action
  - Fluorides — Toxicology
  - Fluorides — Methods of administration
  - Pit and fissure sealants
  - Other preventive agents (e.g., emerging materials)
- **Supportive Treatment Services**
  - Properties and manipulation of materials
  - Polishing natural and restored teeth
  - Making of impressions and preparation of study casts
  - Emerging technologies
- **Professional Responsibility**
  - Ethical principles
  - Regulatory compliance
  - Patient and professional communication
  - Documentation and risk management

### Area 3 — Research Principles and Community Health (20 items)
- **Research Principles**
  - Analyzing scientific literature
  - Understanding statistical concepts
  - Applying research results
- **Community Health**
  - Promoting health and preventing disease within groups
  - Assessing, designing, implementing, and evaluating community programs
- Delivered in **testlet** format (case study/problem + a set of linked items).

---

## Component B — Case-Based (150 items)

12–15 patient cases; adult and child; may be geriatric, adult-periodontal, pediatric,
special-needs, medically compromised, etc. Each case presents a **patient box**, and may include
**dental charts, radiographs, and clinical photographs**. Items under a case draw from these areas:
- Patient assessment
- Dental radiography
- Dental hygiene care planning
- Periodontal disease management
- Preventive agents
- Supportive treatment services
- Professional responsibility

Implication: a `case` is a parent object with structured patient-box data + media, and 1..N child
questions linked to it. Same for community-health `testlet`s.

---

## Score areas (for analytics roll-up)
Official remediation feedback is given for **13 discipline areas + the case area**. Map the app's
progress dashboard to these buckets so a candidate's weak-area view mirrors the real score report:

Scientific Basis (6): Anatomic Sciences · Physiology · Biochemistry & Nutrition ·
Microbiology & Immunology · Pathology · Pharmacology.
Clinical Services (7): Patient Assessment · Dental Radiography · Dental Hygiene Care Planning ·
Periodontal Disease Management · Preventive Agents · Supportive Treatment Services ·
Professional Responsibility.
→ That's the 13. Research Principles & Community Health + the Case component report separately.
(If JCNDE's published 13-area list differs slightly, adjust here first — this file is the source
of truth and the taxonomy table reseeds from it.)

## Item formats to support
- **Completion** — stem completes a concept.
- **Question** — direct question stem.
- **Negative** — stem contains EXCEPT / NOT (capitalized). Renderer should visually flag these.
- All are single-best-answer MCQ with **3–5 options, exactly one correct**.
- **Case-linked** and **testlet-linked** items share a parent stimulus.

## Tooth notation
Universal/National system: permanent 1–32, primary A–T. Any charting UI uses this.

---

## Audit log

### 2026-07-21 — blueprint drift audit (8g-blueprint-audit)
This environment's egress policy blocks `jcnde.ada.org` (same restriction already noted elsewhere
in the project for `*.supabase.co` and `open-exam-prep.com`), so the primary 2026 Candidate Guide
PDF couldn't be fetched directly. Cross-checked this file's claims against public search-indexed
snippets of the same guide and independent NBDHE prep sources instead. Confirmed, no drift:
- Component item counts: 56 (Scientific Basis) + 124 (Clinical Services) + 20 (Research/Community
  Health) = 200 discipline-based, + 150 case-based = **350 total**. Matches this file exactly.
- **After Update** spec (effective ~October 2026) is confirmed as the one with the Local Anesthesia
  breakout and added emerging-technologies emphasis — matches this file's "which spec we target"
  rationale. One source's "115 items" figure for Area 2 (without a Local Anesthesia breakout) reads
  as the **Prior to Update** total — 124 minus 115 = 9 items, consistent with this file's premise
  that Local Anesthesia is carved out as new item volume in the After Update spec, not just
  relabeled from elsewhere.
- Area 2's seven procedure categories (assessing patient characteristics / obtaining-interpreting
  radiographs / planning-managing dental hygiene care / performing periodontal procedures / using
  preventive agents / providing supportive treatment services / professional responsibility) match
  this file's seven Area 2 domains (Patient Assessment, Dental Radiography, Dental Hygiene Care
  Planning, Periodontal Disease Management, Preventive Agents, Supportive Treatment Services,
  Professional Responsibility) one-for-one.
- Area 1's six disciplines (Anatomic Sciences, Physiology, Biochemistry and Nutrition, Microbiology
  and Immunology, Pathology, Pharmacology) and Anatomic Sciences' four sub-splits (head and neck
  anatomy, dental anatomy general, dental anatomy root, histology and embryology) match verbatim.
- Scale score range 49–99, passing score 75, 350 total items — all confirmed.
- Case-based component: 12–15 patient cases, 150 items, patient-type variety (geriatric,
  adult-periodontal, pediatric, special needs, medically compromised) — confirmed.

**Not independently re-verified this pass** (egress-blocked, relying on this file's existing
sourcing): the exact subdomain-level lists under Dental Hygiene Care Planning, Periodontal Disease
Management, Dental Radiography, Preventive Agents, Supportive Treatment Services, and Professional
Responsibility; the precise per-subdomain item-format terminology ("Completion" / "Question" /
"Negative"). No conflicting information was found for any of these in the sources reviewed.
**Recommendation:** next time a session has working egress to `jcnde.ada.org` (or the owner can
paste the PDF text directly, as was done for the case-based-strategy article on 2026-07-19), do a
line-by-line subdomain diff against the primary source PDF to fully close this out.

**Content/DB check (same pass):** spot-checked the taxonomy seed
(`supabase/migrations/20260710000003_seed_taxonomy.sql`) and the vault's authored `area`/`domain`/
`subdomain` frontmatter values against this file — no stray strings that don't map back to an entry
here. Item format renderer (`completion` / `question` / `negative`, with EXCEPT/NOT stem flagging)
still matches "Item formats to support" above; no code or content changes needed from this audit.
