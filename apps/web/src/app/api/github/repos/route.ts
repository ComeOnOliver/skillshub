import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { listUserRepos, GitHubApiError } from "@/lib/github";
import { users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Login required" } },
      { status: 401 }
    );
  }

  const db = getDb();
  const [dbUser] = await db
    .select({ githubAccessToken: users.githubAccessToken })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);

  if (!dbUser?.githubAccessToken) {
    return Response.json(
      { error: { code: "NO_TOKEN", message: "GitHub access token not found. Please re-login to grant repo access." } },
      { status: 403 }
    );
  }

  try {
    // Fix 1: Decrypt token before use
    const token = decryptToken(dbUser.githubAccessToken);
    const repos = await listUserRepos(token);

    return Response.json({ data: repos });
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

    console.error("Failed to fetch repos:", error);
    return Response.json(
      { error: { code: "FETCH_ERROR", message: "Failed to fetch GitHub repos" } },
      { status: 500 }
    );
  }
}
