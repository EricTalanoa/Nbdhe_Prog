import { redirect } from "next/navigation";
import { CalendarDays, Palette, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { isThemeMode } from "@/lib/theme";
import { setExamDate, setShowTrickBadge } from "@/app/settings/actions";

// The by-study-method vs. by-exam-topic toggle used to live here; it's now a one-tap switch at
// the top of /dashboard instead (2026-07), so it doesn't take an extra trip to reach.
export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Missing column (migration not applied yet) or any read error → default to off/system.
  const { data: profile } = await supabase
    .from("profiles")
    .select("show_trick_badge, theme, exam_date")
    .eq("id", user.id)
    .maybeSingle();
  const showTrickBadge = profile?.show_trick_badge === true;
  const theme = isThemeMode(profile?.theme) ? profile.theme : "system";
  const examDate: string | null = profile?.exam_date ?? null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Settings" subtitle="Account-level preferences." />

      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Palette className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium leading-tight">Appearance</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Light or dark theme, or follow your device&rsquo;s setting. Syncs across your
              devices.
            </span>
          </span>
          <ThemeToggle initialTheme={theme} />
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium leading-tight">Exam date</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Powers the countdown on your dashboard. Leave it blank to hide the countdown.
            </span>
          </span>
          <form action={setExamDate} className="flex shrink-0 items-center gap-2">
            <input
              type="date"
              name="exam_date"
              defaultValue={examDate ?? ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button type="submit" variant="outline" size="sm">
              Save
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium leading-tight">Trick-question indicator</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Mark items where the answer choices are deliberately close (a &ldquo;Trick&rdquo;
              badge) while practicing. The real exam never flags these — leave it off for
              realistic pacing, turn it on to study why the near-miss options are wrong.
            </span>
          </span>
          <form action={setShowTrickBadge}>
            <input type="hidden" name="show_trick_badge" value={String(!showTrickBadge)} />
            <Button type="submit" variant={showTrickBadge ? "default" : "outline"} size="sm" className="shrink-0">
              {showTrickBadge ? "On" : "Off"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
