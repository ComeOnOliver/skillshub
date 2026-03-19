import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { scanRepoForSkills, GitHubApiError } from "@/lib/github";
import { rateLimit, writeLimiter } from "@/lib/rate-limit";
import { users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Fix 4: Input validation with regex for GitHub names
const githubNameRegex = /^[a-zA-Z0-9._-]+$/;

const scanSchema = z.object({
  owner: z
    .string()
    .min(1)
    .max(100)
    .regex(githubNameRegex, "Invalid GitHub owner name"),
  repo: z
    .string()
    .min(1)
    .max(100)
    .regex(githubNameRegex, "Invalid GitHub repo name"),
});

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Login required" } },
      { status: 401 }
    );
  }

  // Fix 9: Rate limiting — max 20 scans per minute (write tier)
  const rl = await rateLimit(`user:${user.userId}:scan`, writeLimiter);
  if (!rl.success) {
    return Response.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { owner, repo } = parsed.data;

  const db = getDb();
  const [dbUser] = await db
    .select({ githubAccessToken: users.githubAccessToken })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);

  if (!dbUser?.githubAccessToken) {
    return Response.json(
      { error: { code: "NO_TOKEN", message: "GitHub access token not found. Please re-login." } },
      { status: 403 }
    );
  }

  try {
    // Fix 1: Decrypt token before use
    const token = decryptToken(dbUser.githubAccessToken);

    // Rec 1: Use extracted GitHub service
    const result = await scanRepoForSkills(token, owner, repo);

    return Response.json({ data: result });
  } catch (error) {
    // Fix 5: Token revocation handling
    if (error instanceof GitHubApiError && error.statusCode === 401) {
      await db
        .update(users)
        .set({ githubAccessToken: null, updatedAt: new Date() })
        .where(eq(users.id, user.userId));

      return Response.json(
        { error: { code: "TOKEN_REVOKED", message: "GitHub access expired. Please log in again." } },
        { status: 401 }
      );
    }

    if (error instanceof GitHubApiError) {
      return Response.json(
        { error: { code: error.errorCode, message: error.message } },
        { status: error.statusCode >= 500 ? 502 : error.statusCode }
      );
    }

    console.error("Scan error:", error);
    return Response.json(
      { error: { code: "SCAN_ERROR", message: "Failed to scan repository" } },
      { status: 500 }
    );
  }
}
