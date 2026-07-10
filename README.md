# NBDHE Prep

Web + installable-PWA prep app for the NBDHE (2026 "After Update" specs). Practice questions,
timed mocks, cases, and per-area analytics. Planning docs live in
[Planning/NBDHE-Prep-vault](Planning/NBDHE-Prep-vault/PROJECT_STATE.md).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase (Postgres +
Auth) · Vercel.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key
   (Supabase dashboard → Project Settings → API).
3. `npm run dev` → http://localhost:3000

Sign-in is magic link only: enter an email on `/login`, click the link in the email, land on
`/dashboard`.

## Database migrations

SQL migrations live in `supabase/migrations/`, ordered by filename. Apply them either way:

- **SQL editor (simplest):** paste each file, in order, into the Supabase dashboard → SQL Editor
  and run it.
- **Supabase CLI:** `npx supabase login`, `npx supabase link --project-ref <ref>`, then
  `npx supabase db push` (uses the service-role connection; never put the service-role key in
  `.env.local`).

Migration 1 creates `profiles` (owner-only RLS) and a trigger that inserts a profile row when a
user first signs in. Migration 2 creates empty content stubs (`taxonomy`, `questions`, `options`,
`rationales`) with RLS on — authenticated read, no client writes. Migration 3 seeds `taxonomy` from
the blueprint (idempotent; safe to re-run).

## Seeding questions (content pipeline)

Question content is authored as Markdown notes in
`Planning/NBDHE-Prep-vault/02-Content/q-*.md` and imported into the database.

1. `npm run content:check` — parse and validate every note (formats, one correct answer, 3–5
   options, per-distractor rationales) and confirm each note's `area`/`domain`/`subdomain` tag
   resolves against the seeded taxonomy. No database or credentials needed; run it before importing.
2. Apply the migrations (above), including the taxonomy seed.
3. Import into Supabase — needs the service-role key, which bypasses RLS. Do **not** put it in
   `.env.local`; pass it just for the command:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
   npm run content:import
   ```

   The import upserts by `slug`, so re-running it updates existing questions in place. Seeded
   questions are then visible (signed in) at `/questions`.

## Supabase auth config (one-time, dashboard)

Authentication → URL Configuration:

- **Site URL:** your production URL (e.g. `https://<app>.vercel.app`)
- **Redirect URLs:** add `http://localhost:3000/auth/confirm` and
  `https://<app>.vercel.app/auth/confirm`

Recommended (more reliable across devices): Authentication → Email Templates → Magic Link — set
the link to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

The `/auth/confirm` route handles both this token-hash style and the default confirmation-URL
style.

## Deploy (Vercel)

1. Import the GitHub repo in Vercel (framework auto-detects Next.js; no special build settings).
2. Set env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for all
   environments.
3. Deploy, then add the production `/auth/confirm` URL to Supabase redirect URLs (above).
