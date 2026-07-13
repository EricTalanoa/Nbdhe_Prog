// Phase 6a — mock-exam config. The real NBDHE is one day, two components (A: discipline-based,
// B: case-based) with a scheduled break and a pass/fail result (no public 49–99 number). We can't
// reproduce the ~350-item scale with the current bank, so the mock mirrors the *structure* —
// two timed sections, an optional break, a final score band — scaled to the approved content.
// Thresholds live here so they're easy to tune (same spirit as lib/readiness.ts).

import type { Band } from "./readiness";

export const MOCK = {
  // Per-item time budget; each section's timer = its item count × this.
  perItemSeconds: 75,
  // Overall-accuracy cutoffs for the final band (percent). Deliberately a band, not a fake score.
  scoreband: { ready: 75, approaching: 60 },
} as const;

export function sectionTimeLimitSec(itemCount: number): number {
  return itemCount * MOCK.perItemSeconds;
}

// Whole-exam performance band from overall accuracy. Distinct from readinessBand (which is
// per-area coverage-based); reuses the same Band type so chip styling (BAND_META) is shared.
export function mockScoreBand(accuracyPct: number): Band {
  if (accuracyPct >= MOCK.scoreband.ready) return "ready";
  if (accuracyPct >= MOCK.scoreband.approaching) return "approaching";
  return "not_yet";
}
