import { getDb } from "@/lib/db";
import { donations, users } from "@skillshub/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { toUserId, repoId, authorTxHash, platformTxHash, amount, token } =
    body;

  if (!toUserId || !repoId || !authorTxHash || !amount || !token) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(authorTxHash)) {
    return NextResponse.json(
      { error: "Invalid transaction hash" },
      { status: 400 }
    );
  }

  if (!["USDT", "USDC"].includes(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const db = getDb();

  const [donation] = await db.transaction(async (tx) => {
    const [d] = await tx
      .insert(donations)
      .values({
        fromUserId: null,
        toUserId,
        repoId,
        amount: String(amount),
        token,
        chain: "bsc",
        txHash: authorTxHash,
        status: "confirmed",
      })
      .returning();

    await tx
      .update(users)
      .set({
        totalDonationsReceived: sql`${users.totalDonationsReceived}::numeric + ${String(amount)}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, toUserId));

    return [d];
  });

  return NextResponse.json({
    donationId: donation.id,
    txHash: donation.txHash,
    status: "confirmed",
  });
}
