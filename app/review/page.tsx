import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewSession } from "@/components/review/review-session";
import type { ReviewCard } from "@/components/review/flashcard";

const DECK_SIZE = 20;

type RawOption = { label: string; body: string; is_correct: boolean };
type RawQuestion = {
  id: string;
  stem: string;
  options: RawOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
};

function toReviewCard(q: RawQuestion): ReviewCard | null {
  const correct = q.options.find((o) => o.is_correct);
  if (!correct) return null;
  const rationale = Array.isArray(q.rationales) ? q.rationales[0] : q.rationales;
  return {
    id: q.id,
    stem: q.stem,
    correctLabel: correct.label,
    correctBody: correct.body,
    correctExplanation: rationale?.correct_explanation ?? null,
  };
}

export default async function ReviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("questions")
    .select("id, stem, options(label, body, is_correct), rationales(correct_explanation)")
    .in("status", ["approved", "live"]);

  // Schedule may not exist yet (migration pending) — degrade to "everything is a new card".
  const { data: scheduleRows } = await supabase
    .from("review_schedule")
    .select("question_id, due_at");
  const dueAtById = new Map<string, string>();
  for (const r of (scheduleRows ?? []) as { question_id: string; due_at: string }[]) {
    dueAtById.set(r.question_id, r.due_at);
  }

  const raw = (data ?? []) as unknown as RawQuestion[];
  const now = Date.now();

  const due: { card: ReviewCard; dueAt: number }[] = [];
  const fresh: ReviewCard[] = [];
  for (const q of raw) {
    const card = toReviewCard(q);
    if (!card) continue;
    const scheduled = dueAtById.get(q.id);
    if (scheduled === undefined) {
      fresh.push(card);
    } else if (new Date(scheduled).getTime() <= now) {
      due.push({ card, dueAt: new Date(scheduled).getTime() });
    }
    // scheduled and not yet due → skip (not in this session's deck)
  }

  // Due cards first (most overdue first), then new cards to fill the deck.
  due.sort((a, b) => a.dueAt - b.dueAt);
  const deck: ReviewCard[] = [...due.map((d) => d.card), ...fresh].slice(0, DECK_SIZE);

  const dueCount = due.length;
  const newCount = Math.max(0, deck.length - dueCount);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flashcard review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Spaced repetition · {dueCount} due
            {newCount > 0 && ` · ${newCount} new`}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load questions: {error.message}
        </div>
      ) : (
        <ReviewSession cards={deck} />
      )}
    </main>
  );
}
