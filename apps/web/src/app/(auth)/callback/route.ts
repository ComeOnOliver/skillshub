import { GitHub } from "arctic";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { encryptToken } from "@/lib/crypto";
import { createDb } from "@skillshub/db/client";
import { users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return Response.redirect(new URL("/login?error=invalid_state", request.url));
  }

  try {
    const github = new GitHub(
      process.env.GITHUB_CLIENT_ID ?? "",
      process.env.GITHUB_CLIENT_SECRET ?? "",
      process.env.GITHUB_REDIRECT_URI ?? "http://localhost:3000/callback"
    );

    const tokens = await github.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();

    const ghRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const ghUser: GitHubUser = await ghRes.json();

    // Fix 1: Encrypt the GitHub token before storing
    const encryptedToken = encryptToken(accessToken);

    const db = createDb();

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.githubId, String(ghUser.id)))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          githubId: String(ghUser.id),
          username: ghUser.login,
          displayName: ghUser.name,
          email: ghUser.email,
          avatarUrl: ghUser.avatar_url,
          bio: ghUser.bio,
          role: "human",
          githubAccessToken: encryptedToken,
        })
        .returning();
    } else {
      [user] = await db
        .update(users)
        .set({
          displayName: ghUser.name,
          avatarUrl: ghUser.avatar_url,
          email: ghUser.email,
          githubAccessToken: encryptedToken,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
    }

    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.displayName = user.displayName ?? undefined;
    session.avatarUrl = user.avatarUrl ?? undefined;
    await session.save();

    cookieStore.delete("github_oauth_state");

    return Response.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("OAuth error:", error);
    return Response.redirect(new URL("/login?error=oauth_failed", request.url));
  }
}
