import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const db = getDb();

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

  return corsJson({ data });
}

export { corsOptions as OPTIONS };
