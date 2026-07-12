import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Phase 4a — per-score-area roll-up, accuracy trend, and weak-area ranking, computed from the
// user's `responses` joined through `questions.taxonomy_id -> taxonomy.score_area`. Owner-only
// RLS scopes responses to the signed-in user. Degrades to an empty state before any practice.

const WEAK_AREA_COUNT = 5;
const TREND_DAYS = 14;
const LOW_SAMPLE = 3; // fewer attempts than this → flag the area's accuracy as low-confidence

type ResponseRow = {
  is_correct: boolean;
  answered_at: string;
  questions:
    | { taxonomy: { score_area: string } | { score_area: string }[] | null }
    | { taxonomy: { score_area: string } | { score_area: string }[] | null }[]
    | null;
};

type AreaStat = { area: string; sort: number; attempts: number; correct: number };

function scoreAreaOf(row: ResponseRow): string | null {
  const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
  if (!q) return null;
  const tax = Array.isArray(q.taxonomy) ? q.taxonomy[0] : q.taxonomy;
  return tax?.score_area ?? null;
}

function pct(correct: number, attempts: number): number {
  return attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
}

function accuracyTone(accuracy: number): string {
  if (accuracy >= 80) return "bg-emerald-500";
  if (accuracy >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      <div className={`h-full rounded-full ${accuracyTone(accuracy)}`} style={{ width: `${accuracy}%` }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Full score-area list (with blueprint order) so we can show coverage, including unattempted.
  const { data: taxRows } = await supabase.from("taxonomy").select("score_area, sort_order");
  const areaOrder = new Map<string, number>();
  for (const t of (taxRows ?? []) as { score_area: string; sort_order: number }[]) {
    const cur = areaOrder.get(t.score_area);
    if (cur === undefined || t.sort_order < cur) areaOrder.set(t.score_area, t.sort_order);
  }

  const { data, error } = await supabase
    .from("responses")
    .select("is_correct, answered_at, questions(taxonomy(score_area))");
  const responses = (data ?? []) as unknown as ResponseRow[];

  // Per-area rollup.
  const statByArea = new Map<string, AreaStat>();
  for (const area of Array.from(areaOrder.keys())) {
    statByArea.set(area, { area, sort: areaOrder.get(area) ?? Number.MAX_SAFE_INTEGER, attempts: 0, correct: 0 });
  }
  // Per-day trend buckets (UTC date).
  const dayBuckets = new Map<string, { attempts: number; correct: number }>();
  let totalAttempts = 0;
  let totalCorrect = 0;

  for (const r of responses) {
    totalAttempts += 1;
    if (r.is_correct) totalCorrect += 1;

    const area = scoreAreaOf(r);
    if (area) {
      const s =
        statByArea.get(area) ??
        { area, sort: areaOrder.get(area) ?? Number.MAX_SAFE_INTEGER, attempts: 0, correct: 0 };
      s.attempts += 1;
      if (r.is_correct) s.correct += 1;
      statByArea.set(area, s);
    }

    const day = r.answered_at.slice(0, 10);
    const b = dayBuckets.get(day) ?? { attempts: 0, correct: 0 };
    b.attempts += 1;
    if (r.is_correct) b.correct += 1;
    dayBuckets.set(day, b);
  }

  const areas = Array.from(statByArea.values()).sort((a, b) => a.sort - b.sort);
  const attemptedAreas = areas.filter((a) => a.attempts > 0);
  const weakAreas = attemptedAreas
    .slice()
    .sort((a, b) => pct(a.correct, a.attempts) - pct(b.correct, b.attempts) || b.attempts - a.attempts)
    .slice(0, WEAK_AREA_COUNT);
  const trend = Array.from(dayBuckets.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-TREND_DAYS)
    .map(([day, b]) => ({ day, accuracy: pct(b.correct, b.attempts), attempts: b.attempts }));

  const overall = pct(totalCorrect, totalAttempts);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accuracy by score area, weak spots, and a recent trend — from your answered questions.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load your responses: {error.message}
        </div>
      )}

      {totalAttempts === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <p>No answered questions yet — your progress will show up here once you practice.</p>
          <Link href="/practice" className="mt-3 inline-block underline underline-offset-4">
            Start a practice set
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Overall */}
          <section className="rounded-xl border bg-card p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Overall accuracy
              </span>
              <span className="text-sm text-muted-foreground">
                {totalCorrect}/{totalAttempts} correct · {attemptedAreas.length}/{areas.length} areas
                touched
              </span>
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{overall}%</p>
            <div className="mt-3">
              <AccuracyBar accuracy={overall} />
            </div>
          </section>

          {/* Weak areas */}
          {weakAreas.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Focus next — weakest areas
              </h2>
              <ol className="space-y-3">
                {weakAreas.map((a) => {
                  const accuracy = pct(a.correct, a.attempts);
                  return (
                    <li key={a.area} className="rounded-lg border bg-card p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium">{a.area}</span>
                        <span className="text-sm text-muted-foreground">
                          {accuracy}% · {a.correct}/{a.attempts}
                          {a.attempts < LOW_SAMPLE && " · low sample"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <AccuracyBar accuracy={accuracy} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* Per-area rollup (blueprint order, includes not-yet-started areas) */}
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              By score area
            </h2>
            <div className="space-y-3">
              {areas.map((a) => {
                const accuracy = pct(a.correct, a.attempts);
                const started = a.attempts > 0;
                return (
                  <div key={a.area} className="rounded-lg border bg-card p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{a.area}</span>
                      <span className="text-sm text-muted-foreground">
                        {started ? `${accuracy}% · ${a.correct}/${a.attempts}` : "not started"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <AccuracyBar accuracy={started ? accuracy : 0} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Accuracy trend */}
          {trend.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Recent accuracy trend
              </h2>
              <div className="space-y-2">
                {trend.map((d) => (
                  <div key={d.day} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{d.day}</span>
                    <div className="flex-1">
                      <AccuracyBar accuracy={d.accuracy} />
                    </div>
                    <span className="w-24 shrink-0 text-right text-muted-foreground">
                      {d.accuracy}% · {d.attempts}q
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
