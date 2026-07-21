import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the paths that do NOT require authentication.
// `/guest` and `/guest-join` are the guest entry points, and `/join` is the legacy invite
// link that redirects into them — a guest has no account, so requiring a token here would
// make guest access impossible to reach at all.
const publicRoutes = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/guest",
  "/join",
];

// Routes a guest may enter once they've joined an event. They authenticate with an
// X-Guest-Token held in sessionStorage, which this middleware can't read — so the join
// flow also sets a plain `isGuest` flag cookie purely so this check can see them.
const guestRoutes = ["/agm/live", "/events/live"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is in our list of public routes
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check for the refreshToken or accessToken to determine auth status
  const hasToken = !!request.cookies.get("accessToken");

  const isGuestAllowed =
    !!request.cookies.get("isGuest") &&
    guestRoutes.some((route) => pathname.startsWith(route));

  // If trying to access a protected route without a token, redirect to login
  if (!isPublicRoute && !hasToken && !isGuestAllowed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login page WITH a token, redirect to dashboard/home
  if (isPublicRoute && hasToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  // `.html` covers /zoom-meeting.html — a static file in public/ that the Zoom SDK loads
  // in an iframe. Without it the guard redirected that iframe to /login, so the meeting
  // sat on "Connecting to the meeting…" forever for anyone without an accessToken.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.svg|.*\\.gif|.*\\.html).*)",
  ],
};
