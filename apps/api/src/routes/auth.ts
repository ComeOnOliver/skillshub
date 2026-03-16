import { Hono } from "hono";
import { createDb } from "@skillshub/db/client";
import { users, apiKeys } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { createGitHub, getGitHubUser } from "../services/github.js";
import { generateApiKey, hashApiKey } from "../services/crypto.js";
import { createApiKeySchema } from "@skillshub/shared/validators";
import { generateState } from "arctic";
import { apiKeyAuth } from "../middleware/auth.js";

export const authRouter = new Hono();

// GET /api/v1/auth/github — redirect to GitHub OAuth
authRouter.get("/github", async (c) => {
  const github = createGitHub();
  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  // Store state in a cookie for validation
  c.header(
    "Set-Cookie",
    `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`
  );

  return c.redirect(url.toString());
});

// GET /api/v1/auth/github/callback
authRouter.get("/github/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.json(
      { error: { code: "INVALID_REQUEST", message: "Missing code or state" } },
      400
    );
  }

  const github = createGitHub();
  const tokens = await github.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();
  const ghUser = await getGitHubUser(accessToken);

  const db = createDb();

  // Find or create user
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
      })
      .returning();
  } else {
    // Update profile from GitHub
    [user] = await db
      .update(users)
      .set({
        displayName: ghUser.name,
        avatarUrl: ghUser.avatar_url,
        email: ghUser.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
  }

  // Return user data + set session info for the web app to pick up
  return c.json({
    data: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      bscAddress: user.bscAddress,
    },
  });
});

// GET /api/v1/auth/me — get current user (API key auth)
authRouter.get("/me", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      401
    );
  }

  const db = createDb();
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      bio: users.bio,
      bscAddress: users.bscAddress,
      trustScore: users.trustScore,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      404
    );
  }

  return c.json({ data: user });
});
