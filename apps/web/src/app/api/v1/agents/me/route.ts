import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { authenticateApiKey, isAuthError } from "@/lib/api-key-auth";
import { users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const db = getDb();

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      bio: users.bio,
      bscAddress: users.bscAddress,
      trustScore: users.trustScore,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!user) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  return corsJson({ data: user });
}

export { corsOptions as OPTIONS };
