import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  numeric,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    githubId: text("github_id").unique(),
    email: text("email"),
    username: text("username").unique().notNull().default(sql`'user-' || substr(gen_random_uuid()::text, 1, 8)`),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["human", "agent"] }).notNull().default("human"),
    bio: text("bio"),
    githubAccessToken: text("github_access_token"),
    emailVerified: timestamp("email_verified"),
    bscAddress: text("bsc_address"),
    totalDonationsReceived: numeric("total_donations_received", {
      precision: 18,
      scale: 6,
    })
      .notNull()
      .default("0"),
    trustScore: numeric("trust_score", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    reputation: integer("reputation").notNull().default(0),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_github_id_idx").on(table.githubId),
  ]
);

// ── Auth.js tables ──────────────────────────────────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// ── App tables ──────────────────────────────────────────────────────────────

export const repos = pgTable(
  "repos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .references(() => users.id)
      .notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    description: text("description"),
    githubRepoUrl: text("github_repo_url"),
    githubOwner: text("github_owner"),
    githubRepoName: text("github_repo_name"),
    language: text("language"),
    license: text("license"),
    starCount: integer("star_count").notNull().default(0),
    downloadCount: integer("download_count").notNull().default(0),
    weeklyInstalls: integer("weekly_installs").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("repos_owner_name_idx").on(table.ownerId, table.name),
    index("repos_github_owner_idx").on(table.githubOwner, table.githubRepoName),
    index("repos_star_count_idx").on(table.starCount),
  ]
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .references(() => users.id)
      .notNull(),
    repoId: uuid("repo_id")
      .references(() => repos.id)
      .notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    readme: text("readme"),
    manifest: jsonb("manifest"),
    tags: text("tags").array().notNull().default([]),
    isPublished: boolean("is_published").notNull().default(false),
    installCommand: text("install_command"),
    importedAt: timestamp("imported_at"),
    source: text("source", { enum: ["manual", "github_import"] })
      .notNull()
      .default("manual"),
    trustScore: numeric("trust_score", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),
    fetchCount: integer("fetch_count").notNull().default(0),
    helpfulRate: numeric("helpful_rate", { precision: 4, scale: 3 }),
    feedbackCount: integer("feedback_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("skills_owner_id_idx").on(table.ownerId),
    index("skills_tags_idx").using("gin", table.tags),
    uniqueIndex("skills_owner_slug_idx").on(table.ownerId, table.slug),
    index("skills_repo_id_idx").on(table.repoId),
    uniqueIndex("skills_repo_slug_idx").on(table.repoId, table.slug),
  ]
);

export const stars = pgTable(
  "stars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    repoId: uuid("repo_id")
      .references(() => repos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("stars_user_repo_idx").on(table.userId, table.repoId),
  ]
);

export const donations = pgTable(
  "donations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fromUserId: uuid("from_user_id")
      .references(() => users.id),
    toUserId: uuid("to_user_id")
      .references(() => users.id)
      .notNull(),
    repoId: uuid("repo_id")
      .references(() => repos.id)
      .notNull(),
    chain: text("chain").notNull().default("bsc"),
    txHash: text("tx_hash"),
    amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
    token: text("token").notNull().default("USDT"),
    status: text("status", { enum: ["pending", "confirmed", "failed"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("donations_to_user_idx").on(table.toUserId),
    index("donations_repo_idx").on(table.repoId),
  ]
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    name: text("name").notNull(),
    keyHash: text("key_hash").unique().notNull(),
    keyPrefix: text("key_prefix").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
    index("api_keys_user_id_idx").on(table.userId),
  ]
);

export const skillEvents = pgTable(
  "skill_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: text("event_type").notNull(),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => users.id, { onDelete: "cascade" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("skill_events_skill_id_idx").on(table.skillId),
    index("skill_events_type_idx").on(table.eventType),
    index("skill_events_created_idx").on(table.createdAt),
  ]
);

export const skillFeedback = pgTable(
  "skill_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    agentId: uuid("agent_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    task: text("task").notNull(),
    helpful: boolean("helpful").notNull(),
    context: text("context", { enum: ["resolve", "search", "direct"] }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("skill_feedback_skill_id_idx").on(table.skillId),
    index("skill_feedback_agent_id_idx").on(table.agentId),
    uniqueIndex("skill_feedback_daily_idx").on(
      table.skillId,
      table.agentId,
      sql`(created_at::date)`
    ),
  ]
);


