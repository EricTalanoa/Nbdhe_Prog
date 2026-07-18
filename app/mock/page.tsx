import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startSession } from "@/app/practice/actions";
import { MockExam, type MockItem } from "@/components/mock/mock-exam";
import { MOCK } from "@/lib/mock";
import { PageHeader } from "@/components/ui/page-header";
import type { PatientBoxData } from "@/components/cases/patient-box";
import type { PracticeOption, PracticeQuestion } from "@/components/practice/types";

type RawQuestion = {
  id: string;
  slug: string;
  format: PracticeQuestion["format"];
  stem: string;
  difficulty: string;
  case_id: string | null;
  options: PracticeOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
  taxonomy: { score_area: string } | { score_area: string }[] | null;
};

type RawCase = {
  id: string;
  title: string;
  patient_type: string | null;
  patient_box: PatientBoxData;
};

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scoreAreaOf(t: RawQuestion["taxonomy"]): string {
  if (!t) return "Uncategorized";
  const node = Array.isArray(t) ? t[0] : t;
  return node?.score_area ?? "Uncategorized";
}

function toPracticeQuestion(q: RawQuestion, flaggedIds: Set<string>): PracticeQuestion {
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
    // The mock exam simulates real test conditions, where a trick item is never flagged —
    // QuestionRenderer's badge never renders here regardless (MockExam doesn't pass
    // showTrickBadge), so there's no need to even look this up.
    is_trick: false,
  };
}

export default async function MockPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, slug, format, stem, difficulty, case_id, options(id, label, body, is_correct, distractor_rationale, sort_order), rationales(correct_explanation), taxonomy(score_area)"
    )
    .in("status", ["approved", "live"]);

  // Case patient boxes for Component B stimuli. Degrades to no cases if the table isn't there.
  const { data: caseData } = await supabase
    .from("cases")
    .select("id, title, patient_type, patient_box");
  const caseMap = new Map<string, RawCase>();
  for (const c of (caseData ?? []) as RawCase[]) caseMap.set(c.id, c);

  const { data: bookmarkRows } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("flagged", true);
  const flaggedIds = new Set((bookmarkRows ?? []).map((b) => b.question_id as string));

  const raw = (data ?? []) as unknown as RawQuestion[];

  // Component A: discipline items (no case). Component B: case-linked items, grouped by case.
  const disciplineItems: MockItem[] = shuffle(raw.filter((q) => !q.case_id)).map((q) => ({
    question: toPracticeQuestion(q, flaggedIds),
    scoreArea: scoreAreaOf(q.taxonomy),
  }));

  const caseRaw = raw
    .filter((q) => q.case_id)
    .sort((a, b) => {
      // Keep items of the same case together, in slug order.
      if (a.case_id !== b.case_id) return (a.case_id ?? "").localeCompare(b.case_id ?? "");
      return a.slug.localeCompare(b.slug);
    });
  const caseItems: MockItem[] = caseRaw.map((q) => {
    const c = q.case_id ? caseMap.get(q.case_id) : undefined;
    return {
      question: toPracticeQuestion(q, flaggedIds),
      scoreArea: scoreAreaOf(q.taxonomy),
      stimulus: c
        ? { title: c.title, patientType: c.patient_type, patientBox: c.patient_box }
        : undefined,
    };
  });

  const hasContent = disciplineItems.length > 0 || caseItems.length > 0;
  const sessionId =
    !error && hasContent
      ? await startSession(
          {
            kind: "mock",
            component_a: disciplineItems.length,
            component_b: caseItems.length,
            per_item_seconds: MOCK.perItemSeconds,
          },
          "mock"
        )
      : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader
        title="Mock exam"
        subtitle="Two timed components with a break — NBDHE format, scaled to the approved bank."
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load questions: {error.message}
        </div>
      )}

      {!error && (
        <MockExam
          sessionId={sessionId}
          sectionA={disciplineItems}
          sectionB={caseItems}
          perItemSeconds={MOCK.perItemSeconds}
        />
      )}
    </main>
  );
}
