"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Goes back exactly one step in browser history, instead of a fixed destination — for pages
// reached mid-flow from more than one place (e.g. "change filters" from an in-progress practice
// set), so changing your mind doesn't strand you on a page with no way back to what you were
// doing. See PageHeader's `backHref="back"`.
export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </button>
  );
}
