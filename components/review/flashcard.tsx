"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gradeReview, gradeFlashcard, reportQuestion } from "@/app/review/actions";
import { GRADES, previewInterval, type CardState, type Grade, type GradeTone } from "@/lib/srs";

export type ReviewCard = {
  id: string;
  kind: "question" | "flashcard";
  front: string;
  back: string;
  note: string | null; // correct-answer rationale for question cards; null for dedicated cards
  topic: string | null; // score area / subdomain, shown in the card eyebrow
  state: CardState; // current SM-2 state — drives the interval hints on the grade buttons
};

// Grade buttons are colour-coded by how much they set you back: rose = relearn, amber = shorter,
// solid green = the expected path, sky = push it out further. "Good" is the primary action, so
// it's the only filled button.
const TONES: Record<GradeTone, string> = {
  rose: "border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70",
  amber:
    "border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70",
  teal: "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400",
  sky: "border-sky-200 bg-sky-50/70 text-sky-700 hover:bg-sky-100 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/70",
};

const REPORT_REASONS = [
  { value: "wrong_answer", label: "Answer looks wrong" },
  { value: "typo", label: "Typo / formatting" },
  { value: "ambiguous", label: "Ambiguous or unclear" },
  { value: "other", label: "Other" },
];

function ReportForm({ questionId, onDone }: { questionId: string; onDone: () => void }) {
  const [reason, setReason] = useState("wrong_answer");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    setPending(true);
    const ok = await reportQuestion(questionId, reason, note);
    setPending(false);
    setSent(true);
    setTimeout(onDone, ok ? 900 : 1600);
  }

  if (sent) {
    return <p className="mt-3 text-xs text-muted-foreground">Thanks — report noted.</p>;
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border bg-muted/40 p-3">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional detail…"
        rows={2}
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          Submit report
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function Flashcard({
  card,
  position,
  total,
  onGraded,
}: {
  card: ReviewCard;
  position: number; // 1-based, shown in the card corner
  total: number;
  onGraded: (grade: Grade) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  // Once you've seen the back, grading stays unlocked even if you flip back to re-test yourself.
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);
  const [reporting, setReporting] = useState(false);

  function flip() {
    setFlipped((f) => !f);
    setRevealed(true);
  }

  async function grade(g: Grade) {
    if (grading || !revealed) return;
    setGrading(true);
    if (card.kind === "flashcard") await gradeFlashcard(card.id, g);
    else await gradeReview(card.id, g);
    onGraded(g);
  }

  const eyebrow = [card.kind === "flashcard" ? "Flashcard" : "Recall", card.topic]
    .filter(Boolean)
    .join(" · ");
  // Short answers get display treatment; long ones (a full option body) stay readable at prose size.
  const shortAnswer = card.back.length <= 24;

  return (
    <div>
      <div className="[perspective:1800px]">
        <div
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? "Flip card back to the question" : "Flip card to reveal the answer"}
          onClick={flip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              flip();
            }
          }}
          className="relative min-h-[20rem] w-full cursor-pointer rounded-3xl outline-none transition-transform duration-500 [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none"
          style={{
            transitionTimingFunction: "cubic-bezier(.4,.15,.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — the prompt. Gradient face so the "unanswered" side reads as the active one. */}
          <div className="absolute inset-0 flex flex-col rounded-3xl bg-gradient-to-br from-primary to-cyan-700 p-8 text-white shadow-[0_28px_56px_-28px_rgba(20,90,80,.7)] [backface-visibility:hidden] sm:px-11 dark:to-cyan-800">
            <div className="flex items-center justify-between font-mono text-[11px] text-emerald-100/90">
              <span className="uppercase tracking-[0.1em]">{eyebrow}</span>
              <span>
                {position} / {total}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center py-6">
              <p className="text-center text-xl font-medium leading-snug tracking-tight sm:text-2xl">
                {card.front}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-100/90">
              <RotateCcw className="size-3.5" />
              Click to flip
            </div>
          </div>

          {/* Back — the answer, pre-rotated so it faces the viewer after the flip. */}
          <div className="absolute inset-0 flex flex-col rounded-3xl border bg-card p-8 shadow-[0_28px_56px_-28px_rgba(20,60,55,.5)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:px-11">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-primary">
              Answer
            </span>
            <div
              className={`flex flex-1 items-center justify-center gap-7 py-6 ${
                shortAnswer && card.note ? "flex-row" : "flex-col text-center"
              }`}
            >
              <p
                className={
                  shortAnswer
                    ? "shrink-0 text-3xl font-bold tracking-tight text-emerald-800 sm:text-4xl dark:text-emerald-300"
                    : "text-base font-semibold leading-relaxed text-emerald-800 dark:text-emerald-300"
                }
              >
                {card.back}
              </p>
              {card.note && (
                <p className="max-w-[19rem] text-sm leading-relaxed text-muted-foreground">
                  {card.note}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="size-3.5" />
              Click to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Grading stays visible but inert until the answer has been seen — self-grading before you
          look at the back isn't meaningful, and hiding it entirely makes the layout jump. */}
      <div
        className={revealed ? "animate-in fade-in slide-in-from-bottom-2" : "opacity-40"}
        aria-hidden={!revealed}
      >
        <p className="mb-2.5 mt-6 text-center text-xs text-muted-foreground">
          How well did you recall it?
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              disabled={!revealed || grading}
              onClick={() => grade(g.grade)}
              className={`flex flex-col items-center gap-0.5 rounded-xl border-[1.5px] px-1 py-3 transition-colors disabled:cursor-not-allowed ${TONES[g.tone]}`}
            >
              <span className="text-sm font-semibold">{g.label}</span>
              <span className="font-mono text-[10px] opacity-70">
                {previewInterval(card.state, g.grade)}
              </span>
            </button>
          ))}
        </div>
      </div>
      {!revealed && (
        <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
          Flip the card to grade your recall.
        </p>
      )}

      {card.kind === "question" && (
        <div className="mt-6 border-t pt-3">
          {!reporting ? (
            <button
              type="button"
              onClick={() => setReporting(true)}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Report a problem with this question
            </button>
          ) : (
            <ReportForm questionId={card.id} onDone={() => setReporting(false)} />
          )}
        </div>
      )}
    </div>
  );
}
