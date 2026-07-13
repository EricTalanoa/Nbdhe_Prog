"use server";

import { createClient } from "@/lib/supabase/server";
import { schedule, type CardState, type Grade } from "@/lib/srs";

// All actions degrade gracefully (log + no-op) if the Phase 7a tables aren't applied yet, so
// /review keeps working before the migration lands — same pattern as the practice actions.

async function currentUserId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export type GradeResult = { ok: boolean; intervalDays: number };

export async function gradeReview(questionId: string, grade: Grade): Promise<GradeResult> {
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return { ok: false, intervalDays: 0 };

  // Read the current card state (if the row/table exists) to advance the schedule.
  const { data: existing } = await supabase
    .from("review_schedule")
    .select("ease, interval_days")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  const current: CardState = existing
    ? { ease: existing.ease as number, intervalDays: existing.interval_days as number }
    : { ease: 2.5, intervalDays: 0 };

  const next = schedule(current, grade);

  const { error } = await supabase.from("review_schedule").upsert(
    {
      user_id: userId,
      question_id: questionId,
      ease: next.ease,
      interval_days: next.intervalDays,
      due_at: next.dueAt.toISOString(),
      last_result: next.lastResult,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) {
    console.error("gradeReview: could not persist (migration not applied yet?)", error.message);
    return { ok: false, intervalDays: next.intervalDays };
  }
  return { ok: true, intervalDays: next.intervalDays };
}

const VALID_REASONS = new Set(["wrong_answer", "typo", "ambiguous", "other"]);

export async function reportQuestion(
  questionId: string,
  reason: string,
  note: string
): Promise<boolean> {
  if (!VALID_REASONS.has(reason)) return false;
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return false;

  const { error } = await supabase.from("question_reports").insert({
    user_id: userId,
    question_id: questionId,
    reason,
    note: note.trim() ? note.trim().slice(0, 1000) : null,
  });
  if (error) {
    console.error("reportQuestion: could not persist (migration not applied yet?)", error.message);
    return false;
  }
  return true;
}
