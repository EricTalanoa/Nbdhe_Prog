import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { setShowTrickBadge } from "@/app/settings/actions";

// The by-study-method vs. by-exam-topic toggle used to live here; it's now a one-tap switch at
// the top of /dashboard instead (2026-07), so it doesn't take an extra trip to reach.
export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Missing column (migration not applied yet) or any read error → default to off.
  const { data: profile } = await supabase
    .from("profiles")
    .select("show_trick_badge")
    .eq("id", user.id)
    .maybeSingle();
  const showTrickBadge = profile?.show_trick_badge === true;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Settings" subtitle="Account-level preferences." />

      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-tight">Trick-question indicator</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            Mark items where the answer choices are deliberately close (a &ldquo;Trick&rdquo;
            badge) while practicing. The real exam never flags these — leave it off for realistic
            pacing, turn it on to study why the near-miss options are wrong.
          </span>
        </span>
        <form action={setShowTrickBadge}>
          <input type="hidden" name="show_trick_badge" value={String(!showTrickBadge)} />
          <Button type="submit" variant={showTrickBadge ? "default" : "outline"} size="sm" className="shrink-0">
            {showTrickBadge ? "On" : "Off"}
          </Button>
        </form>
      </div>
    </main>
  );
}
