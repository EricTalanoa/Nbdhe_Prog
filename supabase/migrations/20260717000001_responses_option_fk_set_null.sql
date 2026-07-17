-- Fix: re-importing a question wholesale-replaces its options (delete + insert), which fails
-- with a FK violation once any response references one of the old option ids — the
-- responses_selected_option_id_fkey had no ON DELETE action (defaults to RESTRICT/NO ACTION).
-- responses.is_correct is captured independently at answer time, so selected_option_id is only
-- a "which option did they click" detail for review UI, not the source of truth for scoring —
-- safe to null it out rather than block the option delete.

alter table public.responses
  drop constraint responses_selected_option_id_fkey,
  add constraint responses_selected_option_id_fkey
    foreign key (selected_option_id) references public.options (id) on delete set null;
