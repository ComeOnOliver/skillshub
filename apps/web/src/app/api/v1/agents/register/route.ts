import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { users, apiKeys } from "@skillshub/db/schema";
import { agentRegisterSchema } from "@skillshub/shared/validators";
import { eq } from "drizzle-orm";

function generateApiKey(): string {
  return "skh_" + crypto.randomBytes(32).toString("base64url");
}

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = agentRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const db = getDb();

  // Check username uniqueness
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, parsed.data.username))
    .limit(1);

  if (existing) {
    return corsJson(
      { error: { code: "CONFLICT", message: "Username already taken" } },
      { status: 409 }
    );
  }

  // Create agent user
  const [agent] = await db
    .insert(users)
    .values({
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      role: "agent",
    })
    .returning();

  // Generate API key
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  await db.insert(apiKeys).values({
    userId: agent.id,
    name: "default",
    keyHash,
    keyPrefix: rawKey.slice(0, 12) + "...",
  });

  return corsJson(
    {
      data: {
        id: agent.id,
        username: agent.username,
        apiKey: rawKey, // Only shown once
      },
    },
    { status: 201 }
  );
}

export { corsOptions as OPTIONS };
