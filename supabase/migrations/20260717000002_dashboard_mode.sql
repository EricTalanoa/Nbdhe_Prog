-- Phase 7c: dashboard_mode on profiles — lets a user pick between today's by-study-method
-- dashboard and a by-exam-topic dashboard (grid of the 13 blueprint score areas), synced
-- across devices like everything else in `profiles`. Owner-only RLS on `profiles` already
-- covers this column; no new policies needed.
--
-- Manual apply step (this repo can't run migrations from here; MCP writes + *.supabase.co
-- egress are blocked in web sessions): paste this into the Supabase SQL editor, same as prior
-- migrations. The UI degrades gracefully until then — /dashboard and /settings both treat a
-- missing column (or a failed select) as 'method', the current default.

alter table public.profiles
  add column dashboard_mode text not null default 'method'
    check (dashboard_mode in ('method', 'topic'));
