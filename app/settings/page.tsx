import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { TrapHintsToggle } from "@/components/settings/trap-hints-toggle";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("show_trap_hints")
    .eq("id", user.id)
    .maybeSingle();
  const showTrapHints = Boolean(profile?.show_trap_hints);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Settings" backHref="/dashboard" backLabel="Dashboard" />

      <Card className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="font-medium">Reveal trick questions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Shows a “wording trap” badge on tricky questions and, after you answer, explains the
            word that decides the answer. Off means questions look exactly like the real exam.
            Mock exams never show these hints.
          </p>
        </div>
        <TrapHintsToggle initial={showTrapHints} />
      </Card>
    </main>
  );
}
