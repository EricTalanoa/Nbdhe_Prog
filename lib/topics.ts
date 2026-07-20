// By-exam-topic dashboard mode (7c). The topic *list* always comes live from `taxonomy`
// (distinct `score_area` ordered by `sort_order`, same query `/analytics` already runs) — never
// hardcoded here. This file only holds the slug scheme and short original overview notes keyed
// by the exact `score_area` string (same discipline as taxonomy tagging: use the string as
// stored, don't invent one). A `score_area` with no entry below still gets a page — it just
// falls back to a generic placeholder line — so a taxonomy reseed never 404s a topic tile.
//
// 7d-topic-notes-depth deepens these one batch at a time (not all 13 at once) and pairs a
// hand-drawn SVG diagram (`components/topics/`) with the topics that most benefit from one — see
// `TOPIC_DIAGRAMS` below.

import type { ComponentType } from "react";
import {
  Activity,
  Bone,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Microscope,
  NotebookText,
  Pill,
  ScanLine,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ToothAnatomyDiagram } from "@/components/topics/tooth-anatomy-diagram";
import { PerioPocketDiagram } from "@/components/topics/perio-pocket-diagram";
import { RadiographicLandmarksDiagram } from "@/components/topics/radiographic-landmarks-diagram";
import { CariesProcessDiagram } from "@/components/topics/caries-process-diagram";
import { PeriodontalChartingDiagram } from "@/components/topics/periodontal-charting-diagram";
import { NerveBlockLandmarksDiagram } from "@/components/topics/nerve-block-landmarks-diagram";
import { BiofilmFormationDiagram } from "@/components/topics/biofilm-formation-diagram";
import { StephanCurveDiagram } from "@/components/topics/stephan-curve-diagram";

export function topicSlug(scoreArea: string): string {
  return scoreArea
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// A case has no score_area of its own — per schema.md, a case-linked question keeps its own
// discipline taxonomy_id, and `case_id` is a separate link. To decide which topic a case
// "belongs to" for the by-exam-topic dashboard, take the most common score_area among its linked
// approved items; ties break toward the area that sorts first in the blueprint (lowest
// sort_order), so the result is deterministic even for a case whose items are evenly split
// across two areas.
export type CaseAreaRow = { case_id: string; score_area: string | null };

export function caseTopicAreas(
  rows: CaseAreaRow[],
  areaOrder: Map<string, number>
): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!r.case_id || !r.score_area) continue;
    let byArea = counts.get(r.case_id);
    if (!byArea) {
      byArea = new Map();
      counts.set(r.case_id, byArea);
    }
    byArea.set(r.score_area, (byArea.get(r.score_area) ?? 0) + 1);
  }

  const result = new Map<string, string>();
  for (const [caseId, byArea] of Array.from(counts.entries())) {
    let bestArea: string | null = null;
    let bestCount = -1;
    let bestOrder = Infinity;
    for (const [area, count] of Array.from(byArea.entries())) {
      const order = areaOrder.get(area) ?? Infinity;
      if (count > bestCount || (count === bestCount && order < bestOrder)) {
        bestArea = area;
        bestCount = count;
        bestOrder = order;
      }
    }
    if (bestArea) result.set(caseId, bestArea);
  }
  return result;
}

// Short, original placeholder overviews (Rule 0: written from general dental-hygiene knowledge,
// not copied from any source text). Depth pass is 7d — this is intentionally brief for now.
export const TOPIC_NOTES: Record<string, string> = {
  "Anatomic Sciences":
    "Head and neck anatomy, dental and root anatomy, and histology/embryology — the structural " +
    "foundation for charting normal landmarks, recognizing variants, and understanding how oral " +
    "tissues form and change. A tooth is built in layers: acellular, avascular enamel caps the " +
    "crown over dentin, a tubule-filled tissue laid down by odontoblasts that keeps forming (and " +
    "can react to insult) throughout life; the pulp at the center is vascularized connective " +
    "tissue carrying the blood supply and nerve fibers. Below the cementoenamel junction (CEJ), " +
    "cementum covers root dentin instead of enamel and anchors the periodontal ligament fibers. " +
    "Root shape and number, furcation location, and CEJ contour vary by tooth and surface — " +
    "exactly what a hygienist reads on a radiograph or with an explorer — while the muscle " +
    "attachments, nerve branches, and vascular pathways of the head and neck explain referred " +
    "pain patterns and guide safe injection sites.",
  Physiology:
    "How the body's systems function day to day, with an emphasis on the autonomic, " +
    "cardiovascular, and salivary mechanisms that shape clinical decisions in the dental chair.",
  "Biochemistry and Nutrition":
    "Metabolic and nutritional concepts relevant to oral health — from the biochemistry of " +
    "collagen and mineralization to how diet and sugar frequency drive caries risk. The Stephan " +
    "curve is the classic way this gets tested: plot plaque pH against time after a fermentable- " +
    "carbohydrate exposure and it drops sharply as bacteria ferment the sugar into acid, then " +
    "climbs slowly back toward baseline as saliva buffers the acid and clears it — the dip below " +
    "the critical pH (~5.5 for enamel) is the window during which the tooth is actually losing " +
    "mineral. What matters for caries risk isn't the total sugar eaten in a day, it's how often " +
    "that curve dips: one exposure gets a full recovery before the next meal, but frequent " +
    "snacking re-triggers the drop before pH has climbed back above critical, so the tooth spends " +
    "far more cumulative time in a demineralizing state even if the total sugar consumed is the " +
    "same or less — which is why patient counseling on caries risk targets exposure *frequency* " +
    "first. On the nutrition side, collagen synthesis depends on vitamin C (ascorbic acid) as a " +
    "cofactor for hydroxylating proline and lysine residues; without it collagen cross-links " +
    "poorly, and classic scurvy findings — spongy, bleeding gingiva and impaired wound healing — " +
    "are a direct read of that broken biochemistry, not a separate periodontal disease process. " +
    "Adequate protein similarly supports soft-tissue healing after periodontal therapy, and " +
    "calcium/vitamin D status affects alveolar bone density and turnover.",
  "Microbiology and Immunology":
    "The oral microbiome and host immune response, including the biofilm-driven etiology of " +
    "caries and periodontal disease and how the body reacts to microbial and other challenges. " +
    "Dental plaque isn't a random pile of bacteria — it forms through an ordered ecological " +
    "succession. Salivary glycoproteins first coat clean enamel as an acquired pellicle within " +
    "minutes; early colonizers, dominated by streptococci, attach directly to that pellicle using " +
    "surface adhesins. Over the following hours to days, bridging organisms — Fusobacterium " +
    "nucleatum is the textbook example — coaggregate with those early colonizers and, in turn, " +
    "recruit later, more strictly anaerobic and more pathogenic species that can't attach to the " +
    "pellicle directly. As the biofilm thickens it develops its own internal oxygen gradient: " +
    "facultative species tolerate the more oxygenated outer layers, while obligate anaerobes " +
    "concentrate deepest, against the tooth or pocket epithelium, where oxygen tension is lowest. " +
    "This is exactly where the periodontal 'red complex' (Porphyromonas gingivalis, Tannerella " +
    "forsythia, Treponema denticola) is found in a mature subgingival biofilm, and it explains why " +
    "disrupting the biofilm's structure (mechanical debridement) does more than any single " +
    "antimicrobial to reduce the anaerobic species driving periodontal destruction. On the " +
    "immune side, the host doesn't just tolerate this challenge passively: neutrophils are the " +
    "first responders patrolling the gingival sulcus, and it's the chronic activation of the " +
    "innate immune response — not bacterial toxins acting alone — that ultimately drives the " +
    "collagen and bone breakdown seen in periodontal disease (the same host-response principle " +
    "covered in more depth on the Periodontal Disease Management topic page).",
  Pathology:
    "General and oral pathology — recognizing normal vs. abnormal tissue changes, common oral " +
    "lesions, and the disease processes a hygienist screens for at every visit.",
  Pharmacology:
    "Drug actions and classes relevant to dental hygiene care, plus local anesthesia " +
    "pharmacology — agent selection, dosing, onset/duration, and safe use in medically complex " +
    "patients. Local anesthetics work by blocking voltage-gated sodium channels along the nerve " +
    "membrane, preventing the depolarization needed to fire an action potential — smaller, " +
    "unmyelinated fibers (pain, temperature) tend to block before larger myelinated ones (touch, " +
    "proprioception), which is why pain relief and hot/cold changes usually show up before a " +
    "patient loses the sense of pressure. Onset and duration are shaped by the molecule itself " +
    "(lipid solubility, protein binding, pKa relative to tissue pH) and by additives: a " +
    "vasoconstrictor like epinephrine keeps the drug at the injection site longer, extending " +
    "duration and reducing systemic absorption/toxicity risk, at the cost of needing caution in " +
    "patients where added epinephrine is a concern (e.g., certain cardiovascular disease, some " +
    "drug interactions). The inferior alveolar nerve block (IANB) is the single most commonly " +
    "tested injection: it depends on locating the coronoid notch and occlusal plane to judge " +
    "injection height, entering through the pterygomandibular triangle, and advancing toward the " +
    "lingula/mandibular foramen — going in too high, too shallow, or off the intended path is the " +
    "usual reason a block only partially takes.",
  "Patient Assessment":
    "Medical/dental history, head and neck exams, periodontal and oral evaluation, and occlusal " +
    "assessment — the data-gathering that drives every care decision that follows. Periodontal " +
    "evaluation centers on six-point probing: at each tooth, probing depth is measured and " +
    "recorded at six sites — facial (mesiofacial, facial, distofacial) and lingual (mesiolingual, " +
    "lingual, distolingual) — not just one reading per tooth, since disease can be localized to a " +
    "single surface. Reading the probe itself is a skill in its own right: the shaft is 'walked' " +
    "along the base of the pocket and the millimeter marking nearest the gingival margin is read " +
    "and rounded to the next highest whole millimeter, so a margin that falls between two marks " +
    "is recorded as the deeper number. A thorough medical/dental history and head-and-neck exam " +
    "(extraoral and intraoral soft-tissue screening, TMJ, lymph nodes) come first, because " +
    "findings there — anticoagulant use, a suspicious lesion, limited opening — can change how " +
    "the rest of the assessment and the eventual care plan proceed.",
  "Dental Radiography":
    "Radiophysics and radiobiology, exposure technique, and interpreting radiographic findings " +
    "and normal/abnormal anatomy, balanced against radiation-safety principles. ALARA (As Low As " +
    "Reasonably Achievable) drives every exposure decision: use the fastest receptor speed that " +
    "still meets diagnostic needs, collimate the beam, shield when it helps, and expose only when " +
    "there's a clinical indication rather than on a fixed recall schedule. Technique factors trade " +
    "off predictably — kVp mainly controls contrast (higher kVp gives a longer gray scale, lower " +
    "kVp gives a higher-contrast black-and-white image), while mA and exposure time both control " +
    "density (the overall darkness of the image) and are largely interchangeable for that purpose. " +
    "Reading a film well means knowing which radiolucencies are normal anatomy rather than " +
    "disease: the mental foramen, for example, sits near the mandibular premolar apices and can " +
    "mimic a periapical lesion, but a corticated (well-defined) border and continuity with the " +
    "mandibular canal identify it as normal, whereas a true periapical lesion typically shows a " +
    "diffuse border and a widened periodontal ligament space at a non-vital tooth's apex.",
  "Dental Hygiene Care Planning":
    "Turning assessment findings into an individualized plan — diagnosis, patient education, " +
    "infection control, anxiety and pain control, and recognizing dental/medical emergencies.",
  "Periodontal Disease Management":
    "Etiology and pathogenesis of periodontal disease, nonsurgical therapy, chemotherapeutic and " +
    "surgical support, implant care, and the reassessment/maintenance cycle that keeps it in " +
    "check. Disease begins with a bacterial biofilm, but tissue destruction is driven mainly by " +
    "the host's own inflammatory response — collagen and bone loss follow the body's reaction to " +
    "the biofilm, not just bacterial toxins directly. Two measurements matter and aren't the same " +
    "thing: probing depth (PD) is measured from the gingival margin to the base of the sulcus or " +
    "pocket, while clinical attachment level (CAL) is measured from the fixed CEJ — so PD alone " +
    "can understate real attachment loss when the margin has receded, or overstate it when tissue " +
    "is swollen. Nonsurgical therapy (scaling and root planing, adjunctive chemotherapeutics) is " +
    "the first line; persistent pockets, furcation involvement, or inadequate access may call for " +
    "surgical referral. Once therapy controls the disease, a risk-based maintenance interval — " +
    "tightened for smokers, poor compliance, or residual pockets — is what keeps it from " +
    "recurring.",
  "Preventive Agents":
    "Fluorides (mechanisms, delivery methods, and toxicology), sealants, and other preventive " +
    "agents used to reduce caries and periodontal disease risk. Caries isn't a one-way event — " +
    "it's a demineralization/remineralization cycle playing out on the tooth surface many times a " +
    "day. Plaque bacteria metabolize fermentable carbohydrates into acid; once the local pH drops " +
    "below the critical pH for enamel (roughly 5.5), calcium and phosphate leave the hydroxyapatite " +
    "crystal faster than they can be redeposited, and the lesion progresses when this outpaces " +
    "repair over time. Saliva pushes back by buffering acid and supplying calcium and phosphate " +
    "back into the lattice, and fluoride tips that balance further in the tooth's favor through " +
    "three mechanisms: it inhibits demineralization at the crystal surface, it enhances " +
    "remineralization by helping calcium and phosphate redeposit as fluorapatite (which resists " +
    "acid dissolution at a lower pH than hydroxyapatite), and at higher, topical concentrations it " +
    "interferes with bacterial enzyme activity and acid production. That mechanism is why frequency " +
    "of sugar exposure (how often pH drops below critical, via the Stephan curve) matters more for " +
    "risk than total sugar quantity, and why low-dose, frequent fluoride exposure (toothpaste, " +
    "water) generally protects better than an occasional high-dose application alone. Sealants " +
    "work differently — a resin mechanically fills pits and fissures so plaque and substrate can't " +
    "accumulate there in the first place, protecting a site fluoride reaches less effectively.",
  "Supportive Treatment Services":
    "Dental materials, impressions, and emerging clinical technologies that support hygiene " +
    "treatment beyond the core scaling/root-planing skill set.",
  "Professional Responsibility":
    "Ethics, regulatory compliance, documentation and risk management, and patient/professional " +
    "communication — the non-clinical judgment every practicing hygienist is tested on.",
  "Research Principles and Community Health":
    "Reading and applying scientific literature (study design, statistics, evidence-based " +
    "decision-making) alongside community oral-health program planning and evaluation.",
};

export const DEFAULT_TOPIC_NOTE =
  "Notes for this topic are on their way — practice and flashcards below already draw from the " +
  "full question bank for this area.";

// Original self-drawn SVG diagrams, keyed by the same `score_area` string as TOPIC_NOTES. Only
// topics where a visual genuinely clarifies the concept get one — most topics have none yet and
// simply render without a diagram (see app/topics/[slug]/page.tsx).
export const TOPIC_DIAGRAMS: Record<string, ComponentType> = {
  "Anatomic Sciences": ToothAnatomyDiagram,
  "Periodontal Disease Management": PerioPocketDiagram,
  "Dental Radiography": RadiographicLandmarksDiagram,
  "Preventive Agents": CariesProcessDiagram,
  "Patient Assessment": PeriodontalChartingDiagram,
  Pharmacology: NerveBlockLandmarksDiagram,
  "Microbiology and Immunology": BiofilmFormationDiagram,
  "Biochemistry and Nutrition": StephanCurveDiagram,
};

// Small per-topic glyphs for the dashboard's by-exam-topic grid (8b-dashboard-polish) — purely
// decorative, so an area with no entry just falls back to a generic icon rather than breaking.
const TOPIC_ICONS: Record<string, LucideIcon> = {
  "Anatomic Sciences": Bone,
  Physiology: HeartPulse,
  "Biochemistry and Nutrition": FlaskConical,
  "Microbiology and Immunology": Microscope,
  Pathology: Activity,
  Pharmacology: Pill,
  "Patient Assessment": ClipboardList,
  "Dental Radiography": ScanLine,
  "Dental Hygiene Care Planning": NotebookText,
  "Periodontal Disease Management": ShieldAlert,
  "Preventive Agents": ShieldCheck,
  "Supportive Treatment Services": Wrench,
  "Professional Responsibility": Scale,
  "Research Principles and Community Health": Users,
};

export function topicIcon(scoreArea: string): LucideIcon {
  return TOPIC_ICONS[scoreArea] ?? NotebookText;
}
