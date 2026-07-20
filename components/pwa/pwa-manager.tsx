"use client";

import { useEffect } from "react";

// Registers the service worker app-wide so offline caching keeps working, but does NOT show
// the "Install app" prompt for now (product decision — the install banner was removed). The
// `beforeinstallprompt` handling can be restored from git history if we want the prompt back.
// Renders nothing.
export function PwaManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort; the app works without it */
      });
    }
  }, []);

  return null;
}
