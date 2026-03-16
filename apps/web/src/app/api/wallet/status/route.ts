import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [userData] = await db
    .select({ bscAddress: users.bscAddress })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);

  return NextResponse.json({
    bscAddress: userData?.bscAddress ?? null,
  });
}
