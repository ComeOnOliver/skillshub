import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export interface SessionData {
  userId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

// ── Iron-session (legacy fallback) ──────────────────────────────────────────

const secret = process.env.SESSION_SECRET ?? "build-placeholder-not-for-production";
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.warn("WARNING: SESSION_SECRET not set. Sessions will not work.");
}

const sessionOptions = {
  password: secret,
  cookieName: "skillshub_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// ── Unified getUser() ───────────────────────────────────────────────────────
// Tries Auth.js first, falls back to iron-session for existing sessions.

export async function getUser() {
  // 1. Auth.js (primary)
  const session = await auth();
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      username: session.user.username,
      displayName: session.user.displayName ?? session.user.name ?? undefined,
      avatarUrl: session.user.avatarUrl ?? session.user.image ?? undefined,
    };
  }

  // 2. Iron-session (fallback for existing sessions)
  const legacy = await getSession();
  if (legacy.userId) {
    return {
      userId: legacy.userId,
      username: legacy.username!,
      displayName: legacy.displayName,
      avatarUrl: legacy.avatarUrl,
    };
  }

  return null;
}
