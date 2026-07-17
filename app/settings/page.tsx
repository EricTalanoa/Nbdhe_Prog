import { redirect } from "next/navigation";
import { LayoutGrid, ListTree } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { setDashboardMode, type DashboardMode } from "@/app/settings/actions";

const MODES: { value: DashboardMode; icon: typeof LayoutGrid; title: string; desc: string }[] = [
  {
    value: "method",
    icon: LayoutGrid,
    title: "By study method",
    desc: "Today's dashboard — Practice, Review, and Exam grouped by what you're doing.",
  },
  {
    value: "topic",
    icon: ListTree,
    title: "By exam topic",
    desc: "A grid of the blueprint score areas — pick a topic, get its notes and study options.",
  },
];

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Missing column (migration not applied yet) or any read error → default to 'method'.
  const { data: profile } = await supabase
    .from("profiles")
    .select("dashboard_mode")
    .eq("id", user.id)
    .maybeSingle();
  const currentMode: DashboardMode = profile?.dashboard_mode === "topic" ? "topic" : "method";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Settings" subtitle="Choose how your dashboard is organized." />

      <div className="space-y-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = m.value === currentMode;
          return (
            <div
              key={m.value}
              className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${
                active ? "border-primary/60 bg-primary/5" : "bg-card"
              }`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-tight">{m.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{m.desc}</span>
              </span>
              {active ? (
                <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  Active
                </span>
              ) : (
                <form action={setDashboardMode}>
                  <input type="hidden" name="mode" value={m.value} />
                  <Button type="submit" variant="outline" size="sm" className="shrink-0">
                    Use this
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
