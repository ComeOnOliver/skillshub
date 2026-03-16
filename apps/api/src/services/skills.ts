import { createDb } from "@skillshub/db/client";
import { repos, stars } from "@skillshub/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function toggleStar(
  userId: string,
  repoId: string
): Promise<{ starred: boolean; starCount: number }> {
  const db = createDb();

  return await db.transaction(async (tx) => {
    // Check if already starred
    const [existing] = await tx
      .select()
      .from(stars)
      .where(and(eq(stars.userId, userId), eq(stars.repoId, repoId)))
      .limit(1);

    if (existing) {
      // Unstar
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
      // Star
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
}
