# NBDHE Prep — Vault Map

This vault is the single source of truth for planning, content, and dev handoff.
Implementation happens in the code repo; **decisions and content live here.**

## Folder map
- `PROJECT_STATE.md` — living snapshot (read this first, keep it <60 lines).
- `00-Meta/` — this map + conventions.
- `01-Planning/` — the actual plan: blueprint mapping, features/MVP, build order,
  content-authoring rules, and per-feature specs in `feature-specs/`.
- `02-Content/` — question notes (one note per item) + `_templates/` for Templater.
  Later: one subfolder per discipline area.
- `03-Kanban/` — the task board (Obsidian Kanban plugin).
- `04-Dashboards/` — Dataview queries (live coverage + status views).
- `05-Dev/` — schema, API contracts, technical notes for Claude Code.

## Required community plugins
Kanban · Dataview · Templater.

## Conventions
- **IDs:** every question note has a stable `id` (e.g. `q-anat-0001`) in frontmatter.
- **Taxonomy tags** always use the exact `area` / `domain` / `subdomain` strings from
  `01-Planning/blueprint-mapping.md`. Don't invent new ones — add to the mapping first.
- **Status** on content notes: `draft` → `review` → `approved` → `live`.
- **Session ritual:** at the end of a work session, update PROJECT_STATE's top 3 sections
  and move Kanban cards. That keeps the handoff prompt accurate for the next session.

## Handoff to Claude Code / Cowork
- **First session:** use `HANDOFF-phase0.md` (root) — it's a ready-to-paste kickoff prompt.
- **Later sessions:** paste `PROJECT_STATE.md` + the relevant `05-Dev/` and `01-Planning/`
  file(s) for the task. Don't paste the whole vault — the state file exists so you don't have to.
- Keep this vault inside the repo (e.g. as `/planning`) so Claude Code reads it as project context.
