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
  isCorrect: boolean;
  timeMs?: number;
}): Promise<void> {
  if (!params.sessionId) return;
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) return;

  const { error } = await supabase.from("responses").insert({
    session_id: params.sessionId,
    user_id: userId,
    question_id: params.questionId,
    selected_option_id: params.selectedOptionId,
    is_correct: params.isCorrect,
    time_ms: params.timeMs ?? null,
  });
  if (error) {
    console.error("recordResponse: failed to persist response", error.message);
  }
}

export async function finishSession(sessionId: string | null, summary: ScoreSummary): Promise<void> {
  if (!sessionId) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ finished_at: new Date().toISOString(), score_summary: summary })
    .eq("id", sessionId);
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
