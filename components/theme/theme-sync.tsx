"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { applyTheme, isThemeMode, THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

function currentMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return "system";
}

// Mounted app-wide (like PwaManager) so the theme keeps working outside /settings. Two jobs:
// 1. Re-apply live if the OS theme flips while a "system" mode tab is open (the inline
//    ThemeScript in <head> only runs once, on load).
// 2. For a signed-in user, treat their `profiles.theme` row as the account's source of truth —
//    on mount, pull it down and apply it so a new/other device picks up what they set on
//    /settings, the same sync-across-devices behavior as dashboard_mode/show_trick_badge.
// Degrades to whatever's in localStorage (or "system") if the column isn't there yet. Renders
// nothing.
export function ThemeSync() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (currentMode() === "system") applyTheme("system");
    };
    media.addEventListener("change", onSystemChange);

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .maybeSingle();
      if (error || !profile) return;

      if (isThemeMode(profile.theme)) applyTheme(profile.theme);
    })();

    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  return null;
}
