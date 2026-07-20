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
  NotebookText,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/dashboard/mode-toggle";
import { TopicGrid } from "@/components/topics/topic-grid";
import type { DashboardMode } from "@/app/dashboard/actions";

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
      { href: "/topics", icon: NotebookText, title: "Topic notes", desc: "Browse each area's overview + diagrams" },
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
  const mode: DashboardMode = profile?.dashboard_mode === "topic" ? "topic" : "method";
  const topicMode = mode === "topic";

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">NBDHE Prep 2026</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle mode={mode} />
          <div className="flex items-center gap-1">
            <Link href="/settings">
              <Button variant="ghost" size="icon" type="button" title="Settings">
                <Settings className="size-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <form action={signOut}>
              <Button variant="ghost" size="icon" type="submit" title="Sign out">
                <LogOut className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {topicMode ? (
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            By exam topic
          </h2>
          <TopicGrid />
        </div>
      ) : (
        <div className="space-y-9">
          {GROUPS.map((group) => (
            <section key={group.label}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
