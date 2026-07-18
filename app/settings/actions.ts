"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
