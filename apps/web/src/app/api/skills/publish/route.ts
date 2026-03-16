import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { skills, repos } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import { createSkillSchema } from "@skillshub/shared/validators";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Login required" } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = createSkillSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const db = getDb();

  // Resolve repoId: use provided repoId or create a default repo for the user
  let repoId: string = body.repoId;

  if (!repoId) {
    // Find or create a default repo for this user
    const defaultRepoName = user.username;
    const [existingRepo] = await db
      .select({ id: repos.id })
      .from(repos)
      .where(and(eq(repos.ownerId, user.userId), eq(repos.name, defaultRepoName)))
      .limit(1);

    if (existingRepo) {
      repoId = existingRepo.id;
    } else {
      const [newRepo] = await db
        .insert(repos)
        .values({
          ownerId: user.userId,
          name: defaultRepoName,
          displayName: user.displayName ?? user.username,
          description: `Skills by ${user.username}`,
        })
        .returning({ id: repos.id });
      repoId = newRepo.id;
    }
  }

  // Check slug uniqueness per owner
  const [existing] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.slug, parsed.data.slug), eq(skills.ownerId, user.userId)))
    .limit(1);

  if (existing) {
    return Response.json(
      { error: { code: "CONFLICT", message: "Slug already taken" } },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(skills)
    .values({
      ...parsed.data,
      ownerId: user.userId,
      repoId,
      isPublished: true,
    })
    .returning();

  return Response.json({ data: created }, { status: 201 });
}
