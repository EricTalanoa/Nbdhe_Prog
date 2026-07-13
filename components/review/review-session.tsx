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

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">
        Card {index + 1} of {cards.length}
      </div>
      <Flashcard key={cards[index].id} card={cards[index]} onGraded={handleGraded} />
    </div>
  );
}
