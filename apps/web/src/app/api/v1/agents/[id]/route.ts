import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { users, skills, repos } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Agent not found" } },
      { status: 404 }
    );
  }

  const db = getDb();

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
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Agent not found" } },
      { status: 404 }
    );
  }

  // Get agent's published skills
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

  return corsJson({ data: { ...agent, skills: agentSkills } });
}

export { corsOptions as OPTIONS };
