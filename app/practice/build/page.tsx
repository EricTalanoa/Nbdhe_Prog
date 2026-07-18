import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const SET_SIZES = [5, 10, 20, 30, 50] as const;
const DEFAULT_SET_SIZE = 10;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const TIME_LIMITS = [
  { label: "Untimed", value: 0 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "20 min", value: 1200 },
] as const;

type RawRow = {
  difficulty: string;
  taxonomy: { score_area: string; sort_order: number } | { score_area: string; sort_order: number }[] | null;
};

function firstTaxonomy(t: RawRow["taxonomy"]) {
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
}

export default async function PracticeBuilderPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("questions")
    .select("difficulty, taxonomy(score_area, sort_order)")
    .in("status", ["approved", "live"]);

  const rows = (data ?? []) as unknown as RawRow[];

  // Per-score-area counts, ordered by the blueprint's taxonomy sort_order.
  const areaMap = new Map<string, { count: number; sort: number }>();
  const difficultyCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  for (const row of rows) {
    if (row.difficulty in difficultyCounts) difficultyCounts[row.difficulty] += 1;
    const tax = firstTaxonomy(row.taxonomy);
    if (!tax?.score_area) continue;
    const sortOrder = tax.sort_order ?? Number.MAX_SAFE_INTEGER;
    const existing = areaMap.get(tax.score_area);
    if (existing) {
      existing.count += 1;
      existing.sort = Math.min(existing.sort, sortOrder);
    } else {
      areaMap.set(tax.score_area, { count: 1, sort: sortOrder });
    }
  }
  const areas = Array.from(areaMap.entries())
    .map(([score_area, v]) => ({ score_area, ...v }))
    .sort((a, b) => a.sort - b.sort);
  const total = rows.length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader
        title="Build a practice set"
        backHref="back"
        subtitle={
          <>
            Pick score areas, difficulty, and how many questions. {total} question
            {total === 1 ? "" : "s"} in the approved bank.
          </>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load the question bank: {error.message}
        </div>
      )}

      {/* Native GET form: no client JS needed. Checked areas submit as repeated `areas` params,
          which /practice reads as a list. Leaving all areas unchecked means "any area". */}
      <form action="/practice" method="get" className="space-y-8">
        <fieldset>
          <legend className="text-sm font-medium">Score areas</legend>
          <p className="mb-3 text-xs text-muted-foreground">
            Leave all unchecked to draw from every area.
          </p>
          {areas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved questions yet.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {areas.map((a) => (
                <label
                  key={a.score_area}
                  className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="areas"
                    value={a.score_area}
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="flex-1">{a.score_area}</span>
                  <span className="text-xs text-muted-foreground">{a.count}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Difficulty</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
              <input type="radio" name="difficulty" value="" defaultChecked className="h-4 w-4" />
              <span>Any</span>
            </label>
            {DIFFICULTIES.map((d) => (
              <label
                key={d}
                className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm capitalize"
              >
                <input type="radio" name="difficulty" value={d} className="h-4 w-4" />
                <span>{d}</span>
                <span className="text-xs text-muted-foreground">{difficultyCounts[d]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Number of questions</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SET_SIZES.map((n) => (
              <label
                key={n}
                className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="n"
                  value={n}
                  defaultChecked={n === DEFAULT_SET_SIZE}
                  className="h-4 w-4"
                />
                <span>{n}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Time limit</legend>
          <p className="mb-3 text-xs text-muted-foreground">
            A timed test counts down and auto-submits when it runs out.
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_LIMITS.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="t"
                  value={t.value}
                  defaultChecked={t.value === 0}
                  className="h-4 w-4"
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <Button type="submit">Start set</Button>
          <Link href="/practice" className="text-sm text-muted-foreground underline underline-offset-4">
            Skip — random set of 10
          </Link>
        </div>
      </form>
    </main>
  );
}
