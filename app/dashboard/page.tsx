import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Flag,
  GraduationCap,
  Layers,
  LayoutGrid,
  LogOut,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { topicSlug } from "@/lib/topics";

type Tile = { href: string; icon: LucideIcon; title: string; desc: string };

const GROUPS: { label: string; tiles: Tile[] }[] = [
  {
    label: "Practice",
    tiles: [
      { href: "/sets", icon: LayoutGrid, title: "Question sets", desc: "One-tap sets by topic (LA, perio, radiology…)" },
      { href: "/practice/build", icon: SlidersHorizontal, title: "Build a set", desc: "Pick areas, difficulty, size, and a timer" },
      { href: "/practice", icon: Zap, title: "Quick set", desc: "10 random questions, study mode" },
    ],
  },
  {
    label: "Review",
    tiles: [
      { href: "/review", icon: Layers, title: "Flashcards", desc: "Spaced-repetition recall of due cards" },
      { href: "/practice?mode=missed", icon: RotateCcw, title: "Review missed", desc: "Retry questions you've gotten wrong" },
      { href: "/practice?mode=flagged", icon: Flag, title: "Review flagged", desc: "Questions you flagged to revisit" },
    ],
  },
  {
    label: "Exam & explore",
    tiles: [
      { href: "/mock", icon: GraduationCap, title: "Mock exam", desc: "Timed, two-component NBDHE format" },
      { href: "/cases", icon: Stethoscope, title: "Cases", desc: "Patient cases with linked questions" },
      { href: "/analytics", icon: BarChart3, title: "Progress", desc: "Readiness by area, weak spots, trend" },
      { href: "/questions", icon: BookOpen, title: "Question bank", desc: "Browse every approved question" },
    ],
  },
];

function TileCard({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  return (
    <Link
      href={tile.href}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight">{tile.title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{tile.desc}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function TopicTile({ area }: { area: string }) {
  return (
    <Link
      href={`/topics/${topicSlug(area)}`}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="min-w-0 flex-1 font-medium leading-tight">{area}</span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Missing column (migration not applied yet) or any read error → default to the method layout.
  const { data: profile } = await supabase
    .from("profiles")
    .select("dashboard_mode")
    .eq("id", user.id)
    .maybeSingle();
  const topicMode = profile?.dashboard_mode === "topic";

  // Same live taxonomy query /analytics uses: dedupe score_area, keep the min sort_order seen.
  let topicAreas: string[] = [];
  if (topicMode) {
    const { data: taxRows } = await supabase.from("taxonomy").select("score_area, sort_order");
    const areaOrder = new Map<string, number>();
    for (const t of (taxRows ?? []) as { score_area: string; sort_order: number }[]) {
      const cur = areaOrder.get(t.score_area);
      if (cur === undefined || t.sort_order < cur) areaOrder.set(t.score_area, t.sort_order);
    }
    topicAreas = Array.from(areaOrder.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([area]) => area);
  }

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">NBDHE Prep</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="outline" size="sm" type="button" className="gap-1.5">
              <Settings className="size-3.5" />
              Settings
            </Button>
          </Link>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit" className="gap-1.5">
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {topicMode ? (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            By exam topic
          </h2>
          {topicAreas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {topicAreas.map((area) => (
                <TopicTile key={area} area={area} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.tiles.map((tile) => (
                  <TileCard key={tile.href} tile={tile} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
