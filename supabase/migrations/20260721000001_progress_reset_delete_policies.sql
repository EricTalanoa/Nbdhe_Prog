-- Phase 8: 8e-progress-reset — a user can clear their own study progress (responses, sessions,
-- flags, spaced-repetition schedules) for a single exam topic. `bookmarks`/`review_schedule`/
-- `flashcard_schedule` already have owner-only delete policies, but `sessions` and `responses`
-- (20260712000001_sessions_responses.sql) never got one — only select/insert/update — so a
-- client-side delete on those two tables is silently denied (0 rows) by RLS today.
--
-- Manual apply step (this repo can't run migrations from here; MCP writes + *.supabase.co egress
-- are blocked in web sessions): paste this into the Supabase SQL editor, same as prior
-- migrations. Until applied, `resetTopicProgress` (app/topics/actions.ts) still clears
-- bookmarks/review_schedule/flashcard_schedule for the topic, but `sessions`/`responses` rows
-- for it are left in place (reported back to the user, not a silent partial success).

create policy "sessions: owner can delete"
  on public.sessions for delete
  using (auth.uid() = user_id);

create policy "responses: owner can delete"
  on public.responses for delete
  using (auth.uid() = user_id);
