import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewSession } from "@/components/review/review-session";
import type { ReviewCard } from "@/components/review/flashcard";
import { PageHeader } from "@/components/ui/page-header";
import { getQuestionSet } from "@/lib/question-sets";

const DECK_SIZE = 20;

type RawOption = { label: string; body: string; is_correct: boolean };
type TaxRef = { score_area: string; subdomain: string | null };
type RawQuestion = {
  id: string;
  stem: string;
  options: RawOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
  taxonomy: TaxRef | TaxRef[] | null;
};

function parseList(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function taxOf(t: RawQuestion["taxonomy"]): TaxRef | null {
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
}

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

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: { set?: string; areas?: string | string[]; sub?: string | string[] };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A `set` slug resolves to its areas/subs + a title; raw areas/sub also work.
  const set = searchParams.set ? getQuestionSet(searchParams.set) : undefined;
  const areas = set?.areas ?? parseList(searchParams.areas);
  const subs = set?.subs ?? parseList(searchParams.sub);
  const areaSet = new Set(areas);
  const subSet = new Set(subs);
  const filtered = areas.length > 0 || subs.length > 0;

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, stem, options(label, body, is_correct), rationales(correct_explanation), taxonomy(score_area, subdomain)"
    )
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
    // Topic filter (flashcard category): keep only questions in the chosen areas/subdomains.
    if (filtered) {
      const tax = taxOf(q.taxonomy);
      const inArea = areaSet.size > 0 && tax?.score_area && areaSet.has(tax.score_area);
      const inSub = subSet.size > 0 && tax?.subdomain && subSet.has(tax.subdomain);
      if (!inArea && !inSub) continue;
    }
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
  const title = set ? `${set.title} · flashcards` : "Flashcard review";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader
        title={title}
        subtitle={
          <>
            Spaced repetition · {dueCount} due{newCount > 0 && ` · ${newCount} new`}
            {filtered && (
              <>
                {" "}·{" "}
                <Link href="/sets" className="underline underline-offset-4">
                  all sets
                </Link>
              </>
            )}
          </>
        }
      />

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
