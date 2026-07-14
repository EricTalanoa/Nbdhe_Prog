#!/usr/bin/env node
// Phase 1 — vault question notes -> Supabase.
//
// Parses every `q-*.md` note in the content vault, validates it against the authoring
// rules, and upserts it into questions / options / rationales. Content tables have no
// client write policy (see 20260710000002_content_stubs.sql), so writes go through the
// service role, which bypasses RLS.
//
// Usage:
//   node scripts/import-questions.mjs --check     # parse + validate only, no DB, no creds
//   node scripts/import-questions.mjs             # validate, then upsert into Supabase
//
// Import mode needs env (put these in your shell, NOT in .env.local):
//   NEXT_PUBLIC_SUPABASE_URL   — same project URL the app uses
//   SUPABASE_SERVICE_ROLE_KEY  — Project Settings -> API -> service_role (secret!)
//
// Exit code is non-zero if any note fails validation, so this is CI-friendly.

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, "..", "Planning", "NBDHE-Prep-vault", "02-Content");
const SEED_MIGRATION = join(__dirname, "..", "supabase", "migrations", "20260710000003_seed_taxonomy.sql");
const SPEC_VERSION = "after_update_2026";

// Key a taxonomy leaf by (area, domain, subdomain); empty and null collapse together.
const taxKey = (a, d, s) => `${a || ""}|${d || ""}|${s || ""}`;

const FORMATS = new Set(["completion", "question", "negative"]);
const DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const STATUSES = new Set(["draft", "review", "approved", "live"]);
const OPTION_LABELS = ["A", "B", "C", "D", "E"];
const PATIENT_TYPES = new Set([
  "adult",
  "pediatric",
  "geriatric",
  "special_needs",
  "medically_compromised",
]);

const checkOnly = process.argv.includes("--check");

// ── Minimal frontmatter parser ────────────────────────────────────────────────
// Our notes use a controlled template: `---` fenced block of `key: value` scalars,
// values optionally wrapped in double quotes. No nested structures, so no YAML dep.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // strip trailing inline comment on unquoted values (e.g. `case: ""   # slug`)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: match[2] };
}

// Split body into the note's `# Heading` sections.
function splitSections(body) {
  const sections = {};
  let current = null;
  let buf = [];
  const flush = () => {
    if (current) sections[current] = buf.join("\n").trim();
    buf = [];
  };
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^#\s+(.*)$/);
    if (h) {
      flush();
      current = h[1].trim().toLowerCase();
    } else if (current) {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

function stripComments(text) {
  return (text || "").replace(/<!--[\s\S]*?-->/g, "").trim();
}

// Parse `- A) body text (correct)` option lines.
function parseOptions(optionsText) {
  const options = [];
  for (const line of stripComments(optionsText).split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*([A-E])\)\s*(.*)$/);
    if (!m) continue;
    let body = m[2].trim();
    let isCorrect = false;
    const correctTag = body.match(/\s*\(correct\)\s*$/i);
    if (correctTag) {
      isCorrect = true;
      body = body.slice(0, correctTag.index).trim();
    }
    options.push({ label: m[1], body, isCorrect });
  }
  return options;
}

// Parse the `- A) reason` lines under **Why the distractors are wrong**.
function parseDistractorRationales(rationaleText) {
  const map = {};
  const marker = rationaleText.search(/why the distractors are wrong/i);
  if (marker === -1) return { correct: stripComments(rationaleText), map };
  const correct = stripComments(rationaleText.slice(0, marker)).replace(/\*+$/, "").trim();
  const after = rationaleText.slice(marker);
  let currentLabel = null;
  for (const line of after.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*([A-E])\)\s*(.*)$/);
    if (m) {
      currentLabel = m[1];
      map[currentLabel] = m[2].trim();
    } else if (currentLabel && line.trim()) {
      map[currentLabel] += " " + line.trim();
    }
  }
  return { correct, map };
}

function parseNote(filename, raw) {
  const errors = [];
  const { data, body } = parseFrontmatter(raw);
  const sections = splitSections(body);

  const slug = data.id?.trim();
  const stem = stripComments(sections["stem"]);
  const options = parseOptions(sections["options"] || "");
  const correctAnswer = stripComments(sections["correct answer"]).toUpperCase();
  const { correct: correctExplanation, map: distractorMap } = parseDistractorRationales(
    sections["rationale"] || ""
  );

  // Optional `# Trap` section: non-empty marks a wording-trap item; text is the
  // learner-facing callout. Section absent → null (ordinary item).
  const hasTrapSection = "trap" in sections;
  const trapNote = hasTrapSection ? stripComments(sections["trap"]) : "";

  // required frontmatter
  if (!slug) errors.push("missing frontmatter `id` (used as slug)");
  if (!FORMATS.has(data.format)) errors.push(`format must be one of ${[...FORMATS].join("/")}`);
  if (!DIFFICULTIES.has(data.difficulty))
    errors.push(`difficulty must be one of ${[...DIFFICULTIES].join("/")}`);
  if (!STATUSES.has(data.status)) errors.push(`status must be one of ${[...STATUSES].join("/")}`);
  if (!data.area) errors.push("missing `area`");
  if (!data.domain) errors.push("missing `domain`");
  if (!data.reference) errors.push("missing `reference`");

  // body
  if (!stem) errors.push("empty stem");
  if (options.length < 3 || options.length > 5)
    errors.push(`must have 3–5 options (found ${options.length})`);
  if (hasTrapSection && !trapNote) errors.push("`# Trap` section is present but empty");

  const labels = options.map((o) => o.label);
  const expected = OPTION_LABELS.slice(0, options.length);
  if (labels.join("") !== expected.join(""))
    errors.push(`option labels must be sequential ${expected.join("")}, found ${labels.join("") || "none"}`);

  const correctOpts = options.filter((o) => o.isCorrect);
  if (correctOpts.length !== 1) errors.push(`exactly one option must be marked (correct) (found ${correctOpts.length})`);
  if (correctOpts.length === 1 && correctAnswer && correctOpts[0].label !== correctAnswer)
    errors.push(`# Correct answer (${correctAnswer}) disagrees with the (correct)-marked option (${correctOpts[0].label})`);

  if (!correctExplanation) errors.push("missing rationale for the correct answer");
  for (const o of options) {
    if (!o.isCorrect && !distractorMap[o.label])
      errors.push(`missing distractor rationale for option ${o.label}`);
  }

  if (data.format === "negative" && !/\b(EXCEPT|NOT)\b/.test(stem))
    errors.push("negative-format stem should contain a capitalized EXCEPT or NOT");

  return {
    filename,
    slug,
    frontmatter: data,
    question: {
      slug,
      format: data.format,
      stem,
      difficulty: data.difficulty,
      status: data.status,
      reference: data.reference || null,
      trap_note: trapNote || null,
    },
    taxonomy: {
      area: data.area || "",
      domain: data.domain || "",
      subdomain: data.subdomain || "",
    },
    options: options.map((o, i) => ({
      label: o.label,
      body: o.body,
      is_correct: o.isCorrect,
      distractor_rationale: o.isCorrect ? null : distractorMap[o.label] || null,
      sort_order: i,
    })),
    correctExplanation,
    caseSlug: data.case?.trim() || null,
    testletSlug: data.testlet?.trim() || null,
    errors,
  };
}

// Parse a `case-*.md` note (patient box + optional notes). Media (case_media) isn't
// authored from notes yet — add via Supabase Storage + a manual insert once a case needs it.
function parseCaseNote(filename, raw) {
  const errors = [];
  const { data, body } = parseFrontmatter(raw);
  const sections = splitSections(body);

  const slug = data.id?.trim();
  const title = data.title?.trim();
  const patientType = data.patient_type?.trim();
  const demographics = stripComments(sections["demographics"]);
  const chiefComplaint = stripComments(sections["chief complaint"]);
  const backgroundHistory = stripComments(sections["background / history"]);
  const currentFindings = stripComments(sections["current findings"]);
  const notes = stripComments(sections["notes"]);

  if (!slug) errors.push("missing frontmatter `id` (used as slug)");
  if (!STATUSES.has(data.status)) errors.push(`status must be one of ${[...STATUSES].join("/")}`);
  if (!title) errors.push("missing `title`");
  if (!patientType) errors.push("missing `patient_type`");
  else if (!PATIENT_TYPES.has(patientType))
    errors.push(`patient_type must be one of ${[...PATIENT_TYPES].join("/")}`);
  if (!demographics) errors.push("empty Demographics section");
  if (!chiefComplaint) errors.push("empty Chief Complaint section");
  if (!backgroundHistory) errors.push("empty Background / History section");
  if (!currentFindings) errors.push("empty Current Findings section");

  return {
    filename,
    slug,
    case: {
      slug,
      title: title || null,
      patient_type: patientType || null,
      patient_box: {
        demographics,
        chief_complaint: chiefComplaint,
        background_history: backgroundHistory,
        current_findings: currentFindings,
      },
      notes: notes || null,
    },
    errors,
  };
}

// Parse an `fc-*.md` dedicated flashcard note: frontmatter taxonomy + `# Front` / `# Back`.
function parseFlashcardNote(filename, raw) {
  const errors = [];
  const { data, body } = parseFrontmatter(raw);
  const sections = splitSections(body);

  const slug = data.id?.trim();
  const front = stripComments(sections["front"]);
  const back = stripComments(sections["back"]);

  if (!slug) errors.push("missing frontmatter `id` (used as slug)");
  if (!STATUSES.has(data.status)) errors.push(`status must be one of ${[...STATUSES].join("/")}`);
  if (!data.area) errors.push("missing `area`");
  if (!data.domain) errors.push("missing `domain`");
  if (!front) errors.push("empty Front section");
  if (!back) errors.push("empty Back section");

  return {
    filename,
    slug,
    flashcard: {
      slug,
      front,
      back,
      status: data.status,
      reference: data.reference || null,
    },
    taxonomy: {
      area: data.area || "",
      domain: data.domain || "",
      subdomain: data.subdomain || "",
    },
    errors,
  };
}

async function loadContentFiles() {
  return await readdir(CONTENT_DIR);
}

async function loadNotes(files) {
  const questionFiles = files.filter((f) => /^q-.*\.md$/.test(f)).sort();
  const notes = [];
  for (const f of questionFiles) {
    const raw = await readFile(join(CONTENT_DIR, f), "utf8");
    notes.push(parseNote(f, raw));
  }
  return notes;
}

async function loadCaseNotes(files) {
  const caseFiles = files.filter((f) => /^case-.*\.md$/.test(f)).sort();
  const notes = [];
  for (const f of caseFiles) {
    const raw = await readFile(join(CONTENT_DIR, f), "utf8");
    notes.push(parseCaseNote(f, raw));
  }
  return notes;
}

async function loadFlashcardNotes(files) {
  const fcFiles = files.filter((f) => /^fc-.*\.md$/.test(f)).sort();
  const notes = [];
  for (const f of fcFiles) {
    const raw = await readFile(join(CONTENT_DIR, f), "utf8");
    notes.push(parseFlashcardNote(f, raw));
  }
  return notes;
}

// Parse a single-quoted SQL tuple, e.g. ('a','b',null,'c',101) -> ['a','b',null,'c','101'].
// Our taxonomy strings contain no apostrophes, so a simple quote-aware scan is enough.
function parseSqlTuple(line) {
  const fields = [];
  let i = line.indexOf("(") + 1;
  const end = line.lastIndexOf(")");
  while (i < end) {
    while (i < end && /[\s,]/.test(line[i])) i++;
    if (i >= end) break;
    if (line[i] === "'") {
      let j = i + 1;
      while (j < end && line[j] !== "'") j++;
      fields.push(line.slice(i + 1, j));
      i = j + 1;
    } else {
      let j = i;
      while (j < end && line[j] !== "," ) j++;
      const token = line.slice(i, j).trim();
      fields.push(token.toLowerCase() === "null" ? null : token);
      i = j;
    }
  }
  return fields;
}

// Derive the set of valid taxonomy keys straight from the seed migration so --check can
// verify note tagging offline, without a database. Columns:
// (spec_version, component, area, domain, subdomain, score_area, sort_order).
async function loadTaxonomyKeysFromMigration() {
  const sql = await readFile(SEED_MIGRATION, "utf8");
  const keys = new Set();
  for (const line of sql.split(/\r?\n/)) {
    if (!/^\s*\('after_update_2026'/.test(line)) continue;
    const [, , area, domain, subdomain] = parseSqlTuple(line);
    keys.add(taxKey(area, domain, subdomain));
  }
  return keys;
}

// Pull NEXT_PUBLIC_SUPABASE_URL from .env.local so the caller only has to supply the
// service-role key (which is intentionally NOT stored in .env.local). Real shell env wins.
async function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  let raw;
  try {
    raw = await readFile(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, v] = m;
    if (process.env[k] === undefined) process.env[k] = v.replace(/^["']|["']$/g, "");
  }
}

async function upsertAll(notes, caseNotes, flashcardNotes = []) {
  const { createClient } = await import("@supabase/supabase-js");
  await loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("<") || key.includes("<")) {
    console.error(
      "\nImport needs a real Supabase URL and service-role key."
    );
    console.error("NEXT_PUBLIC_SUPABASE_URL is read from .env.local automatically.");
    console.error("Set only the secret key, then re-run:");
    console.error('  $env:SUPABASE_SERVICE_ROLE_KEY = "<paste service_role key>"');
    console.error("  npm run content:import\n");
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  // Resolve (area, domain, subdomain) -> taxonomy id up front.
  const { data: taxonomy, error: taxErr } = await db
    .from("taxonomy")
    .select("id, area, domain, subdomain")
    .eq("spec_version", SPEC_VERSION);
  if (taxErr) throw taxErr;
  const taxMap = new Map(taxonomy.map((t) => [taxKey(t.area, t.domain, t.subdomain), t.id]));

  // Cases must exist before questions can be linked to them via case_id.
  const caseMap = new Map();
  for (const c of caseNotes) {
    const { data: caseRow, error: caseErr } = await db
      .from("cases")
      .upsert(
        { ...c.case, updated_at: new Date().toISOString() },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();
    if (caseErr) {
      console.error(`  ✗ ${c.slug} (case): ${caseErr.message}`);
      process.exitCode = 1;
      continue;
    }
    caseMap.set(caseRow.slug, caseRow.id);
    console.log(`  ✓ case ${c.slug}  [${c.case.title}]`);
  }

  let imported = 0;
  for (const note of notes) {
    const taxonomyId = taxMap.get(
      taxKey(note.taxonomy.area, note.taxonomy.domain, note.taxonomy.subdomain)
    );
    if (!taxonomyId) {
      console.error(
        `  ✗ ${note.slug}: no taxonomy row for area="${note.taxonomy.area}" domain="${note.taxonomy.domain}" subdomain="${note.taxonomy.subdomain}"`
      );
      process.exitCode = 1;
      continue;
    }

    let caseId = null;
    if (note.caseSlug) {
      caseId = caseMap.get(note.caseSlug) ?? null;
      if (!caseId) {
        console.error(`  ✗ ${note.slug}: case "${note.caseSlug}" was not imported (see above)`);
        process.exitCode = 1;
        continue;
      }
    }

    const { data: q, error: qErr } = await db
      .from("questions")
      .upsert(
        {
          ...note.question,
          taxonomy_id: taxonomyId,
          case_id: caseId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (qErr) {
      console.error(`  ✗ ${note.slug}: ${qErr.message}`);
      process.exitCode = 1;
      continue;
    }

    // Replace options wholesale (labels/text can change between edits).
    await db.from("options").delete().eq("question_id", q.id);
    const { error: optErr } = await db
      .from("options")
      .insert(note.options.map((o) => ({ ...o, question_id: q.id })));
    if (optErr) {
      console.error(`  ✗ ${note.slug} options: ${optErr.message}`);
      process.exitCode = 1;
      continue;
    }

    const { error: ratErr } = await db
      .from("rationales")
      .upsert(
        { question_id: q.id, correct_explanation: note.correctExplanation },
        { onConflict: "question_id" }
      );
    if (ratErr) {
      console.error(`  ✗ ${note.slug} rationale: ${ratErr.message}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`  ✓ ${note.slug}  [${note.frontmatter.status}]  ${note.taxonomy.domain}`);
    imported++;
  }
  console.log(`\nImported ${imported}/${notes.length} note(s).`);

  // Dedicated flashcards (fc-*.md) → flashcards table.
  let fcImported = 0;
  for (const fc of flashcardNotes) {
    const taxonomyId = taxMap.get(
      taxKey(fc.taxonomy.area, fc.taxonomy.domain, fc.taxonomy.subdomain)
    );
    if (!taxonomyId) {
      console.error(
        `  ✗ ${fc.slug}: no taxonomy row for area="${fc.taxonomy.area}" domain="${fc.taxonomy.domain}" subdomain="${fc.taxonomy.subdomain}"`
      );
      process.exitCode = 1;
      continue;
    }
    const { error: fcErr } = await db.from("flashcards").upsert(
      { ...fc.flashcard, taxonomy_id: taxonomyId, updated_at: new Date().toISOString() },
      { onConflict: "slug" }
    );
    if (fcErr) {
      console.error(`  ✗ ${fc.slug} (flashcard): ${fcErr.message}`);
      process.exitCode = 1;
      continue;
    }
    console.log(`  ✓ flashcard ${fc.slug}  [${fc.flashcard.status}]`);
    fcImported++;
  }
  if (flashcardNotes.length > 0) {
    console.log(`Imported ${fcImported}/${flashcardNotes.length} flashcard(s).`);
  }
}

async function main() {
  const files = await loadContentFiles();
  const notes = await loadNotes(files);
  const caseNotes = await loadCaseNotes(files);
  const flashcardNotes = await loadFlashcardNotes(files);
  if (notes.length === 0) {
    console.error(`No q-*.md notes found in ${CONTENT_DIR}`);
    process.exit(1);
  }

  // Cross-check every note's taxonomy tagging against the seed migration (offline). This
  // catches subdomain string drift — e.g. a hyphen where the blueprint uses an em dash.
  const taxKeys = await loadTaxonomyKeysFromMigration();
  const checkTaxonomy = (n) => {
    if (n.errors.length === 0 || !n.errors.some((e) => e.startsWith("missing `"))) {
      const key = taxKey(n.taxonomy.area, n.taxonomy.domain, n.taxonomy.subdomain);
      if (!taxKeys.has(key)) {
        n.errors.push(
          `taxonomy not in seed: area="${n.taxonomy.area}" domain="${n.taxonomy.domain}" subdomain="${n.taxonomy.subdomain}"`
        );
      }
    }
  };
  for (const n of notes) checkTaxonomy(n);
  for (const n of flashcardNotes) checkTaxonomy(n);

  // A question note can link to a case (frontmatter `case: <slug>`) — verify it points at
  // a case note that actually exists, entirely offline.
  const caseSlugs = new Set(caseNotes.map((c) => c.slug).filter(Boolean));
  for (const n of notes) {
    if (n.caseSlug && !caseSlugs.has(n.caseSlug)) {
      n.errors.push(`case "${n.caseSlug}" not found among case-*.md notes`);
    }
  }

  const invalidCases = caseNotes.filter((c) => c.errors.length > 0);
  for (const c of invalidCases) {
    console.error(`✗ ${c.filename}`);
    for (const e of c.errors) console.error(`    - ${e}`);
  }
  if (caseNotes.length > 0) {
    console.log(`${caseNotes.length - invalidCases.length}/${caseNotes.length} case note(s) valid.`);
  }

  const invalidFlashcards = flashcardNotes.filter((n) => n.errors.length > 0);
  for (const n of invalidFlashcards) {
    console.error(`✗ ${n.filename}`);
    for (const e of n.errors) console.error(`    - ${e}`);
  }
  if (flashcardNotes.length > 0) {
    console.log(
      `${flashcardNotes.length - invalidFlashcards.length}/${flashcardNotes.length} flashcard note(s) valid.`
    );
  }

  const invalid = notes.filter((n) => n.errors.length > 0);
  for (const n of invalid) {
    console.error(`✗ ${n.filename}`);
    for (const e of n.errors) console.error(`    - ${e}`);
  }
  const valid = notes.length - invalid.length;
  console.log(`\n${valid}/${notes.length} note(s) valid.`);

  if (invalid.length > 0 || invalidCases.length > 0 || invalidFlashcards.length > 0) {
    console.error(
      `\n${invalid.length + invalidCases.length + invalidFlashcards.length} note(s) failed validation — nothing was written.`
    );
    process.exit(1);
  }

  if (checkOnly) {
    console.log("--check: validation only, no database writes.");
    return;
  }

  console.log("\nImporting to Supabase…");
  await upsertAll(notes, caseNotes, flashcardNotes);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
