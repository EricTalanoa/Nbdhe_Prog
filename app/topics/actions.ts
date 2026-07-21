"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { topicSlug } from "@/lib/topics";

async function currentUserId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export type ResetProgressResult = {
  ok: boolean;
  clearedCount: number;
  // `sessions`/`responses` never got an owner-delete RLS policy until
  // 20260721000001_progress_reset_delete_policies.sql — until that's applied, deletes against
  // those two tables are silently denied (0 rows), so some of this topic's history can survive
  // a reset. Surfaced to the UI instead of reporting a false "all clear".
  migrationPending: boolean;
  error?: string;
};

// Clears one user's study history for a single exam topic (score_area): their responses and any
// sessions left with nothing else in them, question flags/notes, and both spaced-repetition
// schedules (question review + dedicated flashcards) for that area. Content tables
// (questions/taxonomy/flashcards themselves) are never touched — this only removes the calling
// user's own progress, and every delete is additionally scoped to `user_id = auth.uid()` even
// though RLS already enforces that server-side.
export async function resetTopicProgress(scoreArea: string): Promise<ResetProgressResult> {
  const supabase = createClient();
  const userId = await currentUserId(supabase);
  if (!userId) redirect("/login");

  const { data: taxRows, error: taxErr } = await supabase
    .from("taxonomy")
    .select("id")
    .eq("score_area", scoreArea);
  if (taxErr) return { ok: false, clearedCount: 0, migrationPending: false, error: taxErr.message };
  const taxonomyIds = (taxRows ?? []).map((t) => t.id as string);
  if (taxonomyIds.length === 0) return { ok: true, clearedCount: 0, migrationPending: false };

  const { data: qRows, error: qErr } = await supabase
    .from("questions")
    .select("id")
    .in("taxonomy_id", taxonomyIds);
  if (qErr) return { ok: false, clearedCount: 0, migrationPending: false, error: qErr.message };
  const questionIds = (qRows ?? []).map((q) => q.id as string);

  let clearedCount = 0;
  let migrationPending = false;

  let touchedSessionIds: string[] = [];
  if (questionIds.length > 0) {
    const { data: respRows } = await supabase
      .from("responses")
      .select("id, session_id")
      .eq("user_id", userId)
      .in("question_id", questionIds);
    const expected = respRows?.length ?? 0;
    touchedSessionIds = Array.from(
      new Set((respRows ?? []).map((r) => r.session_id as string).filter(Boolean))
    );

    const { data: deletedResponses, error: respDelErr } = await supabase
      .from("responses")
      .delete()
      .eq("user_id", userId)
      .in("question_id", questionIds)
      .select("id");
    if (respDelErr) return { ok: false, clearedCount, migrationPending, error: respDelErr.message };
    const removed = deletedResponses?.length ?? 0;
    clearedCount += removed;
    if (removed < expected) migrationPending = true;

    const { data: deletedBookmarks } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .in("question_id", questionIds)
      .select("question_id");
    clearedCount += deletedBookmarks?.length ?? 0;

    const { data: deletedSchedule } = await supabase
      .from("review_schedule")
      .delete()
      .eq("user_id", userId)
      .in("question_id", questionIds)
      .select("question_id");
    clearedCount += deletedSchedule?.length ?? 0;
  }

  const { data: fcRows } = await supabase.from("flashcards").select("id").in("taxonomy_id", taxonomyIds);
  const flashcardIds = (fcRows ?? []).map((f) => f.id as string);
  if (flashcardIds.length > 0) {
    const { data: deletedFlashcardSchedule } = await supabase
      .from("flashcard_schedule")
      .delete()
      .eq("user_id", userId)
      .in("flashcard_id", flashcardIds)
      .select("flashcard_id");
    clearedCount += deletedFlashcardSchedule?.length ?? 0;
  }

  // A session with no responses left anywhere (this topic or otherwise) is now empty clutter —
  // remove it. A session that mixed this topic with others (a multi-area builder set, a mock
  // exam) keeps its remaining responses and isn't touched.
  if (touchedSessionIds.length > 0) {
    const { data: stillHasResponses } = await supabase
      .from("responses")
      .select("session_id")
      .in("session_id", touchedSessionIds);
    const stillUsed = new Set((stillHasResponses ?? []).map((r) => r.session_id as string));
    const emptySessionIds = touchedSessionIds.filter((id) => !stillUsed.has(id));
    if (emptySessionIds.length > 0) {
      const { data: deletedSessions, error: sessDelErr } = await supabase
        .from("sessions")
        .delete()
        .eq("user_id", userId)
        .in("id", emptySessionIds)
        .select("id");
      if (sessDelErr) return { ok: false, clearedCount, migrationPending, error: sessDelErr.message };
      const removed = deletedSessions?.length ?? 0;
      clearedCount += removed;
      if (removed < emptySessionIds.length) migrationPending = true;
    }
  }

  revalidatePath("/analytics");
  revalidatePath("/dashboard");
  revalidatePath("/review");
  revalidatePath(`/topics/${topicSlug(scoreArea)}`);

  return { ok: true, clearedCount, migrationPending };
}
