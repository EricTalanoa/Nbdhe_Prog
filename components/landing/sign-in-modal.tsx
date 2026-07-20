"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Magic-link sign-in as a modal on the landing page (8a). Reuses the same passwordless
// signInWithOtp flow the /login page uses; /login is kept as a fallback route. Styled with the
// landing's `nb-` CSS variables, so it inherits the seafoam theme (and its light/dark toggle)
// from the enclosing `.nb-root` wrapper.
export function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

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
      setStatus("idle");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    if (error) {
      setError(error.message);
      setStatus("idle");
    } else {
      setStatus("sent");
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

        {status === "sent" ? (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
              Check your email — we sent a sign-in link to{" "}
              <span style={{ fontWeight: 600 }}>{email}</span>.
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
              If this is a new account or you don&apos;t see it within a minute, check your spam or
              junk folder — the link often lands there.
            </p>
            <button type="button" onClick={onClose} className="nb-cta" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--muted)" }}>
              Sign in with a magic link — no password needed.
            </p>
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
            {error && (
              <p style={{ margin: 0, fontSize: 13, color: "var(--destructive, #dc2626)" }}>{error}</p>
            )}
            <button type="submit" disabled={status === "sending"} className="nb-cta" style={{ width: "100%", justifyContent: "center", opacity: status === "sending" ? 0.7 : 1 }}>
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
