import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("SESSION_SECRET environment variable is required");

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

export async function getUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return {
    userId: session.userId,
    username: session.username!,
    displayName: session.displayName,
    avatarUrl: session.avatarUrl,
  };
}
