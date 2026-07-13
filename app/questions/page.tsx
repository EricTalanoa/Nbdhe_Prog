import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

// Phase 1 raw content browser: proves seeded questions are visible end-to-end.
// Not the study UI — that's Phase 2. This just lists what's in the bank, grouped by
// score area, so we can eyeball the import.

type TaxonomyRef = {
  area: string;
  domain: string | null;
  subdomain: string | null;
  score_area: string;
  sort_order: number;
};

type QuestionRow = {
  slug: string;
  stem: string;
  format: string;
  difficulty: string;
  status: string;
  taxonomy: TaxonomyRef | null;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  live: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
};

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default async function QuestionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("questions")
    .select("slug, stem, format, difficulty, status, taxonomy(area, domain, subdomain, score_area, sort_order)")
    .order("slug", { ascending: true });

  const questions = (data ?? []) as unknown as QuestionRow[];

  // Group by score area, ordered by the taxonomy sort_order so the page mirrors the blueprint.
  const groups = new Map<string, QuestionRow[]>();
  for (const q of questions) {
    const key = q.taxonomy?.score_area ?? "Untagged";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }
  const orderedGroups = Array.from(groups.entries()).sort((a, b) => {
    const sa = Math.min(...a[1].map((q) => q.taxonomy?.sort_order ?? Number.MAX_SAFE_INTEGER));
    const sb = Math.min(...b[1].map((q) => q.taxonomy?.sort_order ?? Number.MAX_SAFE_INTEGER));
    return sa - sb;
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="Question bank"
        subtitle={
          <>
            {questions.length} question{questions.length === 1 ? "" : "s"} across{" "}
            {orderedGroups.length} score area{orderedGroups.length === 1 ? "" : "s"}
          </>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load questions: {error.message}
        </div>
      )}

      {!error && questions.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No questions yet.</p>
          <p className="mt-2">
            Apply the migrations, then run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">npm run content:import</code> to seed the
            bank from the vault notes.
          </p>
        </div>
      )}

      <div className="space-y-10">
        {orderedGroups.map(([scoreArea, items]) => (
          <section key={scoreArea}>
            <h2 className="mb-3 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {scoreArea} · {items.length}
            </h2>
            <ul className="space-y-3">
              {items.map((q) => (
                <li key={q.slug} className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <code className="text-xs text-muted-foreground">{q.slug}</code>
                    <Badge className="bg-secondary text-secondary-foreground">{q.format}</Badge>
                    <Badge className="bg-secondary text-secondary-foreground">{q.difficulty}</Badge>
                    <Badge className={STATUS_STYLES[q.status] ?? "bg-muted text-muted-foreground"}>
                      {q.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{q.stem}</p>
                  {q.taxonomy && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {q.taxonomy.domain}
                      {q.taxonomy.subdomain ? ` · ${q.taxonomy.subdomain}` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
