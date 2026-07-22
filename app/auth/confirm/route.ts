import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Shared callback for every auth flow that hands back a token: Google OAuth (code, PKCE),
// email/password signup confirmation (code, if "Confirm email" is on), and password-recovery
// links (token_hash + type=recovery — Supabase's own docs use verifyOtp rather than PKCE code
// exchange here since it isn't tied to the requesting browser's stored code verifier, so a
// recovery link opened on a different device still works). `next` picks where to land
// afterwards (defaults to /dashboard; password recovery passes next=/auth/update-password).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
