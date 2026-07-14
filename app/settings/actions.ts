"use server";

import { createClient } from "@/lib/supabase/server";

// Persists the per-user "reveal trick questions" preference. Owner-only RLS on
// profiles scopes the update to the signed-in user. Returns false on any failure
// so the client can revert its optimistic state.
export async function setTrapHints(next: boolean): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ show_trap_hints: next })
    .eq("id", user.id);

  if (error) {
    console.error("setTrapHints: failed to persist preference", error.message);
    return false;
  }
  return true;
}
