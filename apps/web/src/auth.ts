import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createDb } from "@skillshub/db/client";
import {
  users,
  accounts,
  verificationTokens,
} from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { encryptToken } from "@/lib/crypto";

/**
 * Auth.js expects the users table to have columns named `name` and `image`,
 * but our schema uses `displayName` and `avatarUrl`. We create a view-table
 * definition that maps Auth.js column names to our physical columns. This is
 * only used by the DrizzleAdapter — the rest of the app uses the real `users`
 * table definition.
 */
import { pgTable, text, timestamp, uuid, boolean, integer, numeric, uniqueIndex } from "drizzle-orm/pg-core";

const authUsersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("display_name"),
    email: text("email"),
    emailVerified: timestamp("email_verified"),
    image: text("avatar_url"),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

const db = createDb();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsersTable,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          // Keep the same scopes as before: email + full repo access for
          // private repo imports.
          scope: "user:email repo",
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "SkillsHub <noreply@skillshub.wtf>",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return true;

      // For GitHub sign-ins, populate our custom columns that the adapter
      // doesn't know about (username, githubId, role, encrypted token).
      if (account.provider === "github" && profile && user.id) {
        const ghProfile = profile as unknown as {
          id: number;
          login: string;
          bio?: string | null;
        };

        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        const updates: Record<string, unknown> = {
          githubId: String(ghProfile.id),
          displayName: user.name,
          avatarUrl: user.image,
          updatedAt: new Date(),
        };

        // Encrypt and store the GitHub access token for repo imports
        if (account.access_token) {
          updates.githubAccessToken = encryptToken(account.access_token);
        }

        if (existingUser.length > 0) {
          await db.update(users).set(updates).where(eq(users.id, user.id));
        } else {
          // New user — set username and role
          await db
            .update(users)
            .set({
              ...updates,
              username: ghProfile.login,
              bio: ghProfile.bio ?? null,
              role: "human",
            })
            .where(eq(users.id, user.id));
        }
      }

      // For Google sign-ins, set a username from email if not already set
      if (account.provider === "google" && user.id) {
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (existing && !existing.username) {
          const emailPrefix = user.email?.split("@")[0] ?? `user-${user.id.slice(0, 8)}`;
          await db
            .update(users)
            .set({
              username: emailPrefix,
              displayName: user.name,
              avatarUrl: user.image,
              role: "human",
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
        }
      }

      // For email magic link sign-ins, set a username from email
      if (account.provider === "resend" && user.id) {
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (existing && !existing.username) {
          const emailPrefix = user.email?.split("@")[0] ?? `user-${user.id.slice(0, 8)}`;
          await db
            .update(users)
            .set({
              username: emailPrefix,
              role: "human",
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // On initial sign-in, populate the JWT with our custom fields
      if (user?.id) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (dbUser) {
          token.userId = dbUser.id;
          token.username = dbUser.username;
          token.displayName = dbUser.displayName;
          token.avatarUrl = dbUser.avatarUrl;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Expose our custom fields on the session object
      if (token) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.displayName = token.displayName as string | undefined;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    },
  },
});

// Extend the Auth.js types to include our custom session fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  }
}

