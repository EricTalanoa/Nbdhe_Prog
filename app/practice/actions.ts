"use server";

import { createClient } from "@/lib/supabase/server";

export type ScoreSummary = {
  total: number;
  correct: number;
  percent: number;
};

// All of these degrade gracefully (log + no-op) if sessions/responses/bookmarks haven't
// been applied to the live DB yet — the practice flow itself must keep working either way.

async function currentUserId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export type SessionKind =
  | "practice"
  | "timed"
  | "mock"
  | "review_missed"
  | "review_flagged"
  | "case";

export async function startSession(
  config: Record<string, unknown>,
  kind: SessionKind = "practice"
): Promise<string | null> {
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return null;

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, kind, config })
    .select("id")
    .single();

  if (error) {
    console.error("startSession: could not create session (migration not applied yet?)", error.message);
    return null;
  }
  return data.id as string;
}

export async function recordResponse(params: {
  sessionId: string | null;
  questionId: string;
  selectedOptionId: string | null;
  timeMs?: number;
}): Promise<void> {
  if (!params.sessionId) return;
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return;

  // The sessions FK only requires session_id to reference an existing row, not one this
  // user owns — confirm ownership before attaching a response to it.
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", params.sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!session) return;

  // Recompute correctness server-side from the option's real is_correct flag instead of
  // trusting a client-supplied value — options are already readable by any authenticated
  // user, so there's no secrecy to protect, but a client shouldn't be able to self-report a
  // wrong answer as right and inflate their own readiness/analytics numbers.
  let isCorrect = false;
  if (params.selectedOptionId) {
    const { data: option } = await supabase
      .from("options")
      .select("is_correct")
      .eq("id", params.selectedOptionId)
      .eq("question_id", params.questionId)
      .maybeSingle();
    isCorrect = option?.is_correct ?? false;
  }

  const { error } = await supabase.from("responses").insert({
    session_id: params.sessionId,
    user_id: userId,
    question_id: params.questionId,
    selected_option_id: params.selectedOptionId,
    is_correct: isCorrect,
    time_ms: params.timeMs ?? null,
  });
  if (error) {
    console.error("recordResponse: failed to persist response", error.message);
  }
}

export async function finishSession(sessionId: string | null, summary: ScoreSummary): Promise<void> {
  if (!sessionId) return;
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return;

  // Recompute the score summary from this session's own persisted responses rather than
  // trusting the client-supplied summary. Falls back to the client value only if the
  // responses table isn't queryable (e.g. migration not applied yet).
  const { data: responseRows, error: fetchErr } = await supabase
    .from("responses")
    .select("is_correct")
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  const total = !fetchErr && responseRows ? responseRows.length : summary.total;
  const correct = !fetchErr && responseRows ? responseRows.filter((r) => r.is_correct).length : summary.correct;
  const percent = total > 0 ? Math.round((correct / total) * 100) : summary.percent;

  const { error } = await supabase
    .from("sessions")
    .update({ finished_at: new Date().toISOString(), score_summary: { total, correct, percent } })
    .eq("id", sessionId)
    .eq("user_id", userId);
  if (error) {
    console.error("finishSession: failed to finalize session", error.message);
  }
}

export async function toggleBookmark(questionId: string, flagged: boolean): Promise<boolean> {
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return false;

  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id: userId, question_id: questionId, flagged },
      { onConflict: "user_id,question_id" }
    );
  if (error) {
    console.error("toggleBookmark: failed to persist bookmark", error.message);
    return false;
  }
  return true;
}
