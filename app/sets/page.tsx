import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ClipboardList,
  HeartPulse,
  Microscope,
  Pill,
  ScanLine,
  ShieldCheck,
  Syringe,
  Users,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { QUESTION_SETS, questionSetHref, matchesSet } from "@/lib/question-sets";

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
        title="Question sets"
        subtitle="Jump into a focused set on a specific topic — no filters to configure."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {QUESTION_SETS.map((set) => {
          const Icon = ICONS[set.icon] ?? ClipboardList;
          const count = counts.get(set.slug) ?? 0;
          const empty = count === 0;

          const inner = (
            <>
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                  empty ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-tight">{set.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{set.description}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {empty ? "No questions yet" : `${count} question${count === 1 ? "" : "s"}`}
                </span>
              </span>
              {!empty && (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              )}
            </>
          );

          return empty ? (
            <div
              key={set.slug}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 opacity-60"
            >
              {inner}
            </div>
          ) : (
            <Link
              key={set.slug}
              href={questionSetHref(set)}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
