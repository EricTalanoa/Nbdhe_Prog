import Link from "next/link";

// Static fallback served by the service worker when a navigation fails offline.
export const metadata = { title: "Offline · NBDHE Prep" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page isn&apos;t cached yet. Pages you&apos;ve already opened stay available offline —
        reconnect to load new content.
      </p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">
        Try the dashboard
      </Link>
    </main>
  );
}
