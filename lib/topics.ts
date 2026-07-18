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
import { ToothAnatomyDiagram } from "@/components/topics/tooth-anatomy-diagram";
import { PerioPocketDiagram } from "@/components/topics/perio-pocket-diagram";

export function topicSlug(scoreArea: string): string {
  return scoreArea
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    "collagen and mineralization to how diet and sugar frequency drive caries risk.",
  "Microbiology and Immunology":
    "The oral microbiome and host immune response, including the biofilm-driven etiology of " +
    "caries and periodontal disease and how the body reacts to microbial and other challenges.",
  Pathology:
    "General and oral pathology — recognizing normal vs. abnormal tissue changes, common oral " +
    "lesions, and the disease processes a hygienist screens for at every visit.",
  Pharmacology:
    "Drug actions and classes relevant to dental hygiene care, plus local anesthesia " +
    "pharmacology — agent selection, dosing, onset/duration, and safe use in medically complex " +
    "patients.",
  "Patient Assessment":
    "Medical/dental history, head and neck exams, periodontal and oral evaluation, and occlusal " +
    "assessment — the data-gathering that drives every care decision that follows.",
  "Dental Radiography":
    "Radiophysics and radiobiology, exposure technique, and interpreting radiographic findings " +
    "and normal/abnormal anatomy, balanced against radiation-safety principles.",
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
    "agents used to reduce caries and periodontal disease risk.",
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
};
