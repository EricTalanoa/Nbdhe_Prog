"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flashcard, type ReviewCard } from "./flashcard";
import type { Grade } from "@/lib/srs";

export function ReviewSession({ cards }: { cards: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const [again, setAgain] = useState(0);

  if (cards.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Nothing due right now.</p>
        <p className="mt-2">
          You&apos;re caught up on reviews. Do a practice set to add cards to the schedule, or
          check back later.
        </p>
        <Link href="/practice" className="mt-4 inline-block underline underline-offset-4">
          Practice instead
        </Link>
      </Card>
    );
  }

  if (index >= cards.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Review complete
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">{cards.length}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          card{cards.length === 1 ? "" : "s"} reviewed
          {again > 0 && ` · ${again} to see again soon`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/review">Review more</Link>
          </Button>
        </div>
      </Card>
    );
  }

  function handleGraded(grade: Grade) {
    if (grade === "again") setAgain((n) => n + 1);
    setIndex((i) => i + 1);
  }

  // Coarse segmented bar rather than one tick per card: with a 20-card deck, 20 hairlines read as
  // noise. Cap the segments and fill them proportionally.
  const segments = Math.min(cards.length, 10);
  const filled = Math.ceil(((index + 1) / cards.length) * segments);

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          Card {index + 1} of {cards.length}
        </span>
        <div className="ml-4 flex max-w-[280px] flex-1 gap-1.5">
          {Array.from({ length: segments }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < filled ? "bg-primary" : "bg-accent"
              }`}
            />
          ))}
        </div>
      </div>
      <Flashcard
        key={cards[index].id}
        card={cards[index]}
        position={index + 1}
        total={cards.length}
        onGraded={handleGraded}
      />
    </div>
  );
}
