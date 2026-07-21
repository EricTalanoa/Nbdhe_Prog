"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetTopicProgress } from "@/app/topics/actions";

type Status = { kind: "idle" } | { kind: "done"; clearedCount: number; migrationPending: boolean } | { kind: "error"; message: string };

// Two-step confirm: the initial button only arms the confirm state, a second click actually
// deletes. Nothing is destroyed on a single accidental click.
export function ResetProgress({ area }: { area: string }) {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleReset() {
    startTransition(async () => {
      const result = await resetTopicProgress(area);
      setConfirming(false);
      if (!result.ok) {
        setStatus({ kind: "error", message: result.error ?? "Something went wrong." });
        return;
      }
      setStatus({ kind: "done", clearedCount: result.clearedCount, migrationPending: result.migrationPending });
      router.refresh();
    });
  }

  return (
    <section className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
        <AlertTriangle className="size-3.5" />
        Danger zone
      </h2>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        Clear your practice history for {area} — answered questions, flagged items, and spaced-
        repetition schedules. This can&rsquo;t be undone. Content and other topics are unaffected.
      </p>

      {!confirming ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)} disabled={pending}>
          <RotateCcw className="size-3.5" />
          Reset progress for this topic
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Are you sure? This can&rsquo;t be undone.</span>
          <Button type="button" variant="destructive" size="sm" onClick={handleReset} disabled={pending}>
            {pending ? "Resetting…" : "Yes, reset it"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
            Cancel
          </Button>
        </div>
      )}

      {status.kind === "done" && (
        <p className="mt-3 text-sm text-muted-foreground">
          {status.clearedCount > 0
            ? `Cleared ${status.clearedCount} record${status.clearedCount === 1 ? "" : "s"} for this topic.`
            : "Nothing to clear — you haven't studied this topic yet."}
          {status.migrationPending && (
            <span className="mt-1 block text-xs text-amber-600 dark:text-amber-400">
              Some history couldn&rsquo;t be removed yet — a pending update needs to be applied first.
            </span>
          )}
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-3 text-sm text-destructive">Couldn&rsquo;t reset progress: {status.message}</p>
      )}
    </section>
  );
}
