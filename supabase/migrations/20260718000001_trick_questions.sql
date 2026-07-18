-- "Trick" questions: items where the answer choices are deliberately close (or the stem hinges
-- on a single word) so the test-taker has to read carefully rather than pattern-match, mirroring
-- how the real exam tests precise reading. `is_trick` is content metadata (authored via the
-- `trick: true` frontmatter tag, see content-authoring-guidelines.md), independent of `format` —
-- a completion, question, or negative item can all be a trick item.
--
-- `show_trick_badge` on profiles is the per-account toggle (Settings) for whether the app marks
-- these items with a visual indicator while studying — off by default, since the whole point of a
-- trick question is that it isn't announced during the real exam. Synced across devices like
-- everything else in `profiles`.
--
-- Manual apply step (this repo can't run migrations from here; MCP writes + *.supabase.co egress
-- are blocked in web sessions): paste this into the Supabase SQL editor, same as prior migrations.
-- The UI degrades gracefully until then — a missing column (or a failed select) is treated as
-- `is_trick = false` / `show_trick_badge = false`.

alter table public.questions
  add column is_trick boolean not null default false;

alter table public.profiles
  add column show_trick_badge boolean not null default false;
