// Pre-built topic sets. Each maps to /practice query params (score areas and/or subdomains).
// Filtering happens in /practice against taxonomy(score_area, subdomain) — no DB/table needed, so
// sets stay in sync with the live bank automatically. `icon` is a key resolved in the /sets page.

export type QuestionSet = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  areas?: string[]; // taxonomy.score_area values
  subs?: string[]; // taxonomy.subdomain values
  n?: number; // default set size (cap)
};

export const QUESTION_SETS: QuestionSet[] = [
  {
    slug: "local-anesthesia",
    title: "Local Anesthesia",
    description: "Agents, dosing, onset, and complications",
    icon: "Syringe",
    subs: ["Local Anesthesia", "Anxiety and pain control — Local anesthesia"],
    n: 20,
  },
  {
    slug: "pharmacology",
    title: "Pharmacology",
    description: "Drug actions, classes, and dental implications",
    icon: "Pill",
    areas: ["Pharmacology"],
    n: 20,
  },
  {
    slug: "periodontics",
    title: "Periodontal Management",
    description: "Etiology, nonsurgical therapy, and maintenance",
    icon: "Activity",
    areas: ["Periodontal Disease Management"],
    n: 20,
  },
  {
    slug: "radiography",
    title: "Dental Radiography",
    description: "Physics, technique, and image interpretation",
    icon: "ScanLine",
    areas: ["Dental Radiography"],
    n: 20,
  },
  {
    slug: "assessment",
    title: "Patient Assessment",
    description: "History, head & neck, oral and occlusal exams",
    icon: "ClipboardList",
    areas: ["Patient Assessment"],
    n: 20,
  },
  {
    slug: "care-planning",
    title: "Care Planning & Emergencies",
    description: "Emergencies, special needs, and communication",
    icon: "HeartPulse",
    areas: ["Dental Hygiene Care Planning"],
    n: 20,
  },
  {
    slug: "prevention",
    title: "Preventive & Fluoride",
    description: "Fluorides, sealants, and preventive agents",
    icon: "ShieldCheck",
    areas: ["Preventive Agents"],
    n: 20,
  },
  {
    slug: "basic-sciences",
    title: "Basic Sciences",
    description: "Anatomy, physiology, biochem, micro, and pathology",
    icon: "Microscope",
    areas: [
      "Anatomic Sciences",
      "Physiology",
      "Biochemistry and Nutrition",
      "Microbiology and Immunology",
      "Pathology",
    ],
    n: 25,
  },
  {
    slug: "research-community",
    title: "Research & Community Health",
    description: "Statistics, evidence, and community programs",
    icon: "Users",
    areas: ["Research Principles and Community Health"],
    n: 20,
  },
];

// Build the /practice href for a set.
export function questionSetHref(set: QuestionSet): string {
  const params = new URLSearchParams();
  for (const a of set.areas ?? []) params.append("areas", a);
  for (const s of set.subs ?? []) params.append("sub", s);
  if (set.n) params.set("n", String(set.n));
  return `/practice?${params.toString()}`;
}

// Does a question (by its score_area + subdomain) belong to a set? Used to count matches.
export function matchesSet(set: QuestionSet, scoreArea: string | null, subdomain: string | null): boolean {
  if (set.areas && scoreArea && set.areas.includes(scoreArea)) return true;
  if (set.subs && subdomain && set.subs.includes(subdomain)) return true;
  return false;
}
