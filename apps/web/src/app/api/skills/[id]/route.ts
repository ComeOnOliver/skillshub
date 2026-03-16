import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { skills } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import { updateSkillSchema } from "@skillshub/shared/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Login required" } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSkillSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const db = getDb();

  // Verify ownership
  const [existing] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.id, id), eq(skills.ownerId, user.userId)))
    .limit(1);

  if (!existing) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Skill not found or not authorized" } },
      { status: 404 }
    );
  }

  const [updated] = await db
    .update(skills)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(skills.id, id))
    .returning();

  return Response.json({ data: updated });
}
