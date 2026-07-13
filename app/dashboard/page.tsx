import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-sm">
        signed in as <span className="font-medium">{user.email}</span>
      </p>
      <Link href="/practice/build" className="text-sm underline underline-offset-4">
        Build a practice set
      </Link>
      <Link href="/practice" className="text-sm underline underline-offset-4">
        Quick set — 10 random
      </Link>
      <Link href="/practice?mode=missed" className="text-sm underline underline-offset-4">
        Review missed questions
      </Link>
      <Link href="/practice?mode=flagged" className="text-sm underline underline-offset-4">
        Review flagged questions
      </Link>
      <Link href="/review" className="text-sm underline underline-offset-4">
        Flashcard review
      </Link>
      <Link href="/mock" className="text-sm underline underline-offset-4">
        Take a mock exam
      </Link>
      <Link href="/analytics" className="text-sm underline underline-offset-4">
        View progress
      </Link>
      <Link href="/questions" className="text-sm underline underline-offset-4">
        Browse question bank
      </Link>
      <Link href="/cases" className="text-sm underline underline-offset-4">
        Browse cases
      </Link>
      <form action={signOut}>
        <Button variant="outline" size="sm" type="submit">
          Sign out
        </Button>
      </form>
    </main>
  );
}
