import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { authenticateApiKey, isAuthError } from "@/lib/api-key-auth";
import { skills, repos, stars } from "@skillshub/db/schema";
import { eq, and, sql } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const { id: skillId } = await params;
  if (!UUID_RE.test(skillId)) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  const db = getDb();

  const [skill] = await db
    .select({ repoId: skills.repoId })
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!skill) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  const repoId = skill.repoId;
  const userId = auth.userId;

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(stars)
      .where(and(eq(stars.userId, userId), eq(stars.repoId, repoId)))
      .limit(1);

    if (existing) {
      await tx
        .delete(stars)
        .where(and(eq(stars.userId, userId), eq(stars.repoId, repoId)));
      await tx
        .update(repos)
        .set({ starCount: sql`${repos.starCount} - 1` })
        .where(eq(repos.id, repoId));
      const [repo] = await tx
        .select({ starCount: repos.starCount })
        .from(repos)
        .where(eq(repos.id, repoId));
      return { starred: false, starCount: repo.starCount };
    } else {
      await tx.insert(stars).values({ userId, repoId });
      await tx
        .update(repos)
        .set({ starCount: sql`${repos.starCount} + 1` })
        .where(eq(repos.id, repoId));
      const [repo] = await tx
        .select({ starCount: repos.starCount })
        .from(repos)
        .where(eq(repos.id, repoId));
      return { starred: true, starCount: repo.starCount };
    }
  });

  return corsJson({ data: result });
}

export { corsOptions as OPTIONS };
