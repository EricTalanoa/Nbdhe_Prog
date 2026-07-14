import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startSession, type SessionKind } from "@/app/practice/actions";
import { PracticeSession } from "@/components/practice/practice-session";
import { PatientBox, type CaseMediaItem, type PatientBoxData } from "@/components/cases/patient-box";
import { PageHeader } from "@/components/ui/page-header";
import type { PracticeOption, PracticeQuestion } from "@/components/practice/types";

const DEFAULT_SET_SIZE = 10;
const MAX_SET_SIZE = 50;
const MAX_TIME_LIMIT_SEC = 3 * 60 * 60; // sanity cap: 3 hours
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const MODES = ["missed", "flagged"] as const;
type Mode = (typeof MODES)[number];

type RawQuestion = {
  id: string;
  slug: string;
  format: PracticeQuestion["format"];
  stem: string;
  difficulty: string;
  case_id: string | null;
  trap_note: string | null;
  options: PracticeOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
  taxonomy: TaxonomyRef | TaxonomyRef[] | null;
};

type TaxonomyRef = { score_area: string; subdomain: string | null };

type CaseInfo = {
  title: string;
  patientType: string | null;
  patientBox: PatientBoxData;
  media: CaseMediaItem[];
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

function parseMode(raw: string | string[] | undefined): Mode | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && (MODES as readonly string[]).includes(value) ? (value as Mode) : null;
}

function parseCaseSlug(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseTimeLimit(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, MAX_TIME_LIMIT_SEC);
}

function firstTaxonomy(t: RawQuestion["taxonomy"]): TaxonomyRef | null {
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
}

const MODE_COPY: Record<Mode, { title: string; empty: string }> = {
  missed: {
    title: "Review missed",
    empty: "You have no missed questions yet — answer some in practice first.",
  },
  flagged: {
    title: "Review flagged",
    empty: "You have not flagged any questions yet — tap the flag on a question while practicing.",
  },
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: {
    n?: string;
    difficulty?: string;
    areas?: string | string[];
    sub?: string | string[];
    mode?: string;
    t?: string;
    case?: string;
  };
}) {
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

  const setSize = parseSetSize(searchParams.n);
  const areas = parseList(searchParams.areas);
  const subs = parseList(searchParams.sub);
  const difficulty = parseDifficulty(searchParams.difficulty);
  const mode = parseMode(searchParams.mode);
  const timeLimitSec = parseTimeLimit(searchParams.t);
  const caseSlug = parseCaseSlug(searchParams.case);

  let caseInfo: CaseInfo | null = null;
  let caseError: string | null = null;
  let caseId: string | null = null;

  if (caseSlug) {
    const { data: caseRow, error: caseErr } = await supabase
      .from("cases")
      .select("id, title, patient_type, patient_box")
      .eq("slug", caseSlug)
      .maybeSingle();
    if (caseErr) {
      caseError = caseErr.message;
    } else if (!caseRow) {
      notFound();
    } else {
      caseId = caseRow.id as string;
      const { data: mediaRows } = await supabase
        .from("case_media")
        .select("id, kind, storage_path, caption")
        .eq("case_id", caseId)
        .order("sort_order", { ascending: true });
      caseInfo = {
        title: caseRow.title as string,
        patientType: caseRow.patient_type as string | null,
        patientBox: caseRow.patient_box as PatientBoxData,
        media: (mediaRows ?? []) as CaseMediaItem[],
      };
    }
  }

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, slug, format, stem, difficulty, case_id, trap_note, options(id, label, body, is_correct, distractor_rationale, sort_order), rationales(correct_explanation), taxonomy(score_area, subdomain)"
    )
    .in("status", ["approved", "live"]);

  // Owner-only RLS scopes these to the signed-in user automatically.
  const { data: bookmarkRows } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("flagged", true);
  const flaggedIds = new Set((bookmarkRows ?? []).map((b) => b.question_id as string));

  // Queue modes restrict the pool to a set of question ids (missed → wrong responses,
  // flagged → flagged bookmarks). Both degrade to an empty pool if the tables aren't there.
  let queueIds: Set<string> | null = null;
  if (mode === "flagged") {
    queueIds = flaggedIds;
  } else if (mode === "missed") {
    const { data: missedRows } = await supabase
      .from("responses")
      .select("question_id")
      .eq("is_correct", false);
    queueIds = new Set((missedRows ?? []).map((r) => r.question_id as string));
  }

  const raw = (data ?? []) as unknown as RawQuestion[];
  const areaSet = new Set(areas);
  const subSet = new Set(subs);
  const pool: PracticeQuestion[] = raw
    .filter((q) => {
      // Case mode: only this case's linked items, ignoring the builder's other filters.
      if (caseId) return q.case_id === caseId;
      if (queueIds) return queueIds.has(q.id);
      // Filtered practice (no queue): apply the builder's / question-set filters.
      if (difficulty && q.difficulty !== difficulty) return false;
      const tax = firstTaxonomy(q.taxonomy);
      if (areaSet.size > 0 && (!tax?.score_area || !areaSet.has(tax.score_area))) return false;
      if (subSet.size > 0 && (!tax?.subdomain || !subSet.has(tax.subdomain))) return false;
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
        trap_note: q.trap_note,
        flagged: flaggedIds.has(q.id),
      };
    });

  // Case items play in a fixed (slug) order, all of them — no shuffle, no set-size cap.
  const practiceSet = caseId
    ? [...pool].sort((a, b) => a.slug.localeCompare(b.slug))
    : shuffle(pool).slice(0, setSize);

  const kind: SessionKind = caseId
    ? "case"
    : mode
      ? mode === "missed"
        ? "review_missed"
        : "review_flagged"
      : timeLimitSec > 0
        ? "timed"
        : "practice";

  const sessionId =
    !error && !caseError && practiceSet.length > 0
      ? await startSession(
          caseId
            ? { case_slug: caseSlug }
            : {
                requested: setSize,
                available: pool.length,
                areas: areas.length > 0 ? areas : "all",
                subdomains: subs.length > 0 ? subs : "all",
                difficulty: difficulty ?? "any",
                mode: mode ?? "practice",
                time_limit_sec: timeLimitSec || null,
              },
          kind
        )
      : null;

  const heading = caseInfo
    ? caseInfo.title
    : mode
      ? MODE_COPY[mode].title
      : timeLimitSec > 0
        ? "Timed test"
        : "Practice";
  const filtered = areas.length > 0 || subs.length > 0 || difficulty !== null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader
        title={heading}
        backHref={caseInfo ? "/cases" : "/dashboard"}
        backLabel={caseInfo ? "Cases" : "Dashboard"}
        subtitle={
          caseInfo ? (
            <>
              Case mode · {practiceSet.length} linked item{practiceSet.length === 1 ? "" : "s"}
            </>
          ) : (
            <>
              {mode ? "Review mode" : "Study mode"} · {practiceSet.length} of {pool.length}{" "}
              {mode ? "queued" : "matching"} question{pool.length === 1 ? "" : "s"}
              {timeLimitSec > 0 && <> · {Math.round(timeLimitSec / 60)} min</>}
              {!mode && filtered && (
                <>
                  {" "}·{" "}
                  <Link href="/practice/build" className="underline underline-offset-4">
                    change filters
                  </Link>
                </>
              )}
            </>
          )
        }
      />

      {(error || caseError) && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load {caseError ? "case" : "questions"}: {caseError ?? error?.message}
        </div>
      )}

      {!error && !caseError && practiceSet.length === 0 && (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <p>
            {caseInfo
              ? "This case has no approved items yet."
              : mode
                ? MODE_COPY[mode].empty
                : "No approved questions match these filters yet."}
          </p>
          <Link
            href={caseInfo ? "/cases" : mode ? "/practice" : "/practice/build"}
            className="mt-3 inline-block underline underline-offset-4"
          >
            {caseInfo ? "Back to cases" : mode ? "Start a practice set" : "Adjust your filters"}
          </Link>
        </div>
      )}

      {!error && !caseError && practiceSet.length > 0 && (
        <PracticeSession
          questions={practiceSet}
          sessionId={sessionId}
          timeLimitSec={timeLimitSec > 0 ? timeLimitSec : undefined}
          showTrapHints={showTrapHints}
          stimulus={
            caseInfo ? (
              <div className="mb-6">
                <PatientBox
                  title={caseInfo.title}
                  patientType={caseInfo.patientType}
                  patientBox={caseInfo.patientBox}
                  media={caseInfo.media}
                />
              </div>
            ) : undefined
          }
        />
      )}
    </main>
  );
}
