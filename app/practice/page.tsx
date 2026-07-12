import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startSession } from "@/app/practice/actions";
import { PracticeSession } from "@/components/practice/practice-session";
import type { PracticeOption, PracticeQuestion } from "@/components/practice/types";

const DEFAULT_SET_SIZE = 10;
const MAX_SET_SIZE = 50;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

type RawQuestion = {
  id: string;
  slug: string;
  format: PracticeQuestion["format"];
  stem: string;
  difficulty: string;
  options: PracticeOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
  taxonomy: { score_area: string } | { score_area: string }[] | null;
};

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function parseSetSize(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_SET_SIZE;
  return Math.min(n, MAX_SET_SIZE);
}

// A checkbox group submits one repeated key per checked box; a single box submits a scalar.
function parseList(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function parseDifficulty(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && (DIFFICULTIES as readonly string[]).includes(value) ? value : null;
}

function firstTaxonomy(t: RawQuestion["taxonomy"]): { score_area: string } | null {
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { n?: string; difficulty?: string; areas?: string | string[] };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const setSize = parseSetSize(searchParams.n);
  const areas = parseList(searchParams.areas);
  const difficulty = parseDifficulty(searchParams.difficulty);

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, slug, format, stem, difficulty, options(id, label, body, is_correct, distractor_rationale, sort_order), rationales(correct_explanation), taxonomy(score_area)"
    )
    .in("status", ["approved", "live"]);

  const { data: bookmarkRows } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("flagged", true);
  const flaggedIds = new Set((bookmarkRows ?? []).map((b) => b.question_id as string));

  const raw = (data ?? []) as unknown as RawQuestion[];
  const areaSet = new Set(areas);
  const pool: PracticeQuestion[] = raw
    .filter((q) => {
      if (difficulty && q.difficulty !== difficulty) return false;
      if (areaSet.size > 0) {
        const scoreArea = firstTaxonomy(q.taxonomy)?.score_area;
        if (!scoreArea || !areaSet.has(scoreArea)) return false;
      }
      return true;
    })
    .map((q) => {
      const rationale = Array.isArray(q.rationales) ? q.rationales[0] : q.rationales;
      return {
        id: q.id,
        slug: q.slug,
        format: q.format,
        stem: q.stem,
        difficulty: q.difficulty,
        options: [...q.options].sort((a, b) => a.sort_order - b.sort_order),
        correct_explanation: rationale?.correct_explanation ?? null,
        flagged: flaggedIds.has(q.id),
      };
    });

  const practiceSet = shuffle(pool).slice(0, setSize);
  const filtered = areas.length > 0 || difficulty !== null;
  const sessionId =
    !error && practiceSet.length > 0
      ? await startSession({
          requested: setSize,
          available: pool.length,
          areas: areas.length > 0 ? areas : "all",
          difficulty: difficulty ?? "any",
        })
      : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Study mode · {practiceSet.length} of {pool.length} matching question
            {pool.length === 1 ? "" : "s"}
            {filtered && (
              <>
                {" "}
                ·{" "}
                <Link href="/practice/build" className="underline underline-offset-4">
                  change filters
                </Link>
              </>
            )}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load questions: {error.message}
        </div>
      )}

      {!error && practiceSet.length === 0 && (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <p>No approved questions match these filters yet.</p>
          <Link href="/practice/build" className="mt-3 inline-block underline underline-offset-4">
            Adjust your filters
          </Link>
        </div>
      )}

      {!error && practiceSet.length > 0 && (
        <PracticeSession questions={practiceSet} sessionId={sessionId} />
      )}
    </main>
  );
}
