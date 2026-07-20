-- Phase 8d: theme (light/dark/system) preference on profiles, persisted per account like
-- dashboard_mode and show_trick_badge, synced across devices via profiles' existing owner-only
-- RLS (no new policies needed).
--
-- Manual apply step (this repo can't run migrations from here; MCP writes + *.supabase.co
-- egress are blocked in web sessions): paste this into the Supabase SQL editor, same as prior
-- migrations. The UI degrades gracefully until then -- a missing column (or a failed select) is
-- treated as 'system', the same client-side default used before any account row exists.

alter table public.profiles
  add column theme text not null default 'system'
    check (theme in ('light', 'dark', 'system'));
