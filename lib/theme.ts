export type ThemeMode = "light" | "dark" | "system";

export const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

// localStorage key the inline anti-flash script (components/theme/theme-script.tsx) and
// ThemeSync both read/write. Keep these two files' literal key in sync if this ever changes.
export const THEME_STORAGE_KEY = "nbdhe-theme";

export function resolvesToDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolvesToDark(mode));
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* localStorage can be unavailable (private mode); the class toggle above still applied */
  }
}
