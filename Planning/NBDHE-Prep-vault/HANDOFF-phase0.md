# Claude Code — Phase 0 Handoff Prompt

Copy everything in the block below into Claude Code, run from inside the cloned repo with this
vault present (unzip the vault into the repo root as `/planning`, or keep it alongside and point
Claude Code at it). Then follow the manual steps it pauses for.

---

You're building an NBDHE prep app (web + installable PWA). The full plan lives in this Obsidian
vault — read these files first, in order, before writing anything:

1. `PROJECT_STATE.md` — orientation, stack, locked decisions, constraints.
2. `01-Planning/build-order.md` — the phase plan. We are doing **Phase 0 only** this session.
3. `05-Dev/schema.md` — the database schema (don't build all of it yet — only the Phase 0 tables).
4. `01-Planning/blueprint-mapping.md` — content taxonomy (reference for later phases).

## Your task: complete Phase 0 — Foundation
Deliver a deployed, signed-in-able empty shell. Specifically:

- Scaffold **Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui**.
- Set up **Supabase** client wiring (browser + server) using env vars — never hardcode keys.
- Implement **auth via magic link (Supabase email OTP)**. On first sign-in, insert a `profiles`
  row keyed to `auth.users.id`.
- Create the Phase 0 tables only: `profiles`, plus empty stubs for `taxonomy`, `questions`,
  `options`, `rationales` as SQL migrations (don't seed them yet). **Turn Row-Level Security ON**
  for all user-owned tables from the start, with the owner-only policies described in schema.md.
- A minimal **dashboard page** behind auth that shows "signed in as {email}" and nothing else.
- Provide a `.env.example` and a short `README` with run/deploy steps.

## Locked decisions (do NOT re-litigate or ask)
- Auth = magic link (no passwords).
- Readiness display later = per-area % + band (not a 49–99 scale). Irrelevant to Phase 0 but noted.
- Perio charts = static images later. Irrelevant to Phase 0.

## What I (the human) will do manually — pause and tell me clearly when you need these:
- Create/confirm the **Supabase project** and give you `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the service-role key for migrations.
- Configure the magic-link email/redirect URL in the Supabase dashboard.
- The GitHub remote already exists: `https://github.com/EricTalanoa/Nbdhe_Prog.git` — set it as
  origin and push; I'll handle any auth prompts.
- Connect the repo to **Vercel** for deploy (I'll click through; you prep the config).

## Working rules
- Follow the stack in PROJECT_STATE exactly; if you think something should change, propose it and
  update PROJECT_STATE's "Decisions" section rather than silently diverging.
- Small, reviewable commits. Conventional-ish messages.
- Don't build Phase 1+ features. When Phase 0's exit criteria are met (I can sign in on the
  deployed URL and see the empty dashboard), stop and summarize what's done + what I need to do.
- Update `PROJECT_STATE.md` (top 3 sections) and move the Phase 0 cards in `03-Kanban/board.md`
  to Done before you finish.

Start by reading the four files above, then give me a short plan for Phase 0 and the first thing
you need from me.
