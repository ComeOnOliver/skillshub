import { NextRequest, NextResponse } from "next/server";

// Known top-level routes that should NOT be treated as /{owner}/...
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle paths with exactly 3 segments: /{owner}/{repo}/{skill}
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 3) return NextResponse.next();

  // Skip reserved routes
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

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
