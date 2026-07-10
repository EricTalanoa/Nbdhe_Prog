-- Phase 1: seed `taxonomy` from 01-Planning/blueprint-mapping.md (2026 "After Update" spec).
--
-- blueprint-mapping.md is the source of truth; this migration is the machine-readable
-- projection of it. Each row is a LEAF the author tags a question to via
-- (area, domain, subdomain). Roll-up for analytics happens by grouping on `score_area`
-- (the 13 reporting areas) — see 05-Dev/schema.md.
--
-- Idempotent: a unique index over (spec_version, component, area, domain, subdomain)
-- (NULLs folded to '') lets us re-run with ON CONFLICT DO UPDATE. Safe to apply on top
-- of already-imported questions — taxonomy ids are preserved, only score_area/sort_order
-- are refreshed.
--
-- Case-component taxonomy is intentionally deferred to Phase 5: a case question keeps a
-- discipline `taxonomy_id` and gains a `case_id`; the "case" score area is derived from
-- case membership, not from a taxonomy row.

create unique index if not exists taxonomy_leaf_uniq
  on public.taxonomy (
    spec_version,
    component,
    area,
    coalesce(domain, ''),
    coalesce(subdomain, '')
  );

insert into public.taxonomy
  (spec_version, component, area, domain, subdomain, score_area, sort_order)
values
  -- ── Component A · Area 1 — Scientific Basis for Dental Hygiene Practice (56 items) ──
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Anatomic Sciences','Anatomy — Head and neck anatomy','Anatomic Sciences',101),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Anatomic Sciences','Anatomy — Dental anatomy (general)','Anatomic Sciences',102),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Anatomic Sciences','Anatomy — Dental anatomy (root)','Anatomic Sciences',103),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Anatomic Sciences','Histology and Embryology','Anatomic Sciences',104),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Physiology',null,'Physiology',105),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Biochemistry and Nutrition','Biochemistry','Biochemistry and Nutrition',106),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Biochemistry and Nutrition','Nutrition','Biochemistry and Nutrition',107),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Microbiology and Immunology','Microbiology','Microbiology and Immunology',108),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Microbiology and Immunology','Immunology','Microbiology and Immunology',109),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Pathology','General pathology','Pathology',110),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Pathology','Oral pathology','Pathology',111),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Pharmacology','Local Anesthesia','Pharmacology',112),
  ('after_update_2026','discipline','Scientific Basis for Dental Hygiene Practice','Pharmacology','General pharmacology','Pharmacology',113),

  -- ── Component A · Area 2 — Provision of Clinical Dental Hygiene Services (124 items) ──
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Patient Assessment','Medical and dental history','Patient Assessment',201),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Patient Assessment','Head and neck examination','Patient Assessment',202),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Patient Assessment','Periodontal evaluation','Patient Assessment',203),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Patient Assessment','Oral evaluation','Patient Assessment',204),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Patient Assessment','Occlusal evaluation','Patient Assessment',205),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Radiography','Principles of radiophysics and radiobiology','Dental Radiography',206),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Radiography','Principles of radiologic health','Dental Radiography',207),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Radiography','Technique','Dental Radiography',208),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Radiography','Recognition of normalities and abnormalities','Dental Radiography',209),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Radiography','Emerging technologies','Dental Radiography',210),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Infection control (application)','Dental Hygiene Care Planning',211),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Recognition of emergency situations and provision of appropriate care','Dental Hygiene Care Planning',212),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Individualized patient education — planning of individualized instruction','Dental Hygiene Care Planning',213),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Individualized patient education — instruction: dental caries','Dental Hygiene Care Planning',214),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Individualized patient education — instruction: periodontal diseases','Dental Hygiene Care Planning',215),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Individualized patient education — instruction: oral conditions','Dental Hygiene Care Planning',216),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Anxiety and pain control — Local anesthesia','Dental Hygiene Care Planning',217),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Anxiety and pain control — General (e.g., relaxation techniques)','Dental Hygiene Care Planning',218),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Recognition and management of patients with special needs','Dental Hygiene Care Planning',219),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Treatment strategies — Diagnosis','Dental Hygiene Care Planning',220),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Treatment strategies — Treatment plan','Dental Hygiene Care Planning',221),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Dental Hygiene Care Planning','Treatment strategies — Case presentation','Dental Hygiene Care Planning',222),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Etiology and pathogenesis of periodontal diseases','Periodontal Disease Management',223),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Prescribed therapy — Nonsurgical periodontal therapy','Periodontal Disease Management',224),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Prescribed therapy — Surgical support services','Periodontal Disease Management',225),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Prescribed therapy — Chemotherapeutic agents','Periodontal Disease Management',226),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Prescribed therapy — Implant care','Periodontal Disease Management',227),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Reassessment and evaluation','Periodontal Disease Management',228),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Periodontal Disease Management','Maintenance','Periodontal Disease Management',229),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Preventive Agents','Fluorides — Mechanisms of action','Preventive Agents',230),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Preventive Agents','Fluorides — Toxicology','Preventive Agents',231),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Preventive Agents','Fluorides — Methods of administration','Preventive Agents',232),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Preventive Agents','Pit and fissure sealants','Preventive Agents',233),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Preventive Agents','Other preventive agents (e.g., emerging materials)','Preventive Agents',234),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Supportive Treatment Services','Properties and manipulation of materials','Supportive Treatment Services',235),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Supportive Treatment Services','Polishing natural and restored teeth','Supportive Treatment Services',236),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Supportive Treatment Services','Making of impressions and preparation of study casts','Supportive Treatment Services',237),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Supportive Treatment Services','Emerging technologies','Supportive Treatment Services',238),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Professional Responsibility','Ethical principles','Professional Responsibility',239),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Professional Responsibility','Regulatory compliance','Professional Responsibility',240),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Professional Responsibility','Patient and professional communication','Professional Responsibility',241),
  ('after_update_2026','discipline','Provision of Clinical Dental Hygiene Services','Professional Responsibility','Documentation and risk management','Professional Responsibility',242),

  -- ── Component A · Area 3 — Research Principles and Community Health (20 items, testlet) ──
  -- Reports separately from the 13 discipline areas (see blueprint-mapping.md "Score areas").
  ('after_update_2026','discipline','Research Principles and Community Health','Research Principles','Analyzing scientific literature','Research Principles and Community Health',301),
  ('after_update_2026','discipline','Research Principles and Community Health','Research Principles','Understanding statistical concepts','Research Principles and Community Health',302),
  ('after_update_2026','discipline','Research Principles and Community Health','Research Principles','Applying research results','Research Principles and Community Health',303),
  ('after_update_2026','discipline','Research Principles and Community Health','Community Health','Promoting health and preventing disease within groups','Research Principles and Community Health',304),
  ('after_update_2026','discipline','Research Principles and Community Health','Community Health','Assessing, designing, implementing, and evaluating community programs','Research Principles and Community Health',305)
on conflict (spec_version, component, area, coalesce(domain, ''), coalesce(subdomain, ''))
  do update set
    score_area = excluded.score_area,
    sort_order = excluded.sort_order;
