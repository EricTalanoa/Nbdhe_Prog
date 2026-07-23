import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewSession } from "@/components/review/review-session";
import type { ReviewCard } from "@/components/review/flashcard";
import { PageHeader } from "@/components/ui/page-header";
import { getQuestionSet } from "@/lib/question-sets";
import { NEW_CARD, type CardState } from "@/lib/srs";

const DECK_SIZE = 20;

type RawSchedule = { due_at: string; ease: number; interval_days: number };

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

// Card eyebrow label — the narrowest thing we know about the card ("Caries" over "Clinical").
function topicOf(t: TaxRef | TaxRef[] | null): string | null {
  const tax = taxOf(t);
  return tax?.subdomain ?? tax?.score_area ?? null;
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

  const { data: qSchedule } = await supabase
    .from("review_schedule")
    .select("question_id, due_at, ease, interval_days");
  const { data: fcSchedule } = await supabase
    .from("flashcard_schedule")
    .select("flashcard_id, due_at, ease, interval_days");

  type Sched = { due_at: string; state: CardState };
  const toState = (r: { ease: number; interval_days: number }): CardState => ({
    ease: r.ease,
    intervalDays: r.interval_days,
  });

  const qSched = new Map<string, Sched>();
  for (const r of (qSchedule ?? []) as (RawSchedule & { question_id: string })[])
    qSched.set(r.question_id, { due_at: r.due_at, state: toState(r) });
  const fcSched = new Map<string, Sched>();
  for (const r of (fcSchedule ?? []) as (RawSchedule & { flashcard_id: string })[])
    fcSched.set(r.flashcard_id, { due_at: r.due_at, state: toState(r) });

  const now = Date.now();
  const due: { card: ReviewCard; dueAt: number }[] = [];
  const fresh: ReviewCard[] = [];

  // Question-derived cards.
  for (const q of (qData ?? []) as unknown as RawQuestion[]) {
    if (!inTopic(q.taxonomy)) continue;
    const correct = q.options.find((o) => o.is_correct);
    if (!correct) continue;
    const rationale = Array.isArray(q.rationales) ? q.rationales[0] : q.rationales;
    const scheduled = qSched.get(q.id);
    const card: ReviewCard = {
      id: q.id,
      kind: "question",
      front: q.stem,
      back: `${correct.label}. ${correct.body}`,
      note: rationale?.correct_explanation ?? null,
      topic: topicOf(q.taxonomy),
      state: scheduled?.state ?? NEW_CARD,
    };
    if (scheduled === undefined) fresh.push(card);
    else if (new Date(scheduled.due_at).getTime() <= now)
      due.push({ card, dueAt: new Date(scheduled.due_at).getTime() });
  }

  // Dedicated flashcards.
  for (const f of (fcData ?? []) as unknown as RawFlashcard[]) {
    if (!inTopic(f.taxonomy)) continue;
    const scheduled = fcSched.get(f.id);
    const card: ReviewCard = {
      id: f.id,
      kind: "flashcard",
      front: f.front,
      back: f.back,
      note: null,
      topic: topicOf(f.taxonomy),
      state: scheduled?.state ?? NEW_CARD,
    };
    if (scheduled === undefined) fresh.push(card);
    else if (new Date(scheduled.due_at).getTime() <= now)
      due.push({ card, dueAt: new Date(scheduled.due_at).getTime() });
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
