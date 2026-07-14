-- 7b batch 7: word-trap questions + per-user trick-question hint visibility.
--
-- questions.trap_note: non-null marks an item as a wording trap and holds the
--   learner-facing callout that names the pivotal word. NULL = ordinary item.
-- profiles.show_trap_hints: opt-in (default OFF) to reveal the trap badge
--   (pre-answer) and callout (post-answer) in study modes. Mocks ignore it.
--
-- Additive and idempotent; no RLS changes needed (questions is authenticated-read,
-- profiles already has an owner-only update policy).

alter table public.questions
  add column if not exists trap_note text;

alter table public.profiles
  add column if not exists show_trap_hints boolean not null default false;
