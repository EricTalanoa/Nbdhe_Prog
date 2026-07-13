import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shared page header: title + optional subtitle on the left, a back link on the right.
// Gives every screen the same top rhythm and a consistent "← back" affordance.
export function PageHeader({
  title,
  subtitle,
  backHref = "/dashboard",
  backLabel = "Dashboard",
}: {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string | null;
  backLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {backLabel}
        </Link>
      )}
    </div>
  );
}
