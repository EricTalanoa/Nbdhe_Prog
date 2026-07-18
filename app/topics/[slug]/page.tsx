import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { topicSlug, TOPIC_NOTES, DEFAULT_TOPIC_NOTE, TOPIC_DIAGRAMS } from "@/lib/topics";

const PRACTICE_SET_SIZE = 10;

type TaxRef = { score_area: string };
type ApprovedRow = { id: string; taxonomy: TaxRef | TaxRef[] | null };

function scoreAreaOf(t: ApprovedRow["taxonomy"]): string | null {
  if (!t) return null;
  return (Array.isArray(t) ? t[0] : t)?.score_area ?? null;
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Same live taxonomy query /analytics uses — the topic list is never hardcoded, so a slug is
  // only valid if it still matches a current score_area.
  const { data: taxRows } = await supabase.from("taxonomy").select("score_area, sort_order");
  const areaOrder = new Map<string, number>();
  for (const t of (taxRows ?? []) as { score_area: string; sort_order: number }[]) {
    const cur = areaOrder.get(t.score_area);
    if (cur === undefined || t.sort_order < cur) areaOrder.set(t.score_area, t.sort_order);
  }
  const area = Array.from(areaOrder.keys()).find((a) => topicSlug(a) === params.slug);
  if (!area) notFound();

  const { data: approvedData } = await supabase
    .from("questions")
    .select("id, taxonomy(score_area)")
    .in("status", ["approved", "live"]);
  const approvedCount = ((approvedData ?? []) as unknown as ApprovedRow[]).filter(
    (q) => scoreAreaOf(q.taxonomy) === area
  ).length;

  const note = TOPIC_NOTES[area] ?? DEFAULT_TOPIC_NOTE;
  const noteParagraphs = note.split("\n\n");
  const Diagram = TOPIC_DIAGRAMS[area];
  const practiceHref = `/practice?areas=${encodeURIComponent(area)}&n=${PRACTICE_SET_SIZE}`;
  const flashcardsHref = `/review?areas=${encodeURIComponent(area)}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title={area} backHref="/dashboard" backLabel="Dashboard" />

      <section className="mb-8 rounded-xl border bg-card p-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Overview
        </h2>
        <div className="space-y-3">
          {noteParagraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
        {Diagram && <Diagram />}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Study this topic
        </h2>
        <div className="space-y-3">
          <Link
            href={practiceHref}
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium leading-tight">Practice</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {approvedCount > 0
                  ? `${Math.min(PRACTICE_SET_SIZE, approvedCount)} questions from ${approvedCount} in this area`
                  : "Study mode with rationales"}
              </span>
            </span>
          </Link>
          <Link
            href={flashcardsHref}
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium leading-tight">Flashcards</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Spaced-repetition recall for this area
              </span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
