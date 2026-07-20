/** @type {import('next').NextConfig} */

// Pre-launch hardening (8c-injection-hardening): baseline security headers on every response.
// script-src and style-src both need 'unsafe-inline': Next.js's App Router streams hydration
// data through inline <script> tags on every page (verified with a headless-browser smoke test
// against the production build — a strict 'self'-only script-src broke hydration everywhere,
// React error #423), and this app renders plenty of inline `style={{...}}` attributes plus one
// static <style> block on the landing page. A nonce-based CSP (Next's documented way to drop
// 'unsafe-inline' for scripts) would need the nonce threaded through the existing auth
// middleware in lib/supabase/middleware.ts, which is deliberately fragile ("do not run other
// logic between client creation and getUser()") — worth doing as a follow-up once it can be
// tested end-to-end against a live Supabase project, which this environment's egress can't
// reach. Even with 'unsafe-inline' on scripts, this CSP still blocks loading script/object/
// frame content from any non-self origin, restricts connect-src/img-src to this app's own host
// plus the Supabase project, and denies framing entirely.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
