import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions, formatZodError } from "@/lib/api-cors";
import { authenticateApiKey, isAuthError } from "@/lib/api-key-auth";
import { skills, repos, users } from "@skillshub/db/schema";
import { updateSkillSchema } from "@skillshub/shared/validators";
import { eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  const db = getDb();

  const [skill] = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      readme: skills.readme,
      manifest: skills.manifest,
      tags: skills.tags,
      isPublished: skills.isPublished,
      fetchCount: skills.fetchCount,
      feedbackCount: skills.feedbackCount,
      helpfulRate: skills.helpfulRate,
      trustScore: skills.trustScore,
      createdAt: skills.createdAt,
      updatedAt: skills.updatedAt,
      repo: {
        id: repos.id,
        starCount: repos.starCount,
        downloadCount: repos.downloadCount,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
        weeklyInstalls: repos.weeklyInstalls,
      },
      owner: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  return corsJson({ data: skill });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = updateSkillSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) } },
      { status: 400 }
    );
  }

  const db = getDb();

  const [skill] = await db
    .select({ ownerId: skills.ownerId })
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  if (skill.ownerId !== auth.userId) {
    return corsJson(
      { error: { code: "FORBIDDEN", message: "Not the owner" } },
      { status: 403 }
    );
  }

  const [updated] = await db
    .update(skills)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(skills.id, id))
    .returning();

  return corsJson({ data: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  const db = getDb();

  const [skill] = await db
    .select({ ownerId: skills.ownerId })
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  if (skill.ownerId !== auth.userId) {
    return corsJson(
      { error: { code: "FORBIDDEN", message: "Not the owner" } },
      { status: 403 }
    );
  }

  await db.delete(skills).where(eq(skills.id, id));

  return corsJson({ data: { id, deleted: true } });
}

export { corsOptions as OPTIONS };
