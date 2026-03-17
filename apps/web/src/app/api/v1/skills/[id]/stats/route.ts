import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { skills } from "@skillshub/db/schema";
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
      fetchCount: skills.fetchCount,
      feedbackCount: skills.feedbackCount,
      helpfulRate: skills.helpfulRate,
      trustScore: skills.trustScore,
    })
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  return corsJson({
    fetchCount: skill.fetchCount,
    feedbackCount: skill.feedbackCount,
    helpfulRate: skill.helpfulRate !== null ? Number(skill.helpfulRate) : null,
    trustScore: Number(skill.trustScore),
  });
}

export { corsOptions as OPTIONS };
