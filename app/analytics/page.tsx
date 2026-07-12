import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readinessBand, BAND_META, READINESS, type Band } from "@/lib/readiness";

// Phase 4a/4b — per-score-area roll-up, accuracy trend, weak-area ranking, and a readiness band
// per area (coverage % + recent accuracy) with "study next" suggestions. Computed from the user's
// `responses` joined through `questions.taxonomy_id -> taxonomy.score_area`. Owner-only RLS scopes
// responses to the signed-in user. Degrades to an empty state before any practice.

const WEAK_AREA_COUNT = 5;
const STUDY_NEXT_COUNT = 3;
const TREND_DAYS = 14;
const LOW_SAMPLE = 3; // fewer attempts than this → flag the area's accuracy as low-confidence

type ResponseRow = {
  question_id: string;
  is_correct: boolean;
  answered_at: string;
  questions:
    | { taxonomy: { score_area: string } | { score_area: string }[] | null }
    | { taxonomy: { score_area: string } | { score_area: string }[] | null }[]
    | null;
};

type ApprovedRow = {
  id: string;
  taxonomy: { score_area: string } | { score_area: string }[] | null;
};

type AreaStat = {
  area: string;
  sort: number;
  attempts: number;
  correct: number;
  attemptedIds: Set<string>;
  recent: { answered_at: string; is_correct: boolean }[];
};

function scoreAreaOf(t: ApprovedRow["taxonomy"] | ResponseRow["questions"]): string | null {
  if (!t) return null;
  // `t` may be the questions embed (with a nested taxonomy) or a taxonomy embed directly.
  const node = Array.isArray(t) ? t[0] : t;
  if (!node) return null;
  if ("score_area" in node) return (node as { score_area: string }).score_area ?? null;
  const tax = Array.isArray(node.taxonomy) ? node.taxonomy[0] : node.taxonomy;
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

function BandChip({ band }: { band: Band }) {
  const meta = BAND_META[band];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${meta.chip}`}>
      {meta.label}
    </span>
  );
}

function recentAccuracy(recent: AreaStat["recent"]): number {
  const window = recent
    .slice()
    .sort((a, b) => (a.answered_at < b.answered_at ? 1 : -1))
    .slice(0, READINESS.recentWindow);
  const correct = window.filter((r) => r.is_correct).length;
  return pct(correct, window.length);
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Full score-area list (blueprint order) so we can show coverage, including unattempted areas.
  const { data: taxRows } = await supabase.from("taxonomy").select("score_area, sort_order");
  const areaOrder = new Map<string, number>();
  for (const t of (taxRows ?? []) as { score_area: string; sort_order: number }[]) {
    const cur = areaOrder.get(t.score_area);
    if (cur === undefined || t.sort_order < cur) areaOrder.set(t.score_area, t.sort_order);
  }

  // Approved-question counts per area → coverage denominators.
  const { data: approvedData } = await supabase
    .from("questions")
    .select("id, taxonomy(score_area)")
    .in("status", ["approved", "live"]);
  const approvedByArea = new Map<string, number>();
  for (const q of (approvedData ?? []) as unknown as ApprovedRow[]) {
    const area = scoreAreaOf(q.taxonomy);
    if (area) approvedByArea.set(area, (approvedByArea.get(area) ?? 0) + 1);
  }

  const { data, error } = await supabase
    .from("responses")
    .select("question_id, is_correct, answered_at, questions(taxonomy(score_area))");
  const responses = (data ?? []) as unknown as ResponseRow[];

  const statByArea = new Map<string, AreaStat>();
  const freshStat = (area: string): AreaStat => ({
    area,
    sort: areaOrder.get(area) ?? Number.MAX_SAFE_INTEGER,
    attempts: 0,
    correct: 0,
    attemptedIds: new Set(),
    recent: [],
  });
  for (const area of Array.from(areaOrder.keys())) statByArea.set(area, freshStat(area));

  const dayBuckets = new Map<string, { attempts: number; correct: number }>();
  let totalAttempts = 0;
  let totalCorrect = 0;

  for (const r of responses) {
    totalAttempts += 1;
    if (r.is_correct) totalCorrect += 1;

    const area = scoreAreaOf(r.questions);
    if (area) {
      const s = statByArea.get(area) ?? freshStat(area);
      s.attempts += 1;
      if (r.is_correct) s.correct += 1;
      s.attemptedIds.add(r.question_id);
      s.recent.push({ answered_at: r.answered_at, is_correct: r.is_correct });
      statByArea.set(area, s);
    }

    const day = r.answered_at.slice(0, 10);
    const b = dayBuckets.get(day) ?? { attempts: 0, correct: 0 };
    b.attempts += 1;
    if (r.is_correct) b.correct += 1;
    dayBuckets.set(day, b);
  }

  const areas = Array.from(statByArea.values())
    .map((s) => {
      const approved = approvedByArea.get(s.area) ?? 0;
      const coveragePct = approved === 0 ? 0 : Math.round((s.attemptedIds.size / approved) * 100);
      const recentAcc = recentAccuracy(s.recent);
      const band = readinessBand({ coveragePct, accuracyPct: recentAcc, attempts: s.attempts });
      return {
        ...s,
        approved,
        coveragePct,
        recentAcc,
        accuracy: pct(s.correct, s.attempts),
        band,
      };
    })
    .sort((a, b) => a.sort - b.sort);

  const attemptedAreas = areas.filter((a) => a.attempts > 0);
  const weakAreas = attemptedAreas
    .slice()
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, WEAK_AREA_COUNT);

  // Study next: non-ready areas — attempted-and-weakest first, then untouched areas for coverage.
  const studyNext = areas
    .filter((a) => a.band !== "ready")
    .sort((a, b) => {
      const aTouched = a.attempts > 0;
      const bTouched = b.attempts > 0;
      if (aTouched !== bTouched) return aTouched ? -1 : 1;
      if (aTouched) return a.recentAcc - b.recentAcc || a.sort - b.sort;
      return a.sort - b.sort;
    })
    .slice(0, STUDY_NEXT_COUNT);

  const trend = Array.from(dayBuckets.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-TREND_DAYS)
    .map(([day, b]) => ({ day, accuracy: pct(b.correct, b.attempts), attempts: b.attempts }));

  const overall = pct(totalCorrect, totalAttempts);
  const readyCount = areas.filter((a) => a.band === "ready").length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Readiness by score area, weak spots, and a recent trend — from your answered questions.
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
                {totalCorrect}/{totalAttempts} correct · {readyCount}/{areas.length} areas ready
              </span>
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{overall}%</p>
            <div className="mt-3">
              <AccuracyBar accuracy={overall} />
            </div>
          </section>

          {/* Study next */}
          {studyNext.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Study next
              </h2>
              <ul className="space-y-3">
                {studyNext.map((a) => (
                  <li key={a.area} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{a.area}</span>
                        <BandChip band={a.band} />
                      </div>
                      <Link
                        href={`/practice?areas=${encodeURIComponent(a.area)}&n=10`}
                        className="shrink-0 text-sm underline underline-offset-4"
                      >
                        Practice →
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.attempts === 0
                        ? "not started"
                        : `${a.recentAcc}% recent accuracy · ${a.coveragePct}% covered (${a.attemptedIds.size}/${a.approved})`}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Weakest areas */}
          {weakAreas.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Weakest areas
              </h2>
              <ol className="space-y-3">
                {weakAreas.map((a) => (
                  <li key={a.area} className="rounded-lg border bg-card p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{a.area}</span>
                      <span className="text-sm text-muted-foreground">
                        {a.accuracy}% · {a.correct}/{a.attempts}
                        {a.attempts < LOW_SAMPLE && " · low sample"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <AccuracyBar accuracy={a.accuracy} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Readiness by area (blueprint order, includes not-yet-started areas) */}
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Readiness by score area
            </h2>
            <div className="space-y-3">
              {areas.map((a) => {
                const started = a.attempts > 0;
                return (
                  <div key={a.area} className="rounded-lg border bg-card p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{a.area}</span>
                        <BandChip band={a.band} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {started
                          ? `${a.recentAcc}% · ${a.coveragePct}% covered`
                          : "not started"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <AccuracyBar accuracy={started ? a.recentAcc : 0} />
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
