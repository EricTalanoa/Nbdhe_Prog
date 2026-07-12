"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PracticeQuestion, QuestionFormat } from "./types";

const FORMAT_LABEL: Record<QuestionFormat, string> = {
  completion: "Completion",
  question: "Question",
  negative: "Select the exception",
};

// Negative-format stems capitalize EXCEPT/NOT (authoring rule) — flag those words so the
// "find the odd one out" framing can't be missed while skimming.
function Stem({ format, stem }: { format: QuestionFormat; stem: string }) {
  if (format !== "negative") {
    return <p className="text-base leading-relaxed">{stem}</p>;
  }
  const parts = stem.split(/(EXCEPT|NOT)/);
  return (
    <p className="text-base leading-relaxed">
      {parts.map((part, i) =>
        part === "EXCEPT" || part === "NOT" ? (
          <mark
            key={i}
            className="rounded bg-amber-200 px-1 font-semibold text-amber-950 dark:bg-amber-900 dark:text-amber-200"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export function QuestionRenderer({
  question,
  onAnswered,
}: {
  question: PracticeQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctOption = question.options.find((o) => o.is_correct) ?? null;
  const selectedIsCorrect = selectedId != null && selectedId === correctOption?.id;

  function handleSubmit() {
    if (!selectedId || submitted) return;
    setSubmitted(true);
    onAnswered(selectedIsCorrect);
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>{FORMAT_LABEL[question.format]}</span>
        <span aria-hidden="true">·</span>
        <span>{question.difficulty}</span>
      </div>

      <Stem format={question.format} stem={question.stem} />

      <ul className="mt-5 space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isKey = option.is_correct;
          const showResult = submitted && (isSelected || isKey);
          const explanation = isKey ? question.correct_explanation : option.distractor_rationale;

          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={submitted}
                onClick={() => setSelectedId(option.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  "disabled:cursor-default",
                  !submitted && isSelected && "border-primary bg-primary/5",
                  !submitted && !isSelected && "border-input hover:bg-accent/50",
                  submitted && isKey && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                  submitted &&
                    isSelected &&
                    !isKey &&
                    "border-destructive bg-destructive/10"
                )}
              >
                <span className="font-semibold">{option.label}.</span>
                <span className="flex-1">{option.body}</span>
                {submitted && isKey && (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                {submitted && isSelected && !isKey && (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
              </button>
              {submitted && showResult && explanation && (
                <p className="mt-1.5 px-4 text-sm text-muted-foreground">{explanation}</p>
              )}
            </li>
          );
        })}
      </ul>

      {!submitted ? (
        <Button className="mt-5" disabled={!selectedId} onClick={handleSubmit}>
          Submit answer
        </Button>
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
    </Card>
  );
}
