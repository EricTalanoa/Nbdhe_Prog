"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { gradeReview, gradeFlashcard, reportQuestion } from "@/app/review/actions";
import { GRADES, type Grade } from "@/lib/srs";

export type ReviewCard = {
  id: string;
  kind: "question" | "flashcard";
  front: string;
  back: string;
  note: string | null; // correct-answer rationale for question cards; null for dedicated cards
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
  onGraded,
}: {
  card: ReviewCard;
  onGraded: (grade: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);
  const [reporting, setReporting] = useState(false);

  async function grade(g: Grade) {
    if (grading) return;
    setGrading(true);
    if (card.kind === "flashcard") await gradeFlashcard(card.id, g);
    else await gradeReview(card.id, g);
    onGraded(g);
  }

  return (
    <Card className="p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {card.kind === "flashcard" ? "Flashcard" : "Recall"}
      </p>
      <p className="mt-3 text-base leading-relaxed">{card.front}</p>

      {!revealed ? (
        <Button className="mt-5" onClick={() => setRevealed(true)}>
          Show answer
        </Button>
      ) : (
        <div className="mt-5">
          <div className="rounded-lg border border-emerald-500 bg-emerald-50 px-4 py-3 dark:bg-emerald-950/40">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{card.back}</p>
            {card.note && <p className="mt-2 text-sm text-muted-foreground">{card.note}</p>}
          </div>

          <p className="mt-5 text-xs text-muted-foreground">How well did you recall it?</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <Button
                key={g.grade}
                variant={g.grade === "good" ? "default" : "outline"}
                size="sm"
                disabled={grading}
                onClick={() => grade(g.grade)}
              >
                {g.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {card.kind === "question" && (
        <div className="mt-4 border-t pt-3">
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
    </Card>
  );
}
