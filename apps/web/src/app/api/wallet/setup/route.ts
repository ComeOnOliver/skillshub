import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { address } = body;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid BSC address" },
      { status: 400 }
    );
  }

  const db = getDb();

  await db
    .update(users)
    .set({
      bscAddress: address,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.userId));

  return NextResponse.json({ success: true, address });
}
