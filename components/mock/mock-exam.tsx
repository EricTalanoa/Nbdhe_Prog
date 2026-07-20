"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { finishSession, recordResponse } from "@/app/practice/actions";
import { QuestionRenderer } from "@/components/practice/question-renderer";
import { PatientBox, type PatientBoxData } from "@/components/cases/patient-box";
import { BAND_META, type Band } from "@/lib/readiness";
import { mockScoreBand } from "@/lib/mock";
import type { PracticeQuestion } from "@/components/practice/types";

export type MockStimulus = { title: string; patientType: string | null; patientBox: PatientBoxData };
export type MockItem = { question: PracticeQuestion; scoreArea: string; stimulus?: MockStimulus };

type Phase = "intro" | "A" | "break" | "B" | "done";
type Result = { correct: boolean; scoreArea: string; component: "A" | "B" };

function formatClock(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function pct(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function accuracyTone(accuracy: number): string {
  if (accuracy >= 80) return "bg-emerald-500";
  if (accuracy >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function Bar({ accuracy }: { accuracy: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      <div className={`h-full rounded-full ${accuracyTone(accuracy)}`} style={{ width: `${accuracy}%` }} />
    </div>
  );
}

function BandChip({ band }: { band: Band }) {
  const meta = BAND_META[band];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${meta.chip}`}>
      {meta.label}
    </span>
  );
}

export function MockExam({
  sessionId,
  sectionA,
  sectionB,
  perItemSeconds,
}: {
  sessionId: string | null;
  sectionA: MockItem[];
  sectionB: MockItem[];
  perItemSeconds: number;
}) {
  const timeA = sectionA.length * perItemSeconds;
  const timeB = sectionB.length * perItemSeconds;

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const finishReported = useRef(false);

  const inSection = phase === "A" || phase === "B";
  const activeSection = phase === "A" ? sectionA : phase === "B" ? sectionB : [];

  function startSection(next: "A" | "B") {
    setIndex(0);
    setRemaining(next === "A" ? timeA : timeB);
    setPhase(next);
  }

  // Section countdown: tick each second; re-armed whenever the section (phase) changes.
  useEffect(() => {
    if (!inSection) return;
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, inSection]);

  // When a section's time runs out, advance to the next phase.
  useEffect(() => {
    if (inSection && remaining === 0) {
      setPhase((p) => (p === "A" ? "break" : "done"));
    }
  }, [remaining, inSection]);

  // Persist the mock session's overall summary once, when we reach results.
  useEffect(() => {
    if (phase !== "done" || finishReported.current) return;
    finishReported.current = true;
    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    finishSession(sessionId, { total, correct, percent: pct(correct, total) });
  }, [phase, results, sessionId]);

  if (sectionA.length === 0 && sectionB.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Not enough content for a mock yet.</p>
        <p className="mt-2">Approve more questions (and at least one case) to run a full mock.</p>
      </Card>
    );
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <Card className="p-8">
        <h2 className="text-lg font-semibold tracking-tight">Before you start</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This mirrors the NBDHE format: two timed components with a break between them, then a
          readiness band at the end. Like the real exam, feedback is shown as you go.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between gap-4 rounded-lg border bg-card px-4 py-2">
            <span>
              <span className="font-medium">Component A</span> — discipline-based
            </span>
            <span className="text-muted-foreground">
              {sectionA.length} items · {Math.round(timeA / 60)} min
            </span>
          </li>
          <li className="flex justify-between gap-4 rounded-lg border bg-card px-4 py-2">
            <span>
              <span className="font-medium">Component B</span> — case-based
            </span>
            <span className="text-muted-foreground">
              {sectionB.length} items · {Math.round(timeB / 60)} min
            </span>
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={() => startSection("A")}>Start Component A</Button>
          <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
            Cancel
          </Link>
        </div>
      </Card>
    );
  }

  // ── Break ──────────────────────────────────────────────────────────────────
  if (phase === "break") {
    const aResults = results.filter((r) => r.component === "A");
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Component A complete
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {aResults.filter((r) => r.correct).length}/{aResults.length}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Take an optional break. Component B ({sectionB.length} case item
          {sectionB.length === 1 ? "" : "s"}) starts when you&apos;re ready.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => startSection("B")} disabled={sectionB.length === 0}>
            Begin Component B
          </Button>
          <Button variant="outline" onClick={() => setPhase("done")}>
            End mock now
          </Button>
        </div>
      </Card>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    const overall = pct(correct, total);
    const band = mockScoreBand(overall);
    const aRes = results.filter((r) => r.component === "A");
    const bRes = results.filter((r) => r.component === "B");

    const byArea = new Map<string, { attempts: number; correct: number }>();
    for (const r of results) {
      const s = byArea.get(r.scoreArea) ?? { attempts: 0, correct: 0 };
      s.attempts += 1;
      if (r.correct) s.correct += 1;
      byArea.set(r.scoreArea, s);
    }
    const areas = Array.from(byArea.entries())
      .map(([area, s]) => ({ area, ...s, accuracy: pct(s.correct, s.attempts) }))
      .sort((a, b) => a.accuracy - b.accuracy);

    return (
      <div className="space-y-8">
        <Card className="p-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Mock complete
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{overall}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {correct}/{total} correct
          </p>
          <div className="mt-3 flex justify-center">
            <BandChip band={band} />
          </div>
          <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Component A</p>
              <p className="mt-1 font-medium">
                {pct(aRes.filter((r) => r.correct).length, aRes.length)}% · {aRes.filter((r) => r.correct).length}/{aRes.length}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Component B</p>
              <p className="mt-1 font-medium">
                {pct(bRes.filter((r) => r.correct).length, bRes.length)}% · {bRes.filter((r) => r.correct).length}/{bRes.length}
              </p>
            </div>
          </div>
        </Card>

        {areas.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              By score area
            </h2>
            <div className="space-y-3">
              {areas.map((a) => (
                <div key={a.area} className="rounded-lg border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{a.area}</span>
                    <span className="text-sm text-muted-foreground">
                      {a.accuracy}% · {a.correct}/{a.attempts}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Bar accuracy={a.accuracy} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/analytics">View progress</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Active section (A or B) ──────────────────────────────────────────────────
  const item = activeSection[index];
  const answered = results.filter((r) => r.component === phase).length > index;
  const componentLabel = phase === "A" ? "Component A · discipline" : "Component B · case-based";
  const lowTime = remaining <= 30;

  function handleAnswered(correct: boolean, selectedOptionId: string | null, timeMs: number) {
    setResults((prev) => [...prev, { correct, scoreArea: item.scoreArea, component: phase as "A" | "B" }]);
    recordResponse({
      sessionId,
      questionId: item.question.id,
      selectedOptionId,
      timeMs,
    });
  }

  function handleNext() {
    if (index + 1 >= activeSection.length) {
      setPhase(phase === "A" ? "break" : "done");
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {componentLabel} · {index + 1} of {activeSection.length}
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 font-mono tabular-nums ${
            lowTime ? "border-destructive/50 text-destructive" : ""
          }`}
          aria-label="time remaining"
        >
          {formatClock(remaining)}
        </span>
      </div>

      {item.stimulus && (
        <div className="mb-4">
          <PatientBox
            title={item.stimulus.title}
            patientType={item.stimulus.patientType}
            patientBox={item.stimulus.patientBox}
          />
        </div>
      )}

      <QuestionRenderer key={item.question.id} question={item.question} onAnswered={handleAnswered} />

      {answered && (
        <div className="mt-5 flex justify-end">
          <Button onClick={handleNext}>
            {index + 1 >= activeSection.length
              ? phase === "A"
                ? "Finish Component A"
                : "Finish mock"
              : "Next question"}
          </Button>
        </div>
      )}
    </div>
  );
}
