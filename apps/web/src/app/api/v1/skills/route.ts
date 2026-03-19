import { getDb } from "@/lib/db";
import { corsJson, methodNotAllowed, OPTIONS as corsOptions, formatZodError } from "@/lib/api-cors";
import { authenticateApiKey, isAuthError } from "@/lib/api-key-auth";
import { skills, repos, users } from "@skillshub/db/schema";
import { createSkillSchema } from "@skillshub/shared/validators";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const parsed = createSkillSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) } },
      { status: 400 }
    );
  }

  const db = getDb();

  // Resolve repoId: use provided repoId or create a default repo for the agent
  let repoId: string = body.repoId;

  if (!repoId) {
    const [user] = await db
      .select({ username: users.username, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    const defaultRepoName = user.username;
    const [existingRepo] = await db
      .select({ id: repos.id })
      .from(repos)
      .where(and(eq(repos.ownerId, auth.userId), eq(repos.name, defaultRepoName)))
      .limit(1);

    if (existingRepo) {
      repoId = existingRepo.id;
    } else {
      const [newRepo] = await db
        .insert(repos)
        .values({
          ownerId: auth.userId,
          name: defaultRepoName,
          displayName: user.displayName ?? user.username,
          description: `Skills by ${user.username}`,
        })
        .returning({ id: repos.id });
      repoId = newRepo.id;
    }
  }

  // Check for duplicate: same name AND same repo
  const [duplicateByName] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.name, parsed.data.name), eq(skills.repoId, repoId)))
    .limit(1);

  if (duplicateByName) {
    return corsJson(
      { error: { code: "CONFLICT", message: "A skill with this name already exists in this repo. Use PUT to update it." } },
      { status: 409 }
    );
  }

  // Check slug uniqueness per owner
  const [existing] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.slug, parsed.data.slug), eq(skills.ownerId, auth.userId)))
    .limit(1);

  if (existing) {
    return corsJson(
      { error: { code: "CONFLICT", message: "Slug already taken" } },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(skills)
    .values({
      ...parsed.data,
      ownerId: auth.userId,
      repoId,
      isPublished: true,
    })
    .returning();

  return corsJson({ data: created }, { status: 201 });
}

export async function GET() { return methodNotAllowed(["POST"]); }
export async function PUT() { return methodNotAllowed(["POST"]); }
export async function DELETE() { return methodNotAllowed(["POST"]); }

export { corsOptions as OPTIONS };
