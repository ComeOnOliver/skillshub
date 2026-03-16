import { Hono } from "hono";
import { createDb } from "@skillshub/db/client";
import { skills, repos, users } from "@skillshub/db/schema";
import {
  skillSearchSchema,
  createSkillSchema,
  updateSkillSchema,
} from "@skillshub/shared/validators";
import { eq, desc, sql, and, arrayContains } from "drizzle-orm";
import { apiKeyAuth } from "../middleware/auth.js";
import { toggleStar } from "../services/skills.js";

export const skillsRouter = new Hono();

// GET /api/v1/skills/search?q=&tags=&sort=&page=&limit=
skillsRouter.get("/search", async (c) => {
  const parsed = skillSearchSchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      400
    );
  }

  const { q, tags, sort, page, limit } = parsed.data;
  const db = createDb();
  const offset = (page - 1) * limit;

  const conditions = [eq(skills.isPublished, true)];

  if (q) {
    conditions.push(
      sql`(${skills.name} ILIKE ${`%${q}%`} OR ${skills.description} ILIKE ${`%${q}%`})`
    );
  }

  if (tags && tags.length > 0) {
    conditions.push(arrayContains(skills.tags, tags));
  }

  const orderBy =
    sort === "downloads"
      ? desc(repos.downloadCount)
      : sort === "recent"
        ? desc(skills.createdAt)
        : desc(repos.starCount);

  const where = and(...conditions);

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: skills.id,
        slug: skills.slug,
        name: skills.name,
        description: skills.description,
        tags: skills.tags,
        createdAt: skills.createdAt,
        repo: {
          id: repos.id,
          starCount: repos.starCount,
          downloadCount: repos.downloadCount,
          githubOwner: repos.githubOwner,
          githubRepoName: repos.githubRepoName,
        },
        owner: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(skills)
      .innerJoin(repos, eq(skills.repoId, repos.id))
      .innerJoin(users, eq(skills.ownerId, users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(skills)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return c.json({
    data,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  });
});

// GET /api/v1/skills/trending
skillsRouter.get("/trending", async (c) => {
  const db = createDb();

  const data = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
      createdAt: skills.createdAt,
      repo: {
        id: repos.id,
        starCount: repos.starCount,
        downloadCount: repos.downloadCount,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
      },
      owner: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(eq(skills.isPublished, true))
    .orderBy(desc(repos.starCount), desc(skills.createdAt))
    .limit(20);

  return c.json({ data });
});

// GET /api/v1/skills/:id
skillsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb();

  const [skill] = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      readme: skills.readme,
      manifest: skills.manifest,
      tags: skills.tags,
      isPublished: skills.isPublished,
      createdAt: skills.createdAt,
      updatedAt: skills.updatedAt,
      repo: {
        id: repos.id,
        starCount: repos.starCount,
        downloadCount: repos.downloadCount,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
        weeklyInstalls: repos.weeklyInstalls,
      },
      owner: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      404
    );
  }

  return c.json({ data: skill });
});

// POST /api/v1/skills — create a new skill (auth required)
skillsRouter.post("/", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const parsed = createSkillSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      400
    );
  }

  const db = createDb();

  // Check slug uniqueness per owner
  const [existing] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.slug, parsed.data.slug), eq(skills.ownerId, userId)))
    .limit(1);

  if (existing) {
    return c.json(
      { error: { code: "CONFLICT", message: "Slug already taken" } },
      409
    );
  }

  const [created] = await db
    .insert(skills)
    .values({
      ...parsed.data,
      ownerId: userId,
      repoId: body.repoId,
      isPublished: true,
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PUT /api/v1/skills/:id — update a skill (owner only)
skillsRouter.put("/:id", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateSkillSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      400
    );
  }

  const db = createDb();

  // Verify ownership
  const [skill] = await db
    .select({ ownerId: skills.ownerId })
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      404
    );
  }

  if (skill.ownerId !== userId) {
    return c.json(
      { error: { code: "FORBIDDEN", message: "Not the owner" } },
      403
    );
  }

  const [updated] = await db
    .update(skills)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(skills.id, id))
    .returning();

  return c.json({ data: updated });
});

// DELETE /api/v1/skills/:id — delete a skill (owner only)
skillsRouter.delete("/:id", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const db = createDb();

  const [skill] = await db
    .select({ ownerId: skills.ownerId })
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      404
    );
  }

  if (skill.ownerId !== userId) {
    return c.json(
      { error: { code: "FORBIDDEN", message: "Not the owner" } },
      403
    );
  }

  await db.delete(skills).where(eq(skills.id, id));

  return c.json({ data: { id, deleted: true } });
});

// POST /api/v1/skills/:id/star — toggle star (on the skill's repo)
skillsRouter.post("/:id/star", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  const skillId = c.req.param("id");
  const db = createDb();

  // Look up the repo for this skill
  const [skill] = await db
    .select({ repoId: skills.repoId })
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!skill) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      404
    );
  }

  const result = await toggleStar(userId, skill.repoId);

  return c.json({ data: result });
});
