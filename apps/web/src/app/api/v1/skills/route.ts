import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { authenticateApiKey, isAuthError } from "@/lib/api-key-auth";
import { skills } from "@skillshub/db/schema";
import { createSkillSchema } from "@skillshub/shared/validators";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const parsed = createSkillSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const db = getDb();

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
      repoId: body.repoId,
      isPublished: true,
    })
    .returning();

  return corsJson({ data: created }, { status: 201 });
}

export { corsOptions as OPTIONS };
