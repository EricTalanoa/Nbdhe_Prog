import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PwaManager } from "@/components/pwa/pwa-manager";
import { ThemeScript } from "@/components/theme/theme-script";
import { ThemeSync } from "@/components/theme/theme-sync";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NBDHE Prep",
  description: "NBDHE practice, mock exams, cases, and analytics.",
  applicationName: "NBDHE Prep",
  appleWebApp: { capable: true, title: "NBDHE Prep", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: ThemeScript sets `dark` on this element before React hydrates
    // (see its own comment for why), so its class attribute legitimately differs from what the
    // server rendered — this is the standard escape hatch for that one attribute, not a blanket
    // opt-out (it doesn't suppress anything else).
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "font-sans antialiased"
        )}
      >
        <ThemeScript />
        {children}
        <PwaManager />
        <ThemeSync />
      </body>
    </html>
  );
}
