import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/partner(.*)",
  "/bank(.*)",
  "/admin(.*)",
  "/api/trpc/user(.*)",
  "/api/trpc/matching.updateBankRule(.*)",
]);

const isApplyRoute = createRouteMatcher(["/apply(.*)"]);

// Simple in-memory rate limiter for apply submissions
// In production, use Redis via @upstash/ratelimit
const applyRateLimit = new Map<string, { count: number; resetAt: number }>();
const DOC_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  maxCount: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxCount) {
    return false;
  }

  entry.count++;
  return true;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") ?? req.ip ?? "unknown";

  // Rate limit /apply submissions: 10/hour/IP
  if (
    isApplyRoute(req) &&
    req.method === "POST" &&
    req.nextUrl.pathname.includes("/api/trpc/application.createDraft")
  ) {
    const allowed = checkRateLimit(applyRateLimit, ip, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many application submissions. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Rate limit document uploads: 50/hour/applicant
  if (
    req.nextUrl.pathname.includes("/api/trpc/document.getUploadUrl") &&
    req.method === "POST"
  ) {
    const userId = (await auth()).userId ?? ip;
    const allowed = checkRateLimit(DOC_RATE_LIMIT, userId, 50, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Upload limit reached. Please try again in an hour." },
        { status: 429 }
      );
    }
  }

  // Protect portal routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
