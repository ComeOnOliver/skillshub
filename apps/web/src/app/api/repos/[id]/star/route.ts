import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { stars, repos } from "@skillshub/db/schema";
import { eq, and, sql } from "drizzle-orm";

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

  const { id: repoId } = await params;
  const db = getDb();

  const result = await db.transaction(async (tx) => {
    // Check if already starred
    const [existing] = await tx
      .select()
      .from(stars)
      .where(and(eq(stars.userId, user.userId), eq(stars.repoId, repoId)))
      .limit(1);

    if (existing) {
      // Unstar
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
      // Star
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
