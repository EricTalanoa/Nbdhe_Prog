import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { TopicGrid } from "@/components/topics/topic-grid";

// Standalone index of the by-exam-topic grid, reachable from the "Review" group even when the
// dashboard is in by-study-method mode — so the topic overview notes + diagrams (7d) aren't
// stranded behind the topic dashboard toggle.
export default async function TopicsIndexPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Topics" subtitle="Notes, diagrams, and study options for each blueprint area." />
      <TopicGrid />
    </main>
  );
}
