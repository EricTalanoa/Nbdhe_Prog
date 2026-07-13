import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewSession } from "@/components/review/review-session";
import type { ReviewCard } from "@/components/review/flashcard";
import { PageHeader } from "@/components/ui/page-header";
import { getQuestionSet } from "@/lib/question-sets";

const DECK_SIZE = 20;

type TaxRef = { score_area: string; subdomain: string | null };
type RawOption = { label: string; body: string; is_correct: boolean };
type RawQuestion = {
  id: string;
  stem: string;
  options: RawOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
  taxonomy: TaxRef | TaxRef[] | null;
};
type RawFlashcard = { id: string; front: string; back: string; taxonomy: TaxRef | TaxRef[] | null };

function parseList(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function taxOf(t: TaxRef | TaxRef[] | null): TaxRef | null {
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
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

  const set = searchParams.set ? getQuestionSet(searchParams.set) : undefined;
  const areas = set?.areas ?? parseList(searchParams.areas);
  const subs = set?.subs ?? parseList(searchParams.sub);
  const areaSet = new Set(areas);
  const subSet = new Set(subs);
  const filtered = areas.length > 0 || subs.length > 0;

  const inTopic = (t: TaxRef | TaxRef[] | null): boolean => {
    if (!filtered) return true;
    const tax = taxOf(t);
    const inArea = areaSet.size > 0 && !!tax?.score_area && areaSet.has(tax.score_area);
    const inSub = subSet.size > 0 && !!tax?.subdomain && subSet.has(tax.subdomain);
    return inArea || inSub;
  };

  const { data: qData, error } = await supabase
    .from("questions")
    .select(
      "id, stem, options(label, body, is_correct), rationales(correct_explanation), taxonomy(score_area, subdomain)"
    )
    .in("status", ["approved", "live"]);

  // Dedicated flashcards + their schedule may not exist yet (migration pending) → degrade to none.
  const { data: fcData } = await supabase
    .from("flashcards")
    .select("id, front, back, taxonomy(score_area, subdomain)")
    .in("status", ["approved", "live"]);

  const { data: qSchedule } = await supabase.from("review_schedule").select("question_id, due_at");
  const { data: fcSchedule } = await supabase
    .from("flashcard_schedule")
    .select("flashcard_id, due_at");

  const qDueAt = new Map<string, string>();
  for (const r of (qSchedule ?? []) as { question_id: string; due_at: string }[]) qDueAt.set(r.question_id, r.due_at);
  const fcDueAt = new Map<string, string>();
  for (const r of (fcSchedule ?? []) as { flashcard_id: string; due_at: string }[]) fcDueAt.set(r.flashcard_id, r.due_at);

  const now = Date.now();
  const due: { card: ReviewCard; dueAt: number }[] = [];
  const fresh: ReviewCard[] = [];

  // Question-derived cards.
  for (const q of (qData ?? []) as unknown as RawQuestion[]) {
    if (!inTopic(q.taxonomy)) continue;
    const correct = q.options.find((o) => o.is_correct);
    if (!correct) continue;
    const rationale = Array.isArray(q.rationales) ? q.rationales[0] : q.rationales;
    const card: ReviewCard = {
      id: q.id,
      kind: "question",
      front: q.stem,
      back: `${correct.label}. ${correct.body}`,
      note: rationale?.correct_explanation ?? null,
    };
    const scheduled = qDueAt.get(q.id);
    if (scheduled === undefined) fresh.push(card);
    else if (new Date(scheduled).getTime() <= now) due.push({ card, dueAt: new Date(scheduled).getTime() });
  }

  // Dedicated flashcards.
  for (const f of (fcData ?? []) as unknown as RawFlashcard[]) {
    if (!inTopic(f.taxonomy)) continue;
    const card: ReviewCard = { id: f.id, kind: "flashcard", front: f.front, back: f.back, note: null };
    const scheduled = fcDueAt.get(f.id);
    if (scheduled === undefined) fresh.push(card);
    else if (new Date(scheduled).getTime() <= now) due.push({ card, dueAt: new Date(scheduled).getTime() });
  }

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
