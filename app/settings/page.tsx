import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

// The by-study-method vs. by-exam-topic toggle used to live here; it's now a one-tap switch at
// the top of /dashboard instead (2026-07), so it doesn't take an extra trip to reach. This page
// is the home for account-level preferences as they're added.
export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Settings" subtitle="Account-level preferences." />
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nothing to configure here yet.
      </p>
    </main>
  );
}
