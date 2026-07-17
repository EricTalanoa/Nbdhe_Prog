"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DashboardMode = "method" | "topic";

// Degrades gracefully (log + no-op) if the `dashboard_mode` migration hasn't been applied yet —
// same pattern as app/practice/actions.ts.
export async function setDashboardMode(formData: FormData): Promise<void> {
  const mode = formData.get("mode");
  if (mode !== "method" && mode !== "topic") return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ dashboard_mode: mode })
    .eq("id", user.id);
  if (error) {
    console.error("setDashboardMode: failed to persist (migration not applied yet?)", error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
