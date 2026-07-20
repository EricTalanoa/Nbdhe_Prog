"use client";

import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { setTheme } from "@/app/settings/actions";
import { applyTheme, type ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

// A theme flip should feel instant, so this applies the class + localStorage change on click
// (lib/theme.ts's applyTheme) before the server round-trip finishes, then fires setTheme to
// persist it to `profiles.theme` (synced across devices, same as ModeToggle's dashboard_mode).
export function ThemeToggle({ initialTheme }: { initialTheme: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(initialTheme);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === mode;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (active) return;
              setMode(opt.value);
              applyTheme(opt.value);
              void setTheme(opt.value);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
