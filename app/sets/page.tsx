import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ClipboardList,
  HeartPulse,
  Layers,
  Microscope,
  Pill,
  ScanLine,
  ShieldCheck,
  Syringe,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { QUESTION_SETS, questionSetHref, reviewSetHref, matchesSet } from "@/lib/question-sets";

const ICONS: Record<string, LucideIcon> = {
  Syringe,
  Pill,
  Activity,
  ScanLine,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Microscope,
  Users,
};

type TaxRef = { score_area: string; subdomain: string | null };
type Row = { taxonomy: TaxRef | TaxRef[] | null };

function taxOf(t: Row["taxonomy"]): TaxRef | null {
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
}

export default async function SetsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("questions")
    .select("taxonomy(score_area, subdomain)")
    .in("status", ["approved", "live"]);
  const rows = (data ?? []) as unknown as Row[];

  const counts = new Map<string, number>();
  for (const set of QUESTION_SETS) {
    let n = 0;
    for (const r of rows) {
      const tax = taxOf(r.taxonomy);
      if (matchesSet(set, tax?.score_area ?? null, tax?.subdomain ?? null)) n += 1;
    }
    counts.set(set.slug, n);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="Topic sets"
        subtitle="Study a specific topic as a practice set or as flashcards — no filters to configure."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {QUESTION_SETS.map((set) => {
          const Icon = ICONS[set.icon] ?? ClipboardList;
          const count = counts.get(set.slug) ?? 0;
          const empty = count === 0;

          return (
            <div
              key={set.slug}
              className={`flex flex-col rounded-xl border bg-card p-4 ${empty ? "opacity-60" : "shadow-sm"}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                    empty ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{set.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{set.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {empty ? "No questions yet" : `${count} question${count === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>

              {!empty && (
                <div className="mt-4 flex gap-2">
                  <Link
                    href={questionSetHref(set)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Zap className="size-4" /> Practice
                  </Link>
                  <Link
                    href={reviewSetHref(set)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Layers className="size-4" /> Flashcards
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
