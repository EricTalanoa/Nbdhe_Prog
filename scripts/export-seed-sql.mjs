#!/usr/bin/env node
// Emits idempotent hand-seed SQL for the *entire* current vault content set (cases,
// questions/options/rationales, flashcards), for pasting into the Supabase SQL editor
// from an environment where `npm run content:import` can't reach *.supabase.co (e.g. a
// Claude web/remote session — see PROJECT_STATE.md "Next 3 actions").
//
// Every statement is an upsert (ON CONFLICT ... DO UPDATE) keyed on slug, and options are
// deleted + reinserted per question — the same semantics scripts/import-questions.mjs uses
// against the live DB via the service role. Re-running this file's output is always safe:
// unchanged rows are updated to the same values, new rows are inserted, nothing is deleted
// except a question's own option rows (immediately replaced in the same statement).
//
// Usage:
//   node scripts/export-seed-sql.mjs > supabase/seed/manual-seed.sql
//   npm run content:seed-sql > supabase/seed/manual-seed.sql
//
// Then paste the file into the Supabase project's SQL editor and run it. Requires the
// `20260710000003_seed_taxonomy.sql` migration (and cases_testlets.sql / flashcards.sql for
// their tables) to already be applied — this script only ever reads taxonomy/case ids via
// subqueries, it never creates tables.

import {
  CONTENT_DIR,
  SPEC_VERSION,
  loadContentFiles,
  loadNotes,
  loadCaseNotes,
  loadFlashcardNotes,
} from "./import-questions.mjs";

// Dollar-quote a text value so we never have to hand-escape apostrophes in authored prose.
// Guards against the one input that would break dollar-quoting: the literal `$$` sequence.
function dq(text) {
  const s = text ?? "";
  if (s.includes("$$")) {
    throw new Error(`content contains a literal "$$", can't safely dollar-quote: ${s.slice(0, 60)}…`);
  }
  return `$$${s}$$`;
}

function dqOrNull(text) {
  return text == null || text === "" ? "NULL" : dq(text);
}

function taxonomySubquery(area, domain, subdomain) {
  return (
    `(select id from public.taxonomy where spec_version = ${dq(SPEC_VERSION)}` +
    ` and area = ${dq(area)}` +
    ` and coalesce(domain, '') = ${dq(domain || "")}` +
    ` and coalesce(subdomain, '') = ${dq(subdomain || "")})`
  );
}

function emitCase(c) {
  const json = JSON.stringify(c.case.patient_box);
  return `insert into public.cases (slug, title, patient_box, patient_type, notes, updated_at)
values (${dq(c.slug)}, ${dq(c.case.title)}, ${dq(json)}::jsonb, ${dqOrNull(c.case.patient_type)}, ${dqOrNull(c.case.notes)}, now())
on conflict (slug) do update set
  title = excluded.title,
  patient_box = excluded.patient_box,
  patient_type = excluded.patient_type,
  notes = excluded.notes,
  updated_at = excluded.updated_at;`;
}

function emitQuestion(note) {
  const taxonomySql = taxonomySubquery(note.taxonomy.area, note.taxonomy.domain, note.taxonomy.subdomain);
  const caseIdSql = note.caseSlug ? `(select id from public.cases where slug = ${dq(note.caseSlug)})` : "NULL";
  const optionRows = note.options
    .map(
      (o) =>
        `    (qid, ${dq(o.label)}, ${dq(o.body)}, ${o.is_correct}, ${dqOrNull(o.distractor_rationale)}, ${o.sort_order})`
    )
    .join(",\n");

  return `do $do$
declare qid uuid;
begin
  insert into public.questions (slug, taxonomy_id, format, stem, difficulty, status, case_id, reference, updated_at)
  values (
    ${dq(note.question.slug)},
    ${taxonomySql},
    ${dq(note.question.format)},
    ${dq(note.question.stem)},
    ${dq(note.question.difficulty)},
    ${dq(note.question.status)},
    ${caseIdSql},
    ${dqOrNull(note.question.reference)},
    now()
  )
  on conflict (slug) do update set
    taxonomy_id = excluded.taxonomy_id,
    format = excluded.format,
    stem = excluded.stem,
    difficulty = excluded.difficulty,
    status = excluded.status,
    case_id = excluded.case_id,
    reference = excluded.reference,
    updated_at = excluded.updated_at
  returning id into qid;

  delete from public.options where question_id = qid;
  insert into public.options (question_id, label, body, is_correct, distractor_rationale, sort_order) values
${optionRows};

  insert into public.rationales (question_id, correct_explanation)
  values (qid, ${dq(note.correctExplanation)})
  on conflict (question_id) do update set correct_explanation = excluded.correct_explanation;
end
$do$;`;
}

function emitFlashcard(fc) {
  const taxonomySql = taxonomySubquery(fc.taxonomy.area, fc.taxonomy.domain, fc.taxonomy.subdomain);
  return `insert into public.flashcards (slug, taxonomy_id, front, back, status, reference, updated_at)
values (${dq(fc.slug)}, ${taxonomySql}, ${dq(fc.flashcard.front)}, ${dq(fc.flashcard.back)}, ${dq(fc.flashcard.status)}, ${dqOrNull(fc.flashcard.reference)}, now())
on conflict (slug) do update set
  taxonomy_id = excluded.taxonomy_id,
  front = excluded.front,
  back = excluded.back,
  status = excluded.status,
  reference = excluded.reference,
  updated_at = excluded.updated_at;`;
}

async function main() {
  const files = await loadContentFiles();
  const notes = await loadNotes(files);
  const caseNotes = await loadCaseNotes(files);
  const flashcardNotes = await loadFlashcardNotes(files);

  const invalid = [...notes, ...caseNotes, ...flashcardNotes].filter((n) => n.errors.length > 0);
  if (invalid.length > 0) {
    console.error(`${invalid.length} note(s) failed validation — run "npm run content:check" first. Nothing emitted.`);
    for (const n of invalid) {
      console.error(`✗ ${n.filename}`);
      for (const e of n.errors) console.error(`    - ${e}`);
    }
    process.exit(1);
  }

  const out = [];
  out.push(`-- Auto-generated by scripts/export-seed-sql.mjs from ${CONTENT_DIR}.`);
  out.push(`-- DO NOT hand-edit — regenerate instead. Idempotent: safe to paste and run any`);
  out.push(`-- number of times against the live project's SQL editor.`);
  out.push(`-- Covers: ${caseNotes.length} case(s), ${notes.length} question(s), ${flashcardNotes.length} flashcard(s).`);
  out.push("");
  out.push("begin;");
  out.push("");

  if (caseNotes.length > 0) {
    out.push("-- Cases (must exist before questions can reference them via case_id) ----------");
    for (const c of caseNotes) {
      out.push(emitCase(c));
      out.push("");
    }
  }

  out.push("-- Questions + options + rationales ---------------------------------------------");
  for (const note of notes) {
    out.push(emitQuestion(note));
    out.push("");
  }

  if (flashcardNotes.length > 0) {
    out.push("-- Flashcards ---------------------------------------------------------------------");
    for (const fc of flashcardNotes) {
      out.push(emitFlashcard(fc));
      out.push("");
    }
  }

  out.push("commit;");
  console.log(out.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
