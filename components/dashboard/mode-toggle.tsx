import { LayoutGrid, ListTree } from "lucide-react";
import { setDashboardMode, type DashboardMode } from "@/app/dashboard/actions";

const OPTIONS: { value: DashboardMode; icon: typeof LayoutGrid; label: string }[] = [
  { value: "method", icon: LayoutGrid, label: "By method" },
  { value: "topic", icon: ListTree, label: "By topic" },
];

// Lives at the top of /dashboard (moved out of /settings, 2026-07) so switching views is a
// one-tap affordance instead of a trip to another page. Each option is its own tiny form
// (no client JS needed) — the active one renders as a plain, non-interactive pill.
export function ModeToggle({ mode }: { mode: DashboardMode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === mode;
        if (active) {
          return (
            <span
              key={opt.value}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <Icon className="size-3.5" />
              {opt.label}
            </span>
          );
        }
        return (
          <form key={opt.value} action={setDashboardMode}>
            <input type="hidden" name="mode" value={opt.value} />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon className="size-3.5" />
              {opt.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}
