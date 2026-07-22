import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flag,
  Flame,
  GraduationCap,
  Layers,
  LayoutGrid,
  LogOut,
  NotebookText,
  Play,
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

type Group = "Practice" | "Review" | "Explore";
type Tile = { href: string; icon: LucideIcon; title: string; desc: string; group: Group };

// The 8 non-flagship destinations (Quick set, Mock exam, Flashcards get bespoke tiles).
const SMALL_TILES: Tile[] = [
  { href: "/sets", icon: LayoutGrid, title: "Question sets", desc: "One-tap sets by topic", group: "Practice" },
  { href: "/practice/build", icon: SlidersHorizontal, title: "Build a set", desc: "Areas, difficulty, timer", group: "Practice" },
  { href: "/practice?mode=missed", icon: RotateCcw, title: "Review missed", desc: "Retry wrong answers", group: "Review" },
  { href: "/practice?mode=flagged", icon: Flag, title: "Review flagged", desc: "Flagged to revisit", group: "Review" },
  { href: "/topics", icon: NotebookText, title: "Topic notes", desc: "Overviews + diagrams", group: "Review" },
  { href: "/cases", icon: Stethoscope, title: "Cases", desc: "Patient cases + questions", group: "Explore" },
  { href: "/analytics", icon: BarChart3, title: "Progress", desc: "Readiness + weak spots", group: "Explore" },
  { href: "/questions", icon: BookOpen, title: "Question bank", desc: "Every approved question", group: "Explore" },
];

// chart-1 = teal (Practice), chart-2 = cyan (Review), chart-5 = blue (Explore)
const GROUP_TONE: Record<Group, { chip: string; icon: string }> = {
  Practice: { chip: "text-[hsl(var(--chart-1))] bg-[hsl(var(--chart-1)/0.12)]", icon: "text-[hsl(var(--chart-1))]" },
  Review: { chip: "text-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2)/0.12)]", icon: "text-[hsl(var(--chart-2))]" },
  Explore: { chip: "text-[hsl(var(--chart-5))] bg-[hsl(var(--chart-5)/0.12)]", icon: "text-[hsl(var(--chart-5))]" },
};

const TILE =
  "group rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 " +
  "hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function greeting(name: string | null) {
  const h = new Date().getHours();
  const tod = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  return name ? `Good ${tod}, ${name}` : `Good ${tod}`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Requires the exam_date migration; on any read error both fall back gracefully.
  const { data: profile } = await supabase
    .from("profiles")
    .select("dashboard_mode, exam_date")
    .eq("id", user.id)
    .maybeSingle();
  const mode: DashboardMode = profile?.dashboard_mode === "topic" ? "topic" : "method";
  const topicMode = mode === "topic";

  const examDays = profile?.exam_date
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / 86_400_000))
    : null;
  const examLabel = profile?.exam_date
    ? new Date(profile.exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    null;

  // TODO: read from a sessions table when it exists; null = Quick-set fallback hero.
  const lastSession = null as { title: string; left: number; pct: number } | null;
  const streakDays = null as number | null; // TODO: derive from attempt history

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">NBDHE Prep 2026</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{greeting(firstName)}</h1>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {streakDays != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--chart-4)/0.13)] px-2.5 py-1 text-xs font-semibold text-[hsl(36,70%,34%)] dark:text-[hsl(var(--chart-4))]">
                <Flame className="size-3.5" /> {streakDays}-day streak
              </span>
            )}
            {examDays != null ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                <CalendarDays className="size-3.5" /> {examDays} days to exam · {examLabel}
              </span>
            ) : (
              <Link href="/settings" className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                <CalendarDays className="size-3.5" /> Set your exam date
              </Link>
            )}
          </div>
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
        <TopicGrid />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[7.5rem] sm:gap-3.5">
          {/* Hero — continue (or jump in) */}
          <Link
            href="/practice"
            className={`${TILE} col-span-2 flex flex-col justify-between gap-4 bg-gradient-to-br from-primary/15 via-card to-card p-5 sm:col-span-3 sm:row-span-2 sm:p-6`}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
              {lastSession ? "Continue studying" : "Start studying"}
            </span>
            <span className="space-y-2">
              <span className="block text-lg font-semibold sm:text-xl">
                {lastSession ? lastSession.title : "Pick up where the blueprint is weakest"}
              </span>
              <span className="block text-sm text-muted-foreground">
                {lastSession
                  ? `${lastSession.left} questions left · ${lastSession.pct}% correct so far`
                  : "A quick set is the fastest way back in."}
              </span>
              {lastSession && (
                <span className="block h-1.5 max-w-md rounded-full bg-primary/15">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${lastSession.pct}%` }} />
                </span>
              )}
            </span>
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              <Play className="size-3.5" /> {lastSession ? "Continue" : "Quick set"}
            </span>
          </Link>

          {/* Quick set — flagship, filled */}
          <Link
            href="/practice"
            className="group col-span-2 flex flex-col justify-between gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:col-span-1 sm:row-span-2"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
              <Zap className="size-5" />
            </span>
            <span className="space-y-1">
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.13em] opacity-75">Practice</span>
              <span className="block text-lg font-semibold">Quick set</span>
              <span className="block text-xs opacity-80">10 random questions, study mode</span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold opacity-90">
              Start now <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Flagships */}
          <Link href="/mock" className={`${TILE} col-span-2 flex items-center gap-4 border-[hsl(var(--chart-4)/0.35)] bg-[hsl(var(--chart-4)/0.09)] p-5`}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-4))] text-[hsl(45,60%,15%)]">
              <GraduationCap className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.13em] text-[hsl(36,70%,34%)] dark:text-[hsl(var(--chart-4))]">Exam</span>
              <span className="block font-semibold">Mock exam</span>
              <span className="block truncate text-xs text-muted-foreground">Timed, two-component NBDHE format</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
          <Link href="/review" className={`${TILE} col-span-2 flex items-center gap-4 border-[hsl(var(--chart-3)/0.35)] bg-[hsl(var(--chart-3)/0.09)] p-5`}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-3))] text-white">
              <Layers className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.13em] text-[hsl(var(--chart-3))]">Review</span>
              <span className="block font-semibold">Flashcards</span>
              <span className="block truncate text-xs text-muted-foreground">Spaced-repetition recall of due cards</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>

          {/* Everything else */}
          {SMALL_TILES.map((tile) => {
            const Icon = tile.icon;
            const tone = GROUP_TONE[tile.group];
            return (
              <Link key={tile.href} href={tile.href} className={`${TILE} flex flex-col justify-between gap-3 p-4`}>
                <span className="flex items-center justify-between">
                  <Icon className={`size-[18px] ${tone.icon}`} />
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.11em] ${tone.chip}`}>
                    {tile.group}
                  </span>
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-tight">{tile.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">{tile.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
