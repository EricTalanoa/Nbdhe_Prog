# Word-Trap Questions + Trick-Question Hints Toggle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 16 original "word-trap" questions across every score area, plus an opt-in per-user setting that reveals which questions are traps (a badge before answering, a callout naming the pivotal word after).

**Architecture:** One DB migration adds `questions.trap_note` (presence = trap flag + callout text) and `profiles.show_trap_hints` (default off). The vault importer learns an optional `# Trap` note section. `/practice` reads the profile flag server-side and threads it through `PracticeSession` → `QuestionRenderer`, which shows the badge/callout only when the flag is on and the item has a `trap_note`. `/mock` renders `QuestionRenderer` without the flag, so mocks never reveal traps. A small `/settings` page toggles the flag.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind · Supabase (Postgres + RLS) · plain-Node vault importer.

**Testing note (read first):** This repo has **no unit-test runner**. Its established verification is `npm run content:check` (offline vault validation), `npx tsc --noEmit` (types), `npm run lint`, and dev-server runtime checks. This plan uses those instead of `pytest`/`jest`-style steps. Do **not** add a test framework — that's out of scope.

**Commit discipline:** commit after each task. Branch off `main` first (do not commit straight to `main`).

---

## File Structure

**New files:**
- `supabase/migrations/20260713000003_trap_questions.sql` — schema: `trap_note` + `show_trap_hints`.
- `app/settings/page.tsx` — settings page (server component, auth-gated).
- `app/settings/actions.ts` — `setTrapHints` server action.
- `components/settings/trap-hints-toggle.tsx` — client toggle calling the action.
- 16 × `Planning/NBDHE-Prep-vault/02-Content/q-*.md` — the trap questions.

**Modified files:**
- `scripts/import-questions.mjs` — parse + validate the `# Trap` section, write `trap_note`.
- `Planning/NBDHE-Prep-vault/02-Content/_templates/question.md` — document the optional section.
- `components/practice/types.ts` — add `trap_note` to `PracticeQuestion`.
- `components/practice/question-renderer.tsx` — badge + callout, gated on `showTrapHints`.
- `components/practice/practice-session.tsx` — thread `showTrapHints` prop.
- `app/practice/page.tsx` — select `trap_note`, read profile flag, pass it down.
- `app/dashboard/page.tsx` — add a Settings link in the header.

---

## Task 1: Migration — `trap_note` + `show_trap_hints`

**Files:**
- Create: `supabase/migrations/20260713000003_trap_questions.sql`

- [ ] **Step 1: Create the migration file**

```sql
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
```

- [ ] **Step 2: Sanity-check the SQL**

Run: `node -e "const s=require('fs').readFileSync('supabase/migrations/20260713000003_trap_questions.sql','utf8'); if(!/add column if not exists trap_note text/.test(s)||!/show_trap_hints boolean not null default false/.test(s)){process.exit(1)} console.log('migration OK')"`
Expected: prints `migration OK`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260713000003_trap_questions.sql
git commit -m "feat(db): trap_note on questions + show_trap_hints on profiles"
```

---

## Task 2: Importer — parse and validate the `# Trap` section

**Files:**
- Modify: `scripts/import-questions.mjs` (function `parseNote`, ~line 138–214)
- Modify: `Planning/NBDHE-Prep-vault/02-Content/_templates/question.md`

The importer already splits body into lowercased `# Heading` sections (`splitSections`) and strips HTML comments (`stripComments`). We add one optional section, `# Trap`.

- [ ] **Step 1: Parse the `# Trap` section in `parseNote`**

In `scripts/import-questions.mjs`, inside `parseNote`, find this block (~line 144–149):

```js
  const slug = data.id?.trim();
  const stem = stripComments(sections["stem"]);
  const options = parseOptions(sections["options"] || "");
  const correctAnswer = stripComments(sections["correct answer"]).toUpperCase();
  const { correct: correctExplanation, map: distractorMap } = parseDistractorRationales(
    sections["rationale"] || ""
  );
```

Add a `trapNote` line immediately after it:

```js
  // Optional `# Trap` section: non-empty marks a wording-trap item; text is the
  // learner-facing callout. Section absent → null (ordinary item).
  const hasTrapSection = "trap" in sections;
  const trapNote = hasTrapSection ? stripComments(sections["trap"]) : "";
```

- [ ] **Step 2: Validate a present-but-empty `# Trap` section**

In the same function, find the `body` validation block (~line 161–164):

```js
  // body
  if (!stem) errors.push("empty stem");
  if (options.length < 3 || options.length > 5)
    errors.push(`must have 3–5 options (found ${options.length})`);
```

Add after it:

```js
  if (hasTrapSection && !trapNote) errors.push("`# Trap` section is present but empty");
```

- [ ] **Step 3: Write `trap_note` onto the question record**

In the same function, find the returned `question:` object (~line 189–196):

```js
    question: {
      slug,
      format: data.format,
      stem,
      difficulty: data.difficulty,
      status: data.status,
      reference: data.reference || null,
    },
```

Change it to include `trap_note` (so `...note.question` in `upsertAll` writes the column):

```js
    question: {
      slug,
      format: data.format,
      stem,
      difficulty: data.difficulty,
      status: data.status,
      reference: data.reference || null,
      trap_note: trapNote || null,
    },
```

- [ ] **Step 4: Document the section in the note template**

In `Planning/NBDHE-Prep-vault/02-Content/_templates/question.md`, find the end of the Rationale block and the closing fence:

```markdown
**Why the distractors are wrong**
- A) 
- C) 
- D) 

---
<!-- Rule 0: original item, written to the blueprint from published references.
     Never a real/remembered NBDHE question. -->
```

Insert an optional `# Trap` section between the distractor list and the `---`:

```markdown
**Why the distractors are wrong**
- A) 
- C) 
- D) 

# Trap
<!-- OPTIONAL. Include only for wording-trap items. One or two sentences naming the
     pivotal word and what a near-miss reading would have picked. Shown to the learner
     (when they opt in) as a "wording trap" callout after they answer. Delete this whole
     section for ordinary items. -->

---
<!-- Rule 0: original item, written to the blueprint from published references.
     Never a real/remembered NBDHE question. -->
```

- [ ] **Step 5: Verify existing content still validates (no `# Trap` yet)**

Run: `npm run content:check`
Expected: ends with `70/70 note(s) valid.` (or the current count) and exit 0 — the new optional section must not break any existing note.

- [ ] **Step 6: Commit**

```bash
git add scripts/import-questions.mjs "Planning/NBDHE-Prep-vault/02-Content/_templates/question.md"
git commit -m "feat(content): importer parses optional # Trap section into trap_note"
```

---

## Task 3: Renderer type — add `trap_note` to `PracticeQuestion`

**Files:**
- Modify: `components/practice/types.ts`

- [ ] **Step 1: Add the field**

In `components/practice/types.ts`, find the `PracticeQuestion` type:

```ts
export type PracticeQuestion = {
  id: string;
  slug: string;
  format: QuestionFormat;
  stem: string;
  difficulty: string;
  options: PracticeOption[];
  correct_explanation: string | null;
  flagged: boolean;
};
```

Add `trap_note` before `flagged`:

```ts
export type PracticeQuestion = {
  id: string;
  slug: string;
  format: QuestionFormat;
  stem: string;
  difficulty: string;
  options: PracticeOption[];
  correct_explanation: string | null;
  trap_note: string | null;
  flagged: boolean;
};
```

- [ ] **Step 2: Typecheck (will fail until Task 5 supplies the field — that's expected)**

Run: `npx tsc --noEmit`
Expected: FAIL — `app/practice/page.tsx` errors that `trap_note` is missing in the mapped object. This confirms the type is now required; Task 5 fixes it. (Do not commit yet — commit at the end of Task 5 so the tree stays typecheck-clean per commit is not achievable mid-wiring; group Tasks 3–5 into one commit.)

---

## Task 4: `QuestionRenderer` — badge before, callout after

**Files:**
- Modify: `components/practice/question-renderer.tsx`

- [ ] **Step 1: Accept a `showTrapHints` prop**

In `components/practice/question-renderer.tsx`, find the component signature:

```tsx
export function QuestionRenderer({
  question,
  onAnswered,
}: {
  question: PracticeQuestion;
  onAnswered: (correct: boolean, selectedOptionId: string | null, timeMs: number) => void;
}) {
```

Change it to:

```tsx
export function QuestionRenderer({
  question,
  onAnswered,
  showTrapHints = false,
}: {
  question: PracticeQuestion;
  onAnswered: (correct: boolean, selectedOptionId: string | null, timeMs: number) => void;
  showTrapHints?: boolean;
}) {
```

- [ ] **Step 2: Derive whether to reveal the trap**

Immediately after the `const [startedAt] = useState(() => Date.now());` line (~line 53), add:

```tsx
  const revealTrap = showTrapHints && Boolean(question.trap_note);
```

- [ ] **Step 3: Show the "wording trap" badge before answering**

Find the metadata row (~line 76–80):

```tsx
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>{FORMAT_LABEL[question.format]}</span>
          <span aria-hidden="true">·</span>
          <span>{question.difficulty}</span>
        </div>
```

Add a badge at the end of that flex container:

```tsx
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>{FORMAT_LABEL[question.format]}</span>
          <span aria-hidden="true">·</span>
          <span>{question.difficulty}</span>
          {revealTrap && (
            <span className="rounded bg-amber-200 px-1.5 py-0.5 font-semibold text-amber-950 dark:bg-amber-900 dark:text-amber-200">
              Wording trap
            </span>
          )}
        </div>
```

- [ ] **Step 4: Show the trap callout after answering**

Find the post-submit outcome banner (~line 145–158):

```tsx
      ) : (
        <div
          className={cn(
            "mt-5 rounded-lg border px-4 py-3 text-sm font-medium",
            selectedIsCorrect
              ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-destructive bg-destructive/10 text-destructive"
          )}
        >
          {selectedIsCorrect
            ? "Correct."
            : `Incorrect — correct answer is ${correctOption?.label ?? "?"}.`}
        </div>
      )}
```

Insert the callout immediately BEFORE that outcome `<div>` (still inside the `) : (` branch — wrap both in a fragment):

```tsx
      ) : (
        <>
          {revealTrap && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="font-semibold">Wording trap — </span>
              {question.trap_note}
            </div>
          )}
          <div
            className={cn(
              "mt-5 rounded-lg border px-4 py-3 text-sm font-medium",
              selectedIsCorrect
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-destructive bg-destructive/10 text-destructive"
            )}
          >
            {selectedIsCorrect
              ? "Correct."
              : `Incorrect — correct answer is ${correctOption?.label ?? "?"}.`}
          </div>
        </>
      )}
```

(No commit yet — see Task 5.)

---

## Task 5: Wire the flag through the practice page and session

**Files:**
- Modify: `components/practice/practice-session.tsx`
- Modify: `app/practice/page.tsx`

- [ ] **Step 1: Thread `showTrapHints` through `PracticeSession`**

In `components/practice/practice-session.tsx`, find the props destructure + type (~line 18–29):

```tsx
export function PracticeSession({
  questions,
  sessionId,
  timeLimitSec,
  stimulus,
}: {
  questions: PracticeQuestion[];
  sessionId: string | null;
  timeLimitSec?: number;
  // Persistent case stimulus (patient box), shown above every item in a case session.
  stimulus?: ReactNode;
}) {
```

Change to:

```tsx
export function PracticeSession({
  questions,
  sessionId,
  timeLimitSec,
  stimulus,
  showTrapHints = false,
}: {
  questions: PracticeQuestion[];
  sessionId: string | null;
  timeLimitSec?: number;
  // Persistent case stimulus (patient box), shown above every item in a case session.
  stimulus?: ReactNode;
  showTrapHints?: boolean;
}) {
```

- [ ] **Step 2: Pass it to the renderer**

In the same file, find the `QuestionRenderer` usage (~line 152):

```tsx
      <QuestionRenderer key={question.id} question={question} onAnswered={handleAnswered} />
```

Change to:

```tsx
      <QuestionRenderer
        key={question.id}
        question={question}
        onAnswered={handleAnswered}
        showTrapHints={showTrapHints}
      />
```

- [ ] **Step 3: Select `trap_note` and add it to `RawQuestion`**

In `app/practice/page.tsx`, find the `RawQuestion` type (~line 17–27) and add `trap_note`:

```tsx
type RawQuestion = {
  id: string;
  slug: string;
  format: PracticeQuestion["format"];
  stem: string;
  difficulty: string;
  case_id: string | null;
  trap_note: string | null;
  options: PracticeOption[];
  rationales: { correct_explanation: string } | { correct_explanation: string }[] | null;
  taxonomy: TaxonomyRef | TaxonomyRef[] | null;
};
```

Then find the questions `.select(...)` (~line 157–162) and add `trap_note` to the column list:

```tsx
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, slug, format, stem, difficulty, case_id, trap_note, options(id, label, body, is_correct, distractor_rationale, sort_order), rationales(correct_explanation), taxonomy(score_area, subdomain)"
    )
    .in("status", ["approved", "live"]);
```

- [ ] **Step 4: Map `trap_note` into the pool**

In the `.map((q) => { ... })` that builds each `PracticeQuestion` (~line 199–211), add `trap_note`:

```tsx
      return {
        id: q.id,
        slug: q.slug,
        format: q.format,
        stem: q.stem,
        difficulty: q.difficulty,
        options: [...q.options].sort((a, b) => a.sort_order - b.sort_order),
        correct_explanation: rationale?.correct_explanation ?? null,
        trap_note: q.trap_note,
        flagged: flaggedIds.has(q.id),
      };
```

- [ ] **Step 5: Read the profile flag**

In `app/practice/page.tsx`, find the auth guard (~line 113–117):

```tsx
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
```

Add a profile read right after it:

```tsx
  const { data: profile } = await supabase
    .from("profiles")
    .select("show_trap_hints")
    .eq("id", user.id)
    .maybeSingle();
  const showTrapHints = Boolean(profile?.show_trap_hints);
```

- [ ] **Step 6: Pass the flag to `PracticeSession`**

Find the `<PracticeSession ... />` render (~line 308–326) and add the prop:

```tsx
        <PracticeSession
          questions={practiceSet}
          sessionId={sessionId}
          timeLimitSec={timeLimitSec > 0 ? timeLimitSec : undefined}
          showTrapHints={showTrapHints}
          stimulus={
            caseInfo ? (
              <div className="mb-6">
                <PatientBox
                  title={caseInfo.title}
                  patientType={caseInfo.patientType}
                  patientBox={caseInfo.patientBox}
                  media={caseInfo.media}
                />
              </div>
            ) : undefined
          }
        />
```

- [ ] **Step 7: Typecheck the whole feature wiring**

Run: `npx tsc --noEmit`
Expected: PASS (exit 0, no output). `trap_note` now flows type-safely from the query to the renderer; `/mock` calls `QuestionRenderer` without the prop, which defaults to `false`.

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: no new errors in the touched files.

- [ ] **Step 9: Commit Tasks 3–5 together**

```bash
git add components/practice/types.ts components/practice/question-renderer.tsx components/practice/practice-session.tsx app/practice/page.tsx
git commit -m "feat(practice): reveal wording-trap badge + callout when opted in"
```

---

## Task 6: `/settings` page + toggle + server action

**Files:**
- Create: `app/settings/actions.ts`
- Create: `components/settings/trap-hints-toggle.tsx`
- Create: `app/settings/page.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Server action to persist the flag**

Create `app/settings/actions.ts`:

```tsx
"use server";

import { createClient } from "@/lib/supabase/server";

// Persists the per-user "reveal trick questions" preference. Owner-only RLS on
// profiles scopes the update to the signed-in user. Returns false on any failure
// so the client can revert its optimistic state.
export async function setTrapHints(next: boolean): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ show_trap_hints: next })
    .eq("id", user.id);

  if (error) {
    console.error("setTrapHints: failed to persist preference", error.message);
    return false;
  }
  return true;
}
```

- [ ] **Step 2: Client toggle**

Create `components/settings/trap-hints-toggle.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { setTrapHints } from "@/app/settings/actions";
import { cn } from "@/lib/utils";

export function TrapHintsToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      const ok = await setTrapHints(next);
      if (!ok) setOn(!next); // revert on failure
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Reveal trick questions"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        on ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
```

- [ ] **Step 3: Settings page**

Create `app/settings/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { TrapHintsToggle } from "@/components/settings/trap-hints-toggle";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("show_trap_hints")
    .eq("id", user.id)
    .maybeSingle();
  const showTrapHints = Boolean(profile?.show_trap_hints);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Settings" backHref="/dashboard" backLabel="Dashboard" />

      <Card className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="font-medium">Reveal trick questions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Shows a “wording trap” badge on tricky questions and, after you answer, explains the
            word that decides the answer. Off means questions look exactly like the real exam.
            Mock exams never show these hints.
          </p>
        </div>
        <TrapHintsToggle initial={showTrapHints} />
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Link Settings from the dashboard header**

In `app/dashboard/page.tsx`, add `Settings` to the lucide import (~line 3–17). Find:

```tsx
  RotateCcw,
  SlidersHorizontal,
  Stethoscope,
  Zap,
  type LucideIcon,
} from "lucide-react";
```

Change to:

```tsx
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Zap,
  type LucideIcon,
} from "lucide-react";
```

Then find the sign-out form in the header (~line 96–101):

```tsx
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit" className="gap-1.5">
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </form>
```

Wrap it with a Settings link in a flex container:

```tsx
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/settings">
              <Settings className="size-3.5" />
              Settings
            </Link>
          </Button>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit" className="gap-1.5">
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </form>
        </div>
```

(`Link` is already imported at the top of `app/dashboard/page.tsx`.)

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, no new errors.

- [ ] **Step 6: Commit**

```bash
git add app/settings components/settings app/dashboard/page.tsx
git commit -m "feat(settings): /settings page with reveal-trick-questions toggle"
```

---

## Content Tasks (7–10): the 16 word-trap questions

**Authoring rules (apply to every note below):** Rule 0 — every item is ORIGINAL, written to the blueprint from standard references, never a real/remembered NBDHE item. Taxonomy strings are copied verbatim from the seed migration and MUST match exactly (em dashes included). `status: review` (they enter the normal review → approved → live workflow). Each note ends with the `# Trap` section. After each content task, run `npm run content:check` and expect it to still pass with the new items counted as valid, then commit.

Create each file under `Planning/NBDHE-Prep-vault/02-Content/`.

### Task 7: Scientific Basis traps (6 items)

- [ ] **Step 1: `q-anat-0004.md`**

```markdown
---
type: question
id: q-anat-0004
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Anatomic Sciences"
subdomain: "Anatomy — Head and neck anatomy"
reference: "Standard head & neck anatomy (trigeminal nerve; skull base foramina)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Through which opening in the skull base does the mandibular division of the trigeminal nerve leave the cranium?

# Options
- A) Foramen rotundum
- B) Foramen ovale (correct)
- C) Foramen spinosum
- D) Stylomastoid foramen

# Correct answer
B

# Rationale
The mandibular division (V3) of the trigeminal nerve exits the middle cranial fossa through the foramen ovale to enter the infratemporal fossa.

**Why the distractors are wrong**
- A) The foramen rotundum transmits the maxillary division (V2), not V3.
- C) The foramen spinosum transmits the middle meningeal artery.
- D) The stylomastoid foramen transmits the facial nerve (VII), a different cranial nerve.

# Trap
Rotundum vs. ovale are the two look-alike answers: rotundum carries V2 (maxillary), ovale carries V3 (mandibular). Read which division the stem names before picking.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 2: `q-phys-0003.md`**

```markdown
---
type: question
id: q-phys-0003
created: 2026-07-13
status: review
format: completion
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Physiology"
subdomain: ""
reference: "Standard oral physiology (salivary secretion; ductal ion reabsorption)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Compared with blood plasma, the saliva delivered into the mouth under resting conditions is normally:

# Options
- A) hypertonic
- B) hypotonic (correct)
- C) isotonic
- D) identical to plasma in sodium concentration

# Correct answer
B

# Rationale
Primary (acinar) saliva starts near isotonic, but as it passes through the striated ducts sodium and chloride are reabsorbed faster than water follows, so the final saliva reaching the mouth is hypotonic relative to plasma.

**Why the distractors are wrong**
- A) Hypertonic is the opposite of what ductal ion reabsorption produces.
- C) Only the initial acinar secretion is roughly isotonic; the final product is not.
- D) Ductal sodium reabsorption leaves final saliva with a lower sodium concentration than plasma.

# Trap
The hypo-/hyper-/iso- trio bait each other. The word that decides it is "delivered into the mouth" (final saliva) — ductal reabsorption makes that hypotonic, even though the first-formed acinar fluid is isotonic.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 3: `q-bioc-0003.md`**

```markdown
---
type: question
id: q-bioc-0003
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Biochemistry and Nutrition"
subdomain: "Nutrition"
reference: "Standard nutrition (vitamin C / collagen synthesis; scurvy)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Impaired collagen synthesis producing bleeding, spongy gingiva and delayed wound healing is most characteristic of a deficiency of which vitamin?

# Options
- A) Vitamin K
- B) Vitamin C (correct)
- C) Vitamin B12
- D) Vitamin A

# Correct answer
B

# Rationale
Vitamin C (ascorbic acid) is a cofactor for the hydroxylation of proline and lysine in collagen synthesis. Deficiency (scurvy) yields weak collagen, causing the classic bleeding, spongy gingiva and poor healing.

**Why the distractors are wrong**
- A) Vitamin K deficiency also causes bleeding, but through impaired clotting-factor synthesis, not defective collagen.
- C) Vitamin B12 deficiency causes megaloblastic anemia and glossitis, not a collagen defect.
- D) Vitamin A deficiency affects epithelial keratinization and vision, not collagen cross-linking.

# Trap
Vitamin K is the bait because it also causes bleeding. The phrase "collagen synthesis" is the tell — that points to vitamin C, not the clotting pathway.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 4: `q-immu-0002.md`**

```markdown
---
type: question
id: q-immu-0002
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Microbiology and Immunology"
subdomain: "Immunology"
reference: "Standard immunology (immunoglobulin classes; primary vs secondary response)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Which immunoglobulin class is the first to appear in the serum during a primary immune response?

# Options
- A) IgG
- B) IgM (correct)
- C) IgA
- D) IgE

# Correct answer
B

# Rationale
IgM is the first antibody produced in a primary response; its pentameric structure makes it an efficient early agglutinin and complement activator before class switching occurs.

**Why the distractors are wrong**
- A) IgG is the most abundant serum immunoglobulin and dominates the secondary response, but it appears after IgM.
- C) IgA predominates in secretions (saliva, mucosa), not as the first serum responder.
- D) IgE is associated with allergy and antiparasitic responses and is present in trace amounts.

# Trap
"First to appear" is not the same as "most abundant." IgM is first; IgG is the most abundant and the secondary-response workhorse. Match the qualifier the stem actually uses.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 5: `q-path-0003.md`**

```markdown
---
type: question
id: q-path-0003
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Pathology"
subdomain: "Oral pathology"
reference: "Standard oral pathology (premalignant lesions; malignant transformation risk)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Which oral mucosal lesion carries the greatest risk of malignant transformation?

# Options
- A) Leukoplakia
- B) Erythroplakia (correct)
- C) Reticular lichen planus
- D) Leukoedema

# Correct answer
B

# Rationale
Erythroplakia shows the highest rate of dysplasia or carcinoma on biopsy of the listed lesions, so it carries the greatest malignant potential and warrants biopsy.

**Why the distractors are wrong**
- A) Leukoplakia is far more common but has a lower transformation rate than erythroplakia.
- C) Reticular lichen planus has low malignant potential and is usually managed with observation.
- D) Leukoedema is a benign, reversible variation of normal with no malignant potential.

# Trap
Leukoplakia is the reflex answer because it is the one clinicians see most. The stem asks for "greatest risk," not "most common" — that flips the answer to erythroplakia.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 6: `q-phar-0002.md`**

```markdown
---
type: question
id: q-phar-0002
created: 2026-07-13
status: review
format: negative
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Pharmacology"
subdomain: "General pharmacology"
reference: "Standard pharmacology (analgesics; NSAID vs acetaminophen)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
All of the following are nonsteroidal anti-inflammatory drugs (NSAIDs) EXCEPT:

# Options
- A) Ibuprofen
- B) Naproxen
- C) Acetaminophen (correct)
- D) Aspirin

# Correct answer
C

# Rationale
Acetaminophen is an analgesic and antipyretic with only weak, clinically insignificant peripheral anti-inflammatory activity; it is not classed as an NSAID. The other three inhibit cyclooxygenase peripherally and reduce inflammation.

**Why the distractors are wrong**
- A) Ibuprofen is a prototypical NSAID.
- B) Naproxen is an NSAID with a longer half-life.
- D) Aspirin is an NSAID that irreversibly acetylates cyclooxygenase.

# Trap
Acetaminophen relieves pain and fever, so it is easy to lump with the NSAIDs — but it lacks meaningful anti-inflammatory action and is the EXCEPT answer.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 7: Validate + commit**

Run: `npm run content:check`
Expected: all notes valid, exit 0, count increased by 6.

```bash
git add "Planning/NBDHE-Prep-vault/02-Content/q-anat-0004.md" "Planning/NBDHE-Prep-vault/02-Content/q-phys-0003.md" "Planning/NBDHE-Prep-vault/02-Content/q-bioc-0003.md" "Planning/NBDHE-Prep-vault/02-Content/q-immu-0002.md" "Planning/NBDHE-Prep-vault/02-Content/q-path-0003.md" "Planning/NBDHE-Prep-vault/02-Content/q-phar-0002.md"
git commit -m "content: 6 Scientific Basis word-trap items (7b batch 7)"
```

### Task 8: Clinical Services traps, part 1 (4 items)

- [ ] **Step 1: `q-asmt-0006.md`**

```markdown
---
type: question
id: q-asmt-0006
created: 2026-07-13
status: review
format: completion
difficulty: medium
area: "Provision of Clinical Dental Hygiene Services"
domain: "Patient Assessment"
subdomain: "Periodontal evaluation"
reference: "Wilkins, Clinical Practice of the Dental Hygienist — periodontal assessment"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Clinical attachment level is measured from the base of the pocket to the:

# Options
- A) gingival margin
- B) mucogingival junction
- C) cementoenamel junction (correct)
- D) alveolar bone crest

# Correct answer
C

# Rationale
Clinical attachment level uses the cementoenamel junction (CEJ) as a fixed anatomic reference, so it reflects true attachment loss independent of gingival margin position.

**Why the distractors are wrong**
- A) Measuring to the gingival margin gives probing depth, not attachment level; the margin moves with swelling or recession.
- B) The mucogingival junction marks the limit of attached gingiva and is not the reference for attachment measurement.
- D) The alveolar bone crest is assessed radiographically, not by probing to it clinically.

# Trap
Probing depth and attachment level differ only in the reference point: the movable gingival margin versus the fixed CEJ. The stem's reference landmark is the whole question — read it before answering.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 2: `q-radi-0006.md`**

```markdown
---
type: question
id: q-radi-0006
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Provision of Clinical Dental Hygiene Services"
domain: "Dental Radiography"
subdomain: "Technique"
reference: "Standard dental radiography (vertical angulation errors)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Insufficient (too little) vertical angulation of the x-ray beam produces a periapical image in which the teeth appear:

# Options
- A) foreshortened
- B) elongated (correct)
- C) correctly proportioned
- D) uniformly magnified

# Correct answer
B

# Rationale
Too little vertical angulation makes the projected image longer than the actual tooth (elongation). Correct technique matches the angulation to the tooth's long axis.

**Why the distractors are wrong**
- A) Foreshortening results from excessive vertical angulation — the opposite error.
- C) Correct proportions require appropriate angulation, which the stem states is insufficient.
- D) Uniform magnification relates to object-to-film and source-to-object distances, not vertical angulation.

# Trap
Elongation and foreshortening are the paired answers; the direction is set by one word. "Insufficient" angulation → elongation; excessive → foreshortening.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 3: `q-plan-0010.md`**

```markdown
---
type: question
id: q-plan-0010
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Provision of Clinical Dental Hygiene Services"
domain: "Dental Hygiene Care Planning"
subdomain: "Recognition of emergency situations and provision of appropriate care"
reference: "Standard medical emergencies in dentistry (hypoglycemia management)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
A conscious patient with type 1 diabetes becomes shaky, sweating, and confused during an appointment. The most appropriate initial management is to:

# Options
- A) administer intramuscular glucagon
- B) give approximately 15 g of oral carbohydrate (correct)
- C) activate EMS and place the patient supine
- D) administer supplemental oxygen and wait

# Correct answer
B

# Rationale
The patient is conscious and can swallow, so the first step for suspected hypoglycemia is ~15 g of fast-acting oral carbohydrate (the "rule of 15"), then reassess.

**Why the distractors are wrong**
- A) Intramuscular glucagon is reserved for the unconscious or non-cooperative patient who cannot safely swallow.
- C) EMS activation may follow if the patient deteriorates, but it is not the initial step for a conscious, swallowing patient.
- D) Oxygen does not correct low blood glucose and delays the needed carbohydrate.

# Trap
Two words steer this: "conscious" and "initial." A conscious patient gets oral carbohydrate first; glucagon is the answer only when the patient is unconscious and can't swallow.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 4: `q-perio-0011.md`**

```markdown
---
type: question
id: q-perio-0011
created: 2026-07-13
status: review
format: completion
difficulty: medium
area: "Provision of Clinical Dental Hygiene Services"
domain: "Periodontal Disease Management"
subdomain: "Etiology and pathogenesis of periodontal diseases"
reference: "Standard periodontology (gingivitis vs periodontitis; attachment loss)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Compared with gingivitis, the tissue change that defines periodontitis is best described as:

# Options
- A) fully reversible inflammation confined to the gingiva
- B) reversible only after periodontal surgery
- C) irreversible loss of connective tissue attachment and alveolar bone (correct)
- D) limited to the gingival epithelium with no attachment change

# Correct answer
C

# Rationale
Periodontitis is defined by apical migration of the junctional epithelium with irreversible loss of connective tissue attachment and supporting bone — the feature that distinguishes it from gingivitis.

**Why the distractors are wrong**
- A) Full reversibility describes gingivitis, whose inflammation resolves with plaque control.
- B) Attachment loss is not reversed by surgery; therapy halts progression and may regenerate only limited sites.
- D) Involvement limited to gingival epithelium with no attachment loss is gingivitis, not periodontitis.

# Trap
"Reversible" answers bait the gingivitis reflex. Gingivitis is reversible; periodontitis is defined by irreversible attachment and bone loss.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 5: Validate + commit**

Run: `npm run content:check`
Expected: all valid, exit 0, count +4.

```bash
git add "Planning/NBDHE-Prep-vault/02-Content/q-asmt-0006.md" "Planning/NBDHE-Prep-vault/02-Content/q-radi-0006.md" "Planning/NBDHE-Prep-vault/02-Content/q-plan-0010.md" "Planning/NBDHE-Prep-vault/02-Content/q-perio-0011.md"
git commit -m "content: 4 Clinical Services word-trap items, part 1 (7b batch 7)"
```

### Task 9: Clinical Services traps, part 2 (3 items)

- [ ] **Step 1: `q-prev-0005.md`**

```markdown
---
type: question
id: q-prev-0005
created: 2026-07-13
status: review
format: completion
difficulty: hard
area: "Provision of Clinical Dental Hygiene Services"
domain: "Preventive Agents"
subdomain: "Fluorides — Toxicology"
reference: "Standard fluoride toxicology (probably toxic dose vs certainly lethal dose)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
The generally cited probably toxic dose (PTD) of fluoride — the level at or above which emergency intervention is warranted — is approximately:

# Options
- A) 0.5 mg F/kg
- B) 5 mg F/kg (correct)
- C) 32 mg F/kg
- D) 64 mg F/kg

# Correct answer
B

# Rationale
The probably toxic dose is about 5 mg F/kg; ingestion at or above this threshold calls for intervention (calcium orally, monitoring, referral).

**Why the distractors are wrong**
- A) 0.5 mg F/kg is well below the intervention threshold and reflects roughly the daily supplement range, not a toxic dose.
- C) ~32 mg F/kg approaches the certainly lethal dose range, not the PTD.
- D) ~64 mg F/kg represents the certainly lethal dose, not the probably toxic dose.

# Trap
The PTD (5 mg/kg, the action threshold) and the certainly lethal dose (~32–64 mg/kg) are easy to swap. The stem defines the number it wants — "warrants intervention" is the PTD, not the lethal dose.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 2: `q-supp-0005.md`**

```markdown
---
type: question
id: q-supp-0005
created: 2026-07-13
status: review
format: negative
difficulty: medium
area: "Provision of Clinical Dental Hygiene Services"
domain: "Supportive Treatment Services"
subdomain: "Polishing natural and restored teeth"
reference: "Wilkins, Clinical Practice of the Dental Hygienist — selective polishing / abrasives"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Selective coronal polishing with a coarse abrasive prophy paste is acceptable in all of the following situations EXCEPT on:

# Options
- A) intact enamel with heavy extrinsic tobacco stain
- B) an intact enamel surface before an esthetic procedure
- C) exposed root cementum or dentin (correct)
- D) an intact enamel surface with removable extrinsic stain

# Correct answer
C

# Rationale
Cementum and dentin are much softer than enamel and are abraded rapidly by coarse pastes, so a coarse abrasive should be avoided on exposed root surfaces; a fine agent (or none) is used instead.

**Why the distractors are wrong**
- A) Heavy extrinsic stain on intact enamel is a reasonable, selective indication for a coarser abrasive.
- B) Intact enamel tolerates polishing before an esthetic procedure when stain removal is needed.
- D) Removable extrinsic stain on intact enamel is a standard polishing indication.

# Trap
The three "acceptable" options are all intact enamel. The EXCEPT flips the answer to the vulnerable surface — exposed cementum/dentin, which coarse abrasives remove quickly.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 3: `q-prof-0005.md`**

```markdown
---
type: question
id: q-prof-0005
created: 2026-07-13
status: review
format: completion
difficulty: medium
area: "Provision of Clinical Dental Hygiene Services"
domain: "Professional Responsibility"
subdomain: "Ethical principles"
reference: "Standard dental ethics (autonomy, beneficence, nonmaleficence, justice)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
A competent adult, after being informed of the risks and benefits, declines recommended radiographs. Honoring this refusal primarily reflects the principle of:

# Options
- A) beneficence
- B) nonmaleficence
- C) autonomy (correct)
- D) justice

# Correct answer
C

# Rationale
Autonomy is the patient's right to make informed decisions about their own care, including refusing a recommended procedure after understanding the consequences.

**Why the distractors are wrong**
- A) Beneficence is acting for the patient's benefit; it can tempt the clinician to override a refusal, but that is not what "honoring the refusal" reflects.
- B) Nonmaleficence is the duty to avoid harm, not the basis for respecting a choice.
- D) Justice concerns fair distribution of care and resources, not an individual's refusal.

# Trap
Beneficence is the bait — refusing indicated care can feel "not in the patient's best interest." But respecting an informed refusal is autonomy, even when the clinician disagrees.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 4: Validate + commit**

Run: `npm run content:check`
Expected: all valid, exit 0, count +3.

```bash
git add "Planning/NBDHE-Prep-vault/02-Content/q-prev-0005.md" "Planning/NBDHE-Prep-vault/02-Content/q-supp-0005.md" "Planning/NBDHE-Prep-vault/02-Content/q-prof-0005.md"
git commit -m "content: 3 Clinical Services word-trap items, part 2 (7b batch 7)"
```

### Task 10: Research, Community Health & extra Local Anesthesia traps (3 items)

- [ ] **Step 1: `q-rsch-0004.md`**

```markdown
---
type: question
id: q-rsch-0004
created: 2026-07-13
status: review
format: completion
difficulty: medium
area: "Research Principles and Community Health"
domain: "Research Principles"
subdomain: "Understanding statistical concepts"
reference: "Standard epidemiology/biostatistics (sensitivity vs specificity)"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
A screening test's ability to correctly identify people who truly have the disease is called its:

# Options
- A) specificity
- B) sensitivity (correct)
- C) positive predictive value
- D) reliability

# Correct answer
B

# Rationale
Sensitivity is the proportion of people with the disease who test positive (the true-positive rate) — the ability to correctly identify those who have the condition.

**Why the distractors are wrong**
- A) Specificity is the ability to correctly identify people who do NOT have the disease (the true-negative rate).
- C) Positive predictive value is the probability that a positive test is truly positive, which depends on disease prevalence.
- D) Reliability is reproducibility of results, not the ability to detect disease.

# Trap
Sensitivity and specificity are the mirror-image pair. Sensitivity detects disease (true positives); specificity clears the healthy (true negatives). Swapping them is the classic error.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 2: `q-comm-0003.md`**

```markdown
---
type: question
id: q-comm-0003
created: 2026-07-13
status: review
format: completion
difficulty: medium
area: "Research Principles and Community Health"
domain: "Community Health"
subdomain: "Promoting health and preventing disease within groups"
reference: "U.S. PHS 2015 recommendation for community water fluoridation"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
The current U.S. Public Health Service recommended concentration for community water fluoridation is:

# Options
- A) 0.4 ppm
- B) 0.7 ppm (correct)
- C) 1.0 ppm
- D) 1.2 ppm

# Correct answer
B

# Rationale
Since the 2015 update, the U.S. Public Health Service recommends a single optimal concentration of 0.7 ppm (mg/L) for community water fluoridation, replacing the earlier temperature-based range.

**Why the distractors are wrong**
- A) 0.4 ppm is below the recommended optimal level.
- C) 1.0 ppm was within the older 0.7–1.2 ppm range but is no longer the recommendation.
- D) 1.2 ppm was the upper end of the former range and now exceeds the single recommended level.

# Trap
The outdated 0.7–1.2 ppm range makes 1.0 and 1.2 look right. Since 2015 the recommendation is a single value, 0.7 ppm — a currency trap, not just a number.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 3: `q-anes-0009.md`**

```markdown
---
type: question
id: q-anes-0009
created: 2026-07-13
status: review
format: question
difficulty: medium
area: "Scientific Basis for Dental Hygiene Practice"
domain: "Pharmacology"
subdomain: "Local Anesthesia"
reference: "Malamed, Handbook of Local Anesthesia — vasoconstrictors in cardiovascular disease"
rationale: "See below"
case: ""
testlet: ""
---

# Stem
Which statement best describes the use of an epinephrine-containing local anesthetic in a patient with well-controlled hypertension?

# Options
- A) It is absolutely contraindicated
- B) It may be used in limited doses with careful aspiration (correct)
- C) A vasoconstrictor must never be combined with the anesthetic
- D) No limit on the epinephrine dose is necessary

# Correct answer
B

# Rationale
For patients with well-controlled cardiovascular disease (including controlled hypertension), limited doses of epinephrine (commonly cited cardiac dose limits) with slow injection and aspiration are considered acceptable and improve anesthesia and hemostasis.

**Why the distractors are wrong**
- A) "Absolutely contraindicated" overstates the risk; only uncontrolled or unstable cardiovascular disease is a true contraindication.
- C) "Never" is incorrect — a vasoconstrictor is appropriate in limited amounts here.
- D) Dose limitation still applies; "no limit" is unsafe.

# Trap
"Absolutely contraindicated" and "never" are the absolutist baits. For well-controlled disease the correct answer is conditional — limited dose with aspiration — not an all-or-nothing rule.

---
<!-- Original item written to the blueprint from published references. Not a real NBDHE question. -->
```

- [ ] **Step 4: Final content validation + commit**

Run: `npm run content:check`
Expected: all valid, exit 0. Total question notes = previous count + 16.

```bash
git add "Planning/NBDHE-Prep-vault/02-Content/q-rsch-0004.md" "Planning/NBDHE-Prep-vault/02-Content/q-comm-0003.md" "Planning/NBDHE-Prep-vault/02-Content/q-anes-0009.md"
git commit -m "content: 3 Research/Community/LA word-trap items (7b batch 7)"
```

---

## Task 11: End-to-end runtime verification

The feature is previewable, so verify it in the browser before wrapping up. `trap_note` only reaches the DB after the migration + import run, so this task uses a temporary local stand-in to exercise the UI without touching live data.

- [ ] **Step 1: Start the dev server**

Use the preview tooling (`preview_start` with the project's dev config, or add one to `.claude/launch.json` running `npm run dev`). Do NOT use Bash to run the server.

- [ ] **Step 2: Confirm the settings toggle persists**

Sign in, open `/settings`, toggle "Reveal trick questions" on. Reload the page and confirm via `read_page` that the switch is still on (`aria-checked="true"`). Check `read_console_messages` for errors and `preview_logs` for a `setTrapHints` failure line — expect none.

- [ ] **Step 3: Confirm the badge/callout gate on the flag**

Because live data has no `trap_note` yet, temporarily hard-code one to prove the UI path. In `app/practice/page.tsx`, in the `.map`, change `trap_note: q.trap_note,` to `trap_note: q.trap_note ?? "TEMP: pivotal word test",` and save. With the toggle ON, open `/practice` and confirm (via `read_page` / screenshot): an amber "Wording trap" badge shows before answering, and after submitting, an amber callout containing the trap text appears above the correct/incorrect banner. Toggle OFF at `/settings`, reload `/practice`, and confirm neither element renders.

- [ ] **Step 4: Confirm mocks never reveal traps**

With the toggle still ON and the temporary `trap_note` still in place, open `/mock`, start Component A, and confirm no "Wording trap" badge or callout appears on any item (mock renders `QuestionRenderer` without the prop).

- [ ] **Step 5: Revert the temporary stand-in**

Undo the Step 3 edit so the line reads `trap_note: q.trap_note,` again. Run `npx tsc --noEmit` (expect PASS) and confirm `git diff app/practice/page.tsx` shows no leftover `TEMP` text.

- [ ] **Step 6: Capture proof**

Take a screenshot of `/practice` with the toggle on and a trap item answered (badge + callout visible) to include in the PR.

---

## Task 12: Rollout notes (record for the human operator — do not run against live from here)

Claude web sessions can't reach `*.supabase.co`, so the live apply/seed is a manual step. Record these exact instructions in the PR description:

- [ ] **Step 1: Write the rollout checklist into the PR body**

```
Live apply/seed (run from a machine with Supabase access, or via the SQL editor):
1. Apply migration 20260713000003_trap_questions.sql (adds questions.trap_note,
   profiles.show_trap_hints).
2. Run `npm run content:import` with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
   set, to upsert the 16 new q-*.md items (writes trap_note).
3. Note: batch 6 (q-plan-0007..0009, q-perio-0008..0010) and the flashcards migration
   were already pending live seed per PROJECT_STATE — seed them in the same pass.
4. Promote the 16 items review → approved once accuracy/Rule 0 second-look is done, so
   they enter the practice pool.
```

- [ ] **Step 2: Update PROJECT_STATE.md**

Edit `Planning/NBDHE-Prep-vault/PROJECT_STATE.md`: bump the vault question count (+16), note batch 7 (word-trap items + trick-question toggle feature) under the current phase, and add the migration `20260713000003_trap_questions.sql` to the pending-live-apply list. Commit:

```bash
git add "Planning/NBDHE-Prep-vault/PROJECT_STATE.md"
git commit -m "docs: PROJECT_STATE — 7b batch 7 (word-trap items + hints toggle)"
```

- [ ] **Step 3: Open the PR**

Push the branch and open a PR summarizing: the toggle feature, the 16 trap items, and the rollout checklist from Step 1. Follow `superpowers:finishing-a-development-branch`.

---

## Self-Review (completed by plan author)

- **Spec coverage:** §1 schema → Task 1. §2 importer/template → Task 2. §3 settings page/action → Task 6. §4 renderer badge+callout, mock exclusion, type threading → Tasks 3–5. §5 16 items across all areas → Tasks 7–10 (6+4+3+3=16). §6 rollout → Task 12 + Task 11 verification. All covered.
- **Placeholder scan:** no TBD/TODO; the only literal "TEMP" is an intentional, explicitly-reverted verification stand-in (Task 11 Steps 3 & 5). Every code step shows full code; every content note is fully authored.
- **Type consistency:** `trap_note: string | null` is identical in `PracticeQuestion` (Task 3), `RawQuestion` (Task 5 Step 3), the query select (Task 5 Step 3), and the `.map` (Task 5 Step 4). `showTrapHints?: boolean` is identical across `QuestionRenderer` (Task 4), `PracticeSession` (Task 5), and the page (Task 5). Importer writes `trap_note` inside `note.question`, which `upsertAll` already spreads. Taxonomy triplets match the seed migration verbatim.
```
