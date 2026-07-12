// Phase 4b — readiness model. A score area's readiness is a function of how much of its
// approved content the user has seen (coverage) and how well they're doing on it lately
// (recent accuracy). Thresholds live here so they're tunable in one place; revisit them once
// there's real response data (see PROJECT_STATE "Decisions").

export const READINESS = {
  // Responses per area counted as "recent" when scoring accuracy.
  recentWindow: 20,
  // Below this many attempts an area can't clear "Not yet" — too little signal to trust.
  minAttempts: 5,
  approaching: { coveragePct: 25, accuracyPct: 60 },
  ready: { coveragePct: 60, accuracyPct: 80 },
} as const;

export type Band = "not_yet" | "approaching" | "ready";

export type ReadinessInput = {
  coveragePct: number; // distinct approved questions attempted / approved questions in the area
  accuracyPct: number; // accuracy over the recent window
  attempts: number; // total responses in the area
};

export function readinessBand({ coveragePct, accuracyPct, attempts }: ReadinessInput): Band {
  if (attempts < READINESS.minAttempts) return "not_yet";
  if (coveragePct >= READINESS.ready.coveragePct && accuracyPct >= READINESS.ready.accuracyPct) {
    return "ready";
  }
  if (
    coveragePct >= READINESS.approaching.coveragePct &&
    accuracyPct >= READINESS.approaching.accuracyPct
  ) {
    return "approaching";
  }
  return "not_yet";
}

export const BAND_META: Record<Band, { label: string; chip: string; rank: number }> = {
  ready: {
    label: "Ready",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    rank: 2,
  },
  approaching: {
    label: "Approaching",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    rank: 1,
  },
  not_yet: {
    label: "Not yet",
    chip: "bg-muted text-muted-foreground",
    rank: 0,
  },
};
