import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// PWA assets must be fetchable without auth: the service worker, manifest, and offline
// fallback are requested by the browser before/independently of any session.
const PUBLIC_PATHS = ["/login", "/auth", "/sw.js", "/manifest.webmanifest", "/offline", "/icon.svg"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session if needed. Do not run other logic between client
  // creation and getUser() — it can cause random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The root path "/" is public (it serves the landing page to logged-out visitors and
  // redirects signed-in users to /dashboard in the page itself). Matched exactly so it
  // doesn't turn every route public the way a startsWith("/") would.
  const isPublic =
    request.nextUrl.pathname === "/" ||
    PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
