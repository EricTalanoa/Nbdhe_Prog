"use client";

import { useEffect, useState } from "react";

// beforeinstallprompt isn't in the DOM lib types yet.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Registers the service worker app-wide and, when the browser offers it, shows a small
// "Install app" button (Android/desktop Chrome fire `beforeinstallprompt`). Renders nothing
// when install isn't available or the app is already installed.
export function PwaManager() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort; the app works without it */
      });
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || dismissed) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-card px-4 py-2 text-sm shadow-lg">
        <span className="text-muted-foreground">Install NBDHE Prep for offline study</span>
        <button
          onClick={install}
          className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
