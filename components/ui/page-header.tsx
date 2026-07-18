import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "./back-button";

// Shared page header: title + optional subtitle on the left, a back link on the right.
// Gives every screen the same top rhythm and a consistent "← back" affordance.
//
// `backHref="back"` is a special case: instead of a fixed destination, it goes back exactly one
// step in browser history. Use this for pages reached mid-flow from more than one place (e.g.
// "change filters" from an in-progress practice set) — a fixed href like `/dashboard` would
// strand the user away from whatever they were doing before, when what they actually want is to
// undo this one navigation.
export function PageHeader({
  title,
  subtitle,
  backHref = "/dashboard",
  backLabel = "Dashboard",
}: {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string | "back" | null;
  backLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {backHref === "back" ? (
        <BackButton label={backLabel} />
      ) : (
        backHref && (
          <Link
            href={backHref}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link>
        )
      )}
    </div>
  );
}
