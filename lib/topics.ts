// By-exam-topic dashboard mode (7c). The topic *list* always comes live from `taxonomy`
// (distinct `score_area` ordered by `sort_order`, same query `/analytics` already runs) — never
// hardcoded here. This file only holds the slug scheme and short original overview notes keyed
// by the exact `score_area` string (same discipline as taxonomy tagging: use the string as
// stored, don't invent one). A `score_area` with no entry below still gets a page — it just
// falls back to a generic placeholder line — so a taxonomy reseed never 404s a topic tile.
//
// 7d-topic-notes-depth (ongoing, one focused batch/run, same shape as 7b-bank-depth): deepens a
// couple of notes per batch rather than all 14 at once. A note with a blank line between
// sentences (`\n\n`) renders as multiple paragraphs on `/topics/[slug]` — see that page's split.

import type { ComponentType } from "react";
import { ToothAnatomyDiagram } from "@/components/topics/tooth-anatomy-diagram";
import { PerioPocketDiagram } from "@/components/topics/perio-pocket-diagram";

export function topicSlug(scoreArea: string): string {
  return scoreArea
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Original self-drawn SVG diagrams (7d), one per topic where a visual clarifies the concept.
// Added alongside a topic's note-depth pass, not all at once — see AUTOPILOT.md.
export const TOPIC_DIAGRAMS: Record<string, ComponentType> = {
  "Anatomic Sciences": ToothAnatomyDiagram,
  "Periodontal Disease Management": PerioPocketDiagram,
};

// Short, original placeholder overviews (Rule 0: written from general dental-hygiene knowledge,
// not copied from any source text). Depth pass is 7d — this is intentionally brief for now.
export const TOPIC_NOTES: Record<string, string> = {
  "Anatomic Sciences":
    "Head and neck anatomy, dental and root anatomy, and histology/embryology — the structural " +
    "foundation for charting normal landmarks, recognizing variants, and understanding how oral " +
    "tissues form and change.\n\n" +
    "A tooth is built in concentric layers around a central pulp. Enamel, the hardest tissue in " +
    "the body, caps the crown; cementum, softer and more like bone, covers the root. The two meet " +
    "at the cementoenamel junction (CEJ) — a landmark you'll use constantly, since periodontal " +
    "attachment loss and probing depth are both measured relative to it, not to the (movable) " +
    "gum line. Beneath both is dentin, the bulk of the tooth, which is softer than enamel but " +
    "still mineralized and sensitive because it's riddled with tubules running to the pulp. The " +
    "pulp itself — nerve, blood supply, connective tissue — occupies a chamber under the crown " +
    "and narrows into a root canal that exits at the apical foramen near the root tip.\n\n" +
    "Outside the tooth, the periodontium anchors it: a thin periodontal ligament (PDL) suspends " +
    "the root in its bony socket (the shock-absorbing fibers also carry proprioception — part of " +
    "why a tooth 'feels' pressure), cementum gives those fibers something to attach to, and the " +
    "alveolar bone forms the socket wall itself. Head and neck anatomy widens the lens further: " +
    "muscles of mastication, the TMJ, major nerve branches (especially trigeminal divisions " +
    "relevant to local anesthesia blocks), and salivary gland locations all recur across other " +
    "score areas, so this one is worth anchoring early.",
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
    "surgical support, implant care, and the reassessment/maintenance cycle that keeps it in check.\n\n" +
    "Periodontal disease starts with a bacterial biofilm, but the tissue destruction is mostly the " +
    "host's own inflammatory response to it — the bacteria are the initiator, the host's cytokine " +
    "and enzyme cascade is the direct driver of collagen and bone breakdown. Gingivitis is " +
    "reversible: inflammation confined to the gingiva, no attachment loss. Periodontitis is not — " +
    "once the junctional epithelium migrates apical to the CEJ, that attachment loss (and any " +
    "bone loss with it) is permanent, even after treatment controls the disease.\n\n" +
    "That distinction is why clinical attachment loss (CAL), not probing depth (PD) alone, is the " +
    "measure that matters. PD is measured from the gingival margin, which moves — it gets deeper " +
    "with gingival swelling even when nothing is truly attached, and shallower with recession even " +
    "when a lot of attachment is gone. CAL is measured from the fixed CEJ, so it reflects real " +
    "attachment loss regardless of where the gum happens to sit that day. A patient with puffy, " +
    "inflamed gingiva can have deep pockets and zero CAL; a patient with significant recession can " +
    "have shallow pockets and severe CAL. Reading both together — not PD in isolation — is how " +
    "staging and treatment planning actually work, and it's the same logic behind why maintenance " +
    "recall intervals get shortened for patients with residual pockets or risk factors like " +
    "smoking rather than left on a fixed schedule.",
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
