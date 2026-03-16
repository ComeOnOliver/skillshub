import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { skills, repos, users } from "@skillshub/db/schema";
import { skillSearchSchema } from "@skillshub/shared/validators";
import { eq, desc, sql, and, arrayContains } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const parsed = skillSearchSchema.safeParse(query);

  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { q, tags, sort, page, limit } = parsed.data;
  const db = getDb();
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
      .innerJoin(repos, eq(skills.repoId, repos.id))
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return corsJson({
    data,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  });
}

export { corsOptions as OPTIONS };
