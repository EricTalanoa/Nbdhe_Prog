"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { finishSession, recordResponse } from "@/app/practice/actions";
import { QuestionRenderer } from "./question-renderer";
import type { PracticeQuestion } from "./types";

function formatClock(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

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
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [endedEarly, setEndedEarly] = useState(false);
  const [remaining, setRemaining] = useState(timeLimitSec ?? 0);
  const finished = endedEarly || (questions.length > 0 && index >= questions.length);
  const finishReported = useRef(false);

  // Countdown for timed tests: tick once a second, auto-submit at zero.
  useEffect(() => {
    if (!timeLimitSec || finished) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setEndedEarly(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLimitSec, finished]);

  // Fires exactly once, the render where `finished` first flips true.
  useEffect(() => {
    if (!finished || finishReported.current) return;
    finishReported.current = true;
    const total = results.length;
    const correct = results.filter(Boolean).length;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
    finishSession(sessionId, { total, correct, percent });
  }, [finished, results, sessionId]);

  if (questions.length === 0) {
    return (
      <>
        {stimulus}
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No questions available yet.</p>
          <p className="mt-2">
            Content is still being authored — check back once more items reach{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">approved</code> status.
          </p>
        </Card>
      </>
    );
  }

  if (finished) {
    const correctCount = results.filter(Boolean).length;
    const total = results.length;
    const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const ranOutOfTime = Boolean(timeLimitSec) && remaining <= 0;
    return (
      <>
        {stimulus}
        <Card className="p-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {timeLimitSec ? "Timed test complete" : "Practice set complete"}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {correctCount}/{total}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pct}% correct
            {ranOutOfTime && " · time expired"}
            {total < questions.length && !ranOutOfTime && " · ended early"}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/practice">Start another set</Link>
            </Button>
          </div>
        </Card>
      </>
    );
  }

  const question = questions[index];
  const answered = results.length > index;
  const lowTime = Boolean(timeLimitSec) && remaining <= 30;

  function handleAnswered(correct: boolean, selectedOptionId: string | null, timeMs: number) {
    setResults((prev) => [...prev, correct]);
    recordResponse({
      sessionId,
      questionId: question.id,
      selectedOptionId,
      isCorrect: correct,
      timeMs,
    });
  }

  function handleNext() {
    setIndex((i) => i + 1);
  }

  return (
    <div>
      {stimulus}
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-4">
          <span>{results.filter(Boolean).length} correct so far</span>
          {timeLimitSec ? (
            <span
              className={`rounded-md border px-2 py-0.5 font-mono tabular-nums ${
                lowTime ? "border-destructive/50 text-destructive" : ""
              }`}
              aria-label="time remaining"
            >
              {formatClock(remaining)}
            </span>
          ) : null}
        </div>
      </div>

      <QuestionRenderer
        key={question.id}
        question={question}
        onAnswered={handleAnswered}
        showTrapHints={showTrapHints}
      />

      {(timeLimitSec || answered) && (
        <div className="mt-5 flex items-center justify-between">
          {timeLimitSec ? (
            <Button variant="outline" size="sm" onClick={() => setEndedEarly(true)}>
              End test now
            </Button>
          ) : (
            <span />
          )}
          {answered && (
            <Button onClick={handleNext}>
              {index === questions.length - 1 ? "Finish" : "Next question"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
