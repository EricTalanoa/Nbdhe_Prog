"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/auth/google-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "check-email">("idle");
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setStatus("working");
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
      // "Confirm email" is on in the Supabase project — no session yet, an email is on its way.
      setStatus("check-email");
    } else {
      window.location.assign("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>NBDHE Prep 2026</CardTitle>
          <CardDescription>
            {mode === "sign-in" ? "Sign in to your account." : "Create an account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "check-email" ? (
            <div className="space-y-2 text-sm">
              <p>
                Check your email — we sent a confirmation link to{" "}
                <span className="font-medium">{email}</span>.
              </p>
              <p className="text-muted-foreground">
                If you don&apos;t see it within a minute, check your spam or junk folder.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex rounded-md border p-1 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-in");
                    setError(null);
                  }}
                  className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
                    mode === "sign-in" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-up");
                    setError(null);
                  }}
                  className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
                    mode === "sign-up" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Create account
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {mode === "sign-up" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}
                {mode === "sign-in" && (
                  <div className="text-right text-sm">
                    <Link href="/auth/reset-password" className="text-primary underline-offset-4 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={status === "working"}>
                  {status === "working"
                    ? "Please wait…"
                    : mode === "sign-in"
                      ? "Sign in"
                      : "Create account"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
