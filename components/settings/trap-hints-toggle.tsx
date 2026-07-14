"use client";

import { useState, useTransition } from "react";
import { setTrapHints } from "@/app/settings/actions";
import { cn } from "@/lib/utils";

export function TrapHintsToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      const ok = await setTrapHints(next);
      if (!ok) setOn(!next); // revert on failure
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Reveal trick questions"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        on ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
