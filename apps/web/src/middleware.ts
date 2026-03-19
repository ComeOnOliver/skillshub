import { NextRequest, NextResponse } from "next/server";
import {
  rateLimit,
  getIdentifier,
  readLimiter,
  writeLimiter,
  registerLimiter,
} from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Body size limit (100 KB)
// ---------------------------------------------------------------------------

const MAX_BODY_BYTES = 100 * 1024; // 100 KB

// ---------------------------------------------------------------------------
// Known top-level routes that should NOT be treated as /{owner}/...
// ---------------------------------------------------------------------------

const RESERVED_PREFIXES = [
  "skills",
  "dashboard",
  "api",
  "agents",
  "_next",
  "favicon.ico",
  "login",
  "callback",
];

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Rate limiting & body size: only for /api/v1/* -------------------
  if (pathname.startsWith("/api/v1/") || pathname === "/api/v1") {
    // Body size check (POST / PUT / DELETE only)
    if (["POST", "PUT", "DELETE"].includes(request.method)) {
      const contentLength = request.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
        return NextResponse.json(
          {
            error: {
              code: "PAYLOAD_TOO_LARGE",
              message: `Request body exceeds ${Math.round(MAX_BODY_BYTES / 1024)}KB limit`,
            },
          },
          { status: 413 },
        );
      }
    }

    // Choose limiter based on endpoint / method
    const limiterFn = selectLimiter(pathname, request.method);
    const identifier = getIdentifier(request);

    const result = await rateLimit(identifier, limiterFn);

    // Build rate limit headers
    const rateLimitHeaders: Record<string, string> = {};
    if (result.limit) {
      rateLimitHeaders["X-RateLimit-Limit"] = String(result.limit);
      rateLimitHeaders["X-RateLimit-Remaining"] = String(result.remaining);
      rateLimitHeaders["X-RateLimit-Reset"] = String(Math.floor(result.reset / 1000));
    }

    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Try again later.",
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Retry-After": String(retryAfter),
          },
        },
      );
    }

    // Pass through – attach rate limit headers to the response
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // ---- Vanity URL rewrite: /{owner}/{repo}/{skill} → raw skill API ----
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 3) return NextResponse.next();
  if (RESERVED_PREFIXES.includes(segments[0])) return NextResponse.next();

  const accept = request.headers.get("accept") || "";
  const format = request.nextUrl.searchParams.get("format");

  if (accept.includes("text/markdown") || format === "md") {
    const [owner, repo, skill] = segments;
    const url = request.nextUrl.clone();
    url.pathname = `/api/raw-skill/${owner}/${repo}/${skill}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Limiter selection
// ---------------------------------------------------------------------------

function selectLimiter(pathname: string, method: string) {
  // Registration endpoint always uses the strict register limiter
  if (pathname.startsWith("/api/v1/agents/register")) {
    return registerLimiter;
  }
  // Write methods use the write limiter
  if (["POST", "PUT", "DELETE"].includes(method)) {
    return writeLimiter;
  }
  // Everything else is a read
  return readLimiter;
}

// ---------------------------------------------------------------------------
// Matcher
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
