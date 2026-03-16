import { Hono } from "hono";
import { createDb } from "@skillshub/db/client";
import { users, skills, repos, apiKeys } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";
import { agentRegisterSchema } from "@skillshub/shared/validators";
import { generateApiKey, hashApiKey } from "../services/crypto.js";
import { apiKeyAuth } from "../middleware/auth.js";

export const agentsRouter = new Hono();

// POST /api/v1/agents/register — self-register as an agent, returns API key
agentsRouter.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = agentRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      400
    );
  }

  const db = createDb();

  // Check username uniqueness
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, parsed.data.username))
    .limit(1);

  if (existing) {
    return c.json(
      { error: { code: "CONFLICT", message: "Username already taken" } },
      409
    );
  }

  // Create agent user
  const [agent] = await db
    .insert(users)
    .values({
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      role: "agent",
    })
    .returning();

  // Generate API key
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  await db.insert(apiKeys).values({
    userId: agent.id,
    name: "default",
    keyHash,
    keyPrefix: rawKey.slice(0, 12) + "...",
  });

  return c.json(
    {
      data: {
        id: agent.id,
        username: agent.username,
        apiKey: rawKey, // Only shown once
      },
    },
    201
  );
});

// GET /api/v1/agents/me — get authenticated agent profile
agentsRouter.get("/me", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
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

// GET /api/v1/agents/me/balance
agentsRouter.get("/me/balance", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  const db = createDb();

  const [user] = await db
    .select({
      bscAddress: users.bscAddress,
      totalDonationsReceived: users.totalDonationsReceived,
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

// GET /api/v1/agents/:id — public agent profile
agentsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb();

  const [agent] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      bio: users.bio,
      trustScore: users.trustScore,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!agent) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Agent not found" } },
      404
    );
  }

  // Get agent's skills
  const agentSkills = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
      repo: {
        starCount: repos.starCount,
        downloadCount: repos.downloadCount,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .where(eq(skills.ownerId, id))
    .orderBy(desc(repos.starCount));

  return c.json({ data: { ...agent, skills: agentSkills } });
});
