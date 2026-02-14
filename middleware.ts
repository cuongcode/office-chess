import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Paths that require authentication
    // For now, let's protect the home page based on the requirement "PROTECTED GAME PAGE"
    // But wait, the prompt says "If authenticated: show chess game" on /app/page.tsx check. 
    // Middleware is a stronger guard. Let's protect everything except auth routes and public assets.

    // Actually, the prompt says:
    // "Export matcher to include all routes except: /auth/*, /api/auth/*, /_next/*, /favicon.ico"
    // "In middleware function: Get token... If no token and accessing protected route: redirect to /auth/login"

    // So we protect everything by default unless excluded.

    if (token) {
        // If user is logged in and tries to access auth pages, redirect to home
        if (pathname.startsWith("/auth")) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    } else {
        // If user is not logged in and tries to access protected pages (everything else)
        // We need to be careful not to redirect on public assets/api if matcher fails, but matcher handles that.
        // However, we should double check inside here too if logic requires.
        // The matcher handles the exclusion, so any request hitting here IS a candidate for protection 
        // UNLESS it is one of the excluded paths if we negated them in matcher, OR if we included specific paths.

        // The prompt requests "matcher to include all routes except...". 
        // So any route hitting this middleware that is NOT in the exclusion list is "protected".
        // But wait, /auth/* IS in the exclusion list for the matcher? 
        // "Export matcher to include all routes except: /auth/*..."
        // IF the matcher excludes /auth/*, then the middleware won't run on /auth/*, so we can't redirect logged-in users away from /auth/* inside middleware.

        // Correction: We usually want middleware to run on auth pages to redirect LOGGED IN users away. 
        // So we should INCLUDE /auth/* in matcher, but perform different logic.

        // Let's interpret "except" as "don't run logic that requires auth", or maybe the user meant "matcher should match everything, but exclude static files".
        // Let's follow standard NextJS middleware patterns.

        // Strategy: Match everything.
        // If path is public (auth, api/auth, static), allow.
        // If path is protected AND no token, redirect to login.
        // If path is auth AND token, redirect to home.

        // But the prompt specifically said: "Export matcher to include all routes except: /auth/*, /api/auth/*..."
        // If I exclude /auth/* from matcher, I can't do the "If token exists and accessing /auth/login... redirect to /" part EFFICIENTLY in middleware (it won't run).
        // I will deviate slightly to make it robust: Match everything except internal next/static/image/favicon.
        // Then handle logic inside.

        // WAIT, strict instruction: "Export matcher to include all routes except: /auth/*..."
        // If I follow this strictly, middleware runs on `/` but not `/auth/login`. 
        // Then `/auth/login` page needs `getServerSideProps` or `useSession` client-side redirect for logged-in users.
        // The prompt says "If token exists and accessing /auth/login or /auth/register: redirect to /". This implies middleware SHOULD run on these.
        // So the matcher instruction might be slightly conflicting or implies "protect all routes EXCEPT these", but the middleware code itself handles the redirect logic.

        // I will use a matcher that excludes static files, and handles the logic for both protected and auth routes.
    }

    const isAuthPage = pathname.startsWith("/auth");

    if (isAuthPage) {
        if (token) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        // If not token, and not auth page (and not excluded by matcher), redirect to login
        // We need to ensure we don't redirect for public assets if they slip through
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth api routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc if any, but usually handled by _next or specific folder)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
