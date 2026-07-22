import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { topicIcon, topicSlug } from "@/lib/topics";

// Shared by the by-exam-topic dashboard mode and the standalone /topics index (reachable from the
// "Review" group in by-study-method mode) so both stay in sync with the live taxonomy instead of
// a hardcoded list.

// Chart-token hues cycled across tiles (teal, cyan, green, blue, amber).
const TONES = ["--chart-1", "--chart-2", "--chart-3", "--chart-5", "--chart-4"] as const;

export function TopicTile({ area, tone = "--primary" }: { area: string; tone?: string }) {
  const Icon = topicIcon(area);
  return (
    <Link
      href={`/topics/${topicSlug(area)}`}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ color: `hsl(var(${tone}))`, backgroundColor: `hsl(var(${tone}) / 0.12)` }}
      >
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
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
          <Layers className="size-5" />
        </span>
        <p className="font-medium">No topics yet</p>
        <p className="text-sm text-muted-foreground">Topics appear here once the question bank is loaded.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {topicAreas.map((area, i) => (
        <TopicTile key={area} area={area} tone={TONES[i % TONES.length]} />
      ))}
    </div>
  );
}
