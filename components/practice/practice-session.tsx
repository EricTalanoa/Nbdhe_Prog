"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionRenderer } from "./question-renderer";
import type { PracticeQuestion } from "./types";

export function PracticeSession({ questions }: { questions: PracticeQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

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

  const finished = index >= questions.length;

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

  function handleAnswered(correct: boolean) {
    setResults((prev) => [...prev, correct]);
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
