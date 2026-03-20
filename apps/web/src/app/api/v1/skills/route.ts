import { getDb } from "@/lib/db";
import { writeCorsJson, methodNotAllowed, writeOPTIONS, formatZodError } from "@/lib/api-cors";
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
    return writeCorsJson(
      { error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) } },
      request,
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
    return writeCorsJson(
      { error: { code: "CONFLICT", message: "A skill with this name already exists in this repo. Use PUT to update it." } },
      request,
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
    return writeCorsJson(
      { error: { code: "CONFLICT", message: "Slug already taken" } },
      request,
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

  return writeCorsJson({ data: created }, request, { status: 201 });
}

export async function GET() {
  return new Response(
    JSON.stringify({
      error: {
        code: "METHOD_NOT_ALLOWED",
        message:
          "Method not allowed. Use POST to publish a skill. For browsing, try GET /api/v1/skills/search, /api/v1/skills/trending, or /api/v1/skills/resolve. Full docs at /docs",
      },
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Allow": "POST",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
export async function PUT() { return methodNotAllowed(["POST"]); }
export async function DELETE() { return methodNotAllowed(["POST"]); }
export async function PATCH() { return methodNotAllowed(["POST"]); }

export function OPTIONS(request: Request) { return writeOPTIONS(request); }
