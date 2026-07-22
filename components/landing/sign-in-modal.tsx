"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/auth/google-icon";

type Mode = "sign-in" | "sign-up";

// Sign-in as a modal on the landing page (8a), now Google OAuth + email/password (8h) instead of
// the original magic link. /login is kept as a fallback route with the same two options. Styled
// with the landing's `nb-` CSS variables, so it inherits the seafoam theme (and its light/dark
// toggle) from the enclosing `.nb-root` wrapper.
export function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "check-email">("idle");
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Reset transient state whenever the modal is closed.
  useEffect(() => {
    if (!open) {
      setMode("sign-in");
      setStatus("idle");
      setError(null);
      setGoogleLoading(false);
    }
  }, [open]);

  if (!open) return null;

  function missingSupabaseEnv() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError(
        "Sign-in isn't configured for this site yet (missing Supabase settings). If you're the owner, add the Supabase environment variables to the deployment and redeploy."
      );
      return true;
    }
    return false;
  }

  async function handleGoogle() {
    setError(null);
    // These are inlined at build time; if the deployment is missing them the Supabase client
    // silently can't reach the API and returns an opaque error. Fail with a clear message instead.
    if (missingSupabaseEnv()) return;

    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
      // On success the browser is redirected to Google; nothing else to do here.
    } catch (err) {
      console.error("signInWithOAuth threw:", err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't reach the sign-in service. Please check your connection and try again."
      );
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (missingSupabaseEnv()) return;

    setStatus("working");
    try {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          setStatus("idle");
        } else {
          window.location.assign("/dashboard");
        }
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (error) {
        setError(error.message);
        setStatus("idle");
      } else if (!data.session) {
        setStatus("check-email");
      } else {
        window.location.assign("/dashboard");
      }
    } catch (err) {
      console.error("auth submit threw:", err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't reach the sign-in service. Please check your connection and try again."
      );
      setStatus("idle");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "color-mix(in srgb, var(--fg) 45%, transparent)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "var(--shadow-lg)",
          padding: "30px 26px 26px",
        }}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="nb-close">
          ✕
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, var(--teal), var(--cyan))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6z" />
              <path d="M9 12l2 2 4-4.5" />
            </svg>
          </span>
          NBDHE Prep <span style={{ color: "var(--primary)" }}>2026</span>
        </div>

        {status === "check-email" ? (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
              Check your email — we sent a confirmation link to{" "}
              <span style={{ fontWeight: 600 }}>{email}</span>.
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
              If you don&apos;t see it within a minute, check your spam or junk folder.
            </p>
            <button type="button" onClick={onClose} className="nb-cta" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 10, padding: 4, gap: 4 }}>
              {(["sign-in", "sign-up"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: 7,
                    border: 0,
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: mode === m ? "var(--primary)" : "transparent",
                    color: mode === m ? "var(--primary-fg)" : "var(--muted)",
                  }}
                >
                  {m === "sign-in" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--fg)",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: "inherit",
                cursor: googleLoading ? "default" : "pointer",
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              <GoogleIcon size={16} />
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted)" }}>
              <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
              or
              <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="nb-signin-email" style={{ fontSize: 13, fontWeight: 600 }}>
                  Email
                </label>
                <input
                  id="nb-signin-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nb-input"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="nb-signin-password" style={{ fontSize: 13, fontWeight: 600 }}>
                  Password
                </label>
                <input
                  id="nb-signin-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nb-input"
                />
              </div>
              {mode === "sign-up" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="nb-signin-confirm-password" style={{ fontSize: 13, fontWeight: 600 }}>
                    Confirm password
                  </label>
                  <input
                    id="nb-signin-confirm-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="nb-input"
                  />
                </div>
              )}
              {mode === "sign-in" && (
                <a
                  href="/auth/reset-password"
                  style={{ fontSize: 12.5, color: "var(--primary)", textAlign: "right", fontWeight: 600 }}
                >
                  Forgot password?
                </a>
              )}
              {error && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--destructive, #dc2626)" }}>{error}</p>
              )}
              <button type="submit" disabled={status === "working"} className="nb-cta" style={{ width: "100%", justifyContent: "center", opacity: status === "working" ? 0.7 : 1 }}>
                {status === "working" ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
