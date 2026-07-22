import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-lg font-semibold">Sign-in problem</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That link is invalid or has expired, or the sign-in attempt failed. Please try again.
      </p>
      <Button asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </main>
  );
}
