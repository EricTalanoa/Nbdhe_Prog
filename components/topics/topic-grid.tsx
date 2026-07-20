import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { topicIcon, topicSlug } from "@/lib/topics";

// Shared by the by-exam-topic dashboard mode and the standalone /topics index (reachable from the
// "Review" group in by-study-method mode) so both stay in sync with the live taxonomy instead of
// a hardcoded list.
export function TopicTile({ area }: { area: string }) {
  const Icon = topicIcon(area);
  return (
    <Link
      href={`/topics/${topicSlug(area)}`}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 font-medium leading-tight">{area}</span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export async function TopicGrid() {
  const supabase = createClient();

  // Same live taxonomy query /analytics uses: dedupe score_area, keep the min sort_order seen.
  const { data: taxRows } = await supabase.from("taxonomy").select("score_area, sort_order");
  const areaOrder = new Map<string, number>();
  for (const t of (taxRows ?? []) as { score_area: string; sort_order: number }[]) {
    const cur = areaOrder.get(t.score_area);
    if (cur === undefined || t.sort_order < cur) areaOrder.set(t.score_area, t.sort_order);
  }
  const topicAreas = Array.from(areaOrder.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([area]) => area);

  if (topicAreas.length === 0) {
    return <p className="text-sm text-muted-foreground">No topics yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {topicAreas.map((area) => (
        <TopicTile key={area} area={area} />
      ))}
    </div>
  );
}
