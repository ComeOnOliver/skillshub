import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { stars, repos, skills } from "@skillshub/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Legacy route — stars are now on repos, but this route accepts a skill ID
// and stars the associated repo for backward compatibility
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Login required" } },
      { status: 401 }
    );
  }

  const { id: skillId } = await params;
  const db = getDb();

  // Look up the repo for this skill
  const [skill] = await db
    .select({ repoId: skills.repoId })
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!skill) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  const repoId = skill.repoId;

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(stars)
      .where(and(eq(stars.userId, user.userId), eq(stars.repoId, repoId)))
      .limit(1);

    if (existing) {
      await tx
        .delete(stars)
        .where(and(eq(stars.userId, user.userId), eq(stars.repoId, repoId)));
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
      await tx.insert(stars).values({ userId: user.userId, repoId });
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

  return Response.json({ data: result });
}
