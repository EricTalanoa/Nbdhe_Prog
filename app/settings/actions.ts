"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isThemeMode, type ThemeMode } from "@/lib/theme";

// Called directly from the client (components/settings/theme-toggle.tsx applies the class +
// localStorage change immediately, then fires this to persist) rather than through a <form>,
// since a theme flip should feel instant — same "call a server action as a plain async
// function from a 'use client' component" pattern app/practice/actions.ts's recordResponse uses.
// Degrades to a no-op (logged) if the `theme` migration hasn't been applied yet.
export async function setTheme(mode: ThemeMode): Promise<void> {
  if (!isThemeMode(mode)) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").update({ theme: mode }).eq("id", user.id);
  if (error) {
    console.error("setTheme: failed to persist (migration not applied yet?)", error.message);
  }

  revalidatePath("/settings");
}

// Degrades gracefully (log + no-op) if the `show_trick_badge` migration hasn't been applied
// yet — same pattern as app/dashboard/actions.ts's setDashboardMode.
export async function setShowTrickBadge(formData: FormData): Promise<void> {
  const value = formData.get("show_trick_badge");
  if (value !== "true" && value !== "false") return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ show_trick_badge: value === "true" })
    .eq("id", user.id);
  if (error) {
    console.error("setShowTrickBadge: failed to persist (migration not applied yet?)", error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/practice");
  revalidatePath("/questions");
}
