"use client";

import { useState, type ReactNode } from "react";
import { Bookmark, SkipForward, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleBookmark } from "@/app/practice/actions";
import type { PracticeQuestion, QuestionFormat } from "./types";

const FORMAT_LABEL: Record<QuestionFormat, string> = {
  completion: "Completion",
  question: "Question",
  negative: "Select the exception",
};

const CHIP = "rounded-md px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.06em]";

// Negative-format stems capitalize EXCEPT/NOT (authoring rule) — flag those words so the
// "find the odd one out" framing can't be missed while skimming.
function Stem({ format, stem }: { format: QuestionFormat; stem: string }) {
  const cls = "text-[19px] font-normal leading-relaxed tracking-tight";
  if (format !== "negative") {
    return <p className={cls}>{stem}</p>;
  }
  const parts = stem.split(/(EXCEPT|NOT)/);
  return (
    <p className={cls}>
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
  position,
  total,
  correctSoFar,
  timer,
  onAnswered,
  onNext,
  nextLabel,
  onSkip,
  showTrickBadge = false,
}: {
  question: PracticeQuestion;
  position: number; // 1-based
  total: number;
  // Running score. Omitted under mock-exam conditions, where a live tally isn't realistic.
  correctSoFar?: number;
  // Countdown chip for timed tests; omitted for untimed practice.
  timer?: ReactNode;
  onAnswered: (correct: boolean, selectedOptionId: string | null, timeMs: number) => void;
  onNext: () => void;
  nextLabel: string;
  // Defers this question to the end of the session's queue instead of forcing an answer.
  // Omitted (no button rendered) when there's only one question left to skip to.
  onSkip?: () => void;
  // Off unless the user opted in via Settings — the real exam never flags these, so the default
  // keeps practice realistic. See content-authoring-guidelines.md's "Trick questions" section.
  showTrickBadge?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [flagged, setFlagged] = useState(question.flagged);
  const [flagPending, setFlagPending] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const correctOption = question.options.find((o) => o.is_correct) ?? null;
  const selectedOption = question.options.find((o) => o.id === selectedId) ?? null;
  const selectedIsCorrect = selectedId != null && selectedId === correctOption?.id;

  function handleSubmit() {
    if (submitted) return onNext();
    if (!selectedId) return;
    setSubmitted(true);
    onAnswered(selectedIsCorrect, selectedId, Date.now() - startedAt);
  }

  async function handleToggleFlag() {
    const next = !flagged;
    setFlagged(next);
    setFlagPending(true);
    const ok = await toggleBookmark(question.id, next);
    if (!ok) setFlagged(!next);
    setFlagPending(false);
  }

  return (
    <div className="overflow-hidden rounded-[20px] border bg-card shadow-[0_24px_50px_-30px_rgba(20,60,55,.4),0_2px_6px_-2px_rgba(20,60,55,.08)]">
      {/* Session progress, welded to the top edge of the card. */}
      <div className="h-[5px] bg-accent">
        <div
          className="h-full rounded-r bg-gradient-to-r from-primary to-teal-500 transition-[width] duration-300"
          style={{ width: `${(position / total) * 100}%` }}
        />
      </div>

      <div className="px-6 py-7 sm:px-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(CHIP, "bg-accent text-primary")}>{FORMAT_LABEL[question.format]}</span>
            <span className={cn(CHIP, "bg-muted text-muted-foreground")}>{question.difficulty}</span>
            {showTrickBadge && question.is_trick && (
              <span
                className={cn(
                  CHIP,
                  "inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                )}
                title="Close answer choices — read carefully. The real exam won't flag this for you."
              >
                <Sparkles className="size-3" />
                Trick
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {timer}
            <span className="font-mono text-xs text-muted-foreground">
              Q{position} / {total}
            </span>
            <button
              type="button"
              onClick={handleToggleFlag}
              disabled={flagPending}
              aria-pressed={flagged}
              aria-label={flagged ? "Remove flag" : "Flag for review"}
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50",
                flagged && "text-amber-500 hover:text-amber-500"
              )}
            >
              <Bookmark className={cn("size-[18px]", flagged && "fill-current")} />
            </button>
          </div>
        </div>

        <Stem format={question.format} stem={question.stem} />

        <ul className="mt-5 space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isKey = option.is_correct;
            // After submitting, dim the distractors you didn't pick so the eye goes to the key
            // and to your own answer.
            const dimmed = submitted && !isKey && !isSelected;

            return (
              <li key={option.id}>
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelectedId(option.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[15px] transition-all disabled:cursor-default",
                    !submitted && isSelected && "border-primary bg-primary/5",
                    !submitted && !isSelected && "border-input hover:bg-accent/50",
                    submitted && isKey && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    submitted && isSelected && !isKey && "border-destructive bg-destructive/10",
                    dimmed && "opacity-55"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-[27px] shrink-0 place-items-center rounded-lg border text-[13px] font-bold",
                      "border-border bg-muted text-muted-foreground",
                      !submitted && isSelected && "border-primary bg-primary text-primary-foreground",
                      submitted && isKey && "border-emerald-500 bg-emerald-500 text-white",
                      submitted && isSelected && !isKey && "border-destructive bg-destructive text-destructive-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="flex-1 pt-0.5">{option.body}</span>
                  {submitted && isKey && (
                    <span className="text-[17px] font-bold text-emerald-600 dark:text-emerald-400">✓</span>
                  )}
                  {submitted && isSelected && !isKey && (
                    <span className="text-base font-bold text-destructive">✕</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {submitted && (
          <div
            className={cn(
              "mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-[13px] border px-4 py-3 text-sm leading-relaxed",
              selectedIsCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            )}
          >
            <span className="font-medium">
              {selectedIsCorrect
                ? "Correct"
                : `Not quite (answer ${correctOption?.label ?? "?"})`}
            </span>
            {" — "}
            {selectedIsCorrect
              ? question.correct_explanation
              : selectedOption?.distractor_rationale ?? question.correct_explanation}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3.5 border-t pt-5">
          <button
            type="button"
            disabled={!submitted && !selectedId}
            onClick={handleSubmit}
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_-6px_hsl(var(--primary))] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {submitted ? nextLabel : "Submit answer"}
          </button>
          {!submitted && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <SkipForward className="size-3.5" />
              Skip for now
            </button>
          )}
          <span className="flex-1" />
          {correctSoFar !== undefined && (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {correctSoFar} correct so far
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
