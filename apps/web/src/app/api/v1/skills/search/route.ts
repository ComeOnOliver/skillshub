import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions, formatZodError } from "@/lib/api-cors";
import { skills, repos, users } from "@skillshub/db/schema";
import { skillSearchSchema } from "@skillshub/shared/validators";
import { eq, desc, sql, and, arrayContains } from "drizzle-orm";

/**
 * Relevance ranking algorithm for skill search.
 *
 * When a query (q) is provided, each skill gets a composite score:
 *
 *   relevance_score = text_match + quality_score + popularity_score
 *
 * 1. TEXT MATCH (0–50 points) — How well the query matches
 *    - Exact name match:           50
 *    - Name starts with query:     40
 *    - Name contains query:        30
 *    - Description contains query: 10
 *
 * 2. QUALITY (0–30 points) — Is the skill well-maintained?
 *    - Readme length: log2(chars) normalized to 0–15
 *      (37 bytes = 0, 10K+ = 12, 50K = 15)
 *    - Has tags: +5
 *    - Has description > 50 chars: +5
 *    - Tag count bonus: min(tag_count, 5) points (0–5)
 *
 * 3. POPULARITY (0–20 points) — Community signal
 *    - GitHub stars: log10(stars) * 5, capped at 15
 *      (100★ = 10, 1K★ = 15, 10K★ = 15)
 *    - Platform likes (repo star_count from SkillsHub): +5 if > 0
 *
 * When no query, falls back to sort param (stars/downloads/recent).
 */
function buildRelevanceOrder(q: string) {
  const lowerQ = q.toLowerCase();
  return sql`(
    -- Text match score (0-50)
    CASE
      WHEN lower(${skills.name}) = ${lowerQ} THEN 50
      WHEN lower(${skills.name}) LIKE ${lowerQ + '%'} THEN 40
      WHEN lower(${skills.name}) LIKE ${'%' + lowerQ + '%'} THEN 30
      ELSE 10
    END
    -- Quality score (0-30)
    + LEAST(15, GREATEST(0, (ln(GREATEST(length(COALESCE(${skills.readme}, '')), 1)) / ln(2)) - 5))::int
    + CASE WHEN array_length(${skills.tags}, 1) > 0 THEN 5 ELSE 0 END
    + CASE WHEN length(COALESCE(${skills.description}, '')) > 50 THEN 5 ELSE 0 END
    + LEAST(5, COALESCE(array_length(${skills.tags}, 1), 0))
    -- Popularity score (0-20)
    + LEAST(15, (log(GREATEST(${repos.starCount}, 1)) * 5)::int)
  ) DESC`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const parsed = skillSearchSchema.safeParse(query);

  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) } },
      { status: 400 }
    );
  }

  const { q, tags, owner, repo, sort, page, limit } = parsed.data;
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

  if (owner) {
    conditions.push(eq(repos.githubOwner, owner));
  }

  if (repo) {
    conditions.push(eq(repos.githubRepoName, repo));
  }

  // Use relevance ranking when there's a search query and sort=stars (default)
  // Otherwise respect the explicit sort param
  const orderBy =
    sort === "downloads"
      ? desc(repos.downloadCount)
      : sort === "recent"
        ? desc(skills.createdAt)
        : q
          ? buildRelevanceOrder(q)
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
