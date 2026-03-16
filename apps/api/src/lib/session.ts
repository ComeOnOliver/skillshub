import { getIronSession, type IronSession } from "iron-session";
import type { Context } from "hono";

export interface SessionData {
  userId?: string;
  username?: string;
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

export async function getSession(
  req: Request,
  res: Response
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export { sessionOptions };
