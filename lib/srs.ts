// Phase 7a — spaced-repetition scheduler (SM-2-lite). Given a card's current state and the
// self-graded recall, returns the next state. Kept small and pure so it's easy to test/tune;
// thresholds live here like lib/readiness.ts and lib/mock.ts.

export type Grade = "again" | "hard" | "good" | "easy";

export const GRADES: { grade: Grade; label: string }[] = [
  { grade: "again", label: "Again" },
  { grade: "hard", label: "Hard" },
  { grade: "good", label: "Good" },
  { grade: "easy", label: "Easy" },
];

export type CardState = { ease: number; intervalDays: number };
export type NextState = { ease: number; intervalDays: number; dueAt: Date; lastResult: Grade };

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
// "again" reschedules within the day; store it as a fractional day so due_at is ~10 min out.
const AGAIN_INTERVAL_DAYS = 10 / (60 * 24);

export const NEW_CARD: CardState = { ease: DEFAULT_EASE, intervalDays: 0 };

export function schedule(current: CardState, grade: Grade): NextState {
  let ease = current.ease > 0 ? current.ease : DEFAULT_EASE;
  const prev = current.intervalDays;
  let intervalDays: number;

  switch (grade) {
    case "again":
      ease = Math.max(MIN_EASE, ease - 0.2);
      intervalDays = AGAIN_INTERVAL_DAYS;
      break;
    case "hard":
      ease = Math.max(MIN_EASE, ease - 0.15);
      intervalDays = prev <= 0 ? 1 : Math.max(1, Math.round(prev * 1.2));
      break;
    case "good":
      intervalDays = prev <= 0 ? 1 : Math.max(1, Math.round(prev * ease));
      break;
    case "easy":
      ease = ease + 0.15;
      intervalDays = prev <= 0 ? 3 : Math.max(2, Math.round(prev * ease * 1.3));
      break;
  }

  const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  // Store fractional "again" intervals as 0 days (relearning) — due_at carries the real timing.
  return { ease, intervalDays: intervalDays < 1 ? 0 : intervalDays, dueAt, lastResult: grade };
}
