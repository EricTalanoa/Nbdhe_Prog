import type { MetadataRoute } from "next";

// Phase 6b — PWA manifest (file convention: Next serves this at /manifest.webmanifest and injects
// the <link rel="manifest">). Icons are SVG (`sizes: "any"`), which modern Chrome/Edge accept for
// installability; PNG icons + a proper iOS apple-touch-icon are a later polish.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NBDHE Prep",
    short_name: "NBDHE Prep",
    description: "NBDHE practice, mock exams, cases, and analytics.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
