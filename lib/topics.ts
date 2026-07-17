// By-exam-topic dashboard mode (7c). The topic *list* always comes live from `taxonomy`
// (distinct `score_area` ordered by `sort_order`, same query `/analytics` already runs) — never
// hardcoded here. This file only holds the slug scheme and short original overview notes keyed
// by the exact `score_area` string (same discipline as taxonomy tagging: use the string as
// stored, don't invent one). A `score_area` with no entry below still gets a page — it just
// falls back to a generic placeholder line — so a taxonomy reseed never 404s a topic tile.

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
    "tissues form and change.",
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
    "surgical support, implant care, and the reassessment/maintenance cycle that keeps it in check.",
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
