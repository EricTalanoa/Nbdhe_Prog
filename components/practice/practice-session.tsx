"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { finishSession, recordResponse } from "@/app/practice/actions";
import { QuestionRenderer } from "./question-renderer";
import type { PracticeQuestion } from "./types";

export function PracticeSession({
  questions,
  sessionId,
}: {
  questions: PracticeQuestion[];
  sessionId: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const finished = questions.length > 0 && index >= questions.length;
  const finishReported = useRef(false);

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
      <Card className="p-8 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">No questions available yet.</p>
        <p className="mt-2">
          Content is still being authored — check back once more items reach{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">approved</code> status.
        </p>
      </Card>
    );
  }

  if (finished) {
    const correctCount = results.filter(Boolean).length;
    const total = results.length;
    const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Practice set complete
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">
          {correctCount}/{total}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{pct}% correct</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/practice">Start another set</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const question = questions[index];
  const answered = results.length > index;

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
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>{results.filter(Boolean).length} correct so far</span>
      </div>

      <QuestionRenderer key={question.id} question={question} onAnswered={handleAnswered} />

      {answered && (
        <div className="mt-5 flex justify-end">
          <Button onClick={handleNext}>
            {index === questions.length - 1 ? "Finish" : "Next question"}
          </Button>
        </div>
      )}
    </div>
  );
}
