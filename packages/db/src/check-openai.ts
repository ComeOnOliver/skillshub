import "dotenv/config";
import { createDb } from "./client.js";
import { repos, skills, users } from "./schema.js";
import { eq, sql } from "drizzle-orm";

async function main() {
  const db = createDb();

  const openaiRepos = await db.select({
    id: repos.id, name: repos.name, githubOwner: repos.githubOwner, githubRepoName: repos.githubRepoName,
    ownerId: repos.ownerId, starCount: repos.starCount,
    skillCount: sql<number>`(SELECT count(*) FROM skills WHERE skills.repo_id = repos.id)::int`,
  }).from(repos).where(eq(repos.githubOwner, 'openai'));
  console.log("openai repos:", JSON.stringify(openaiRepos, null, 2));

  // The /openai page does a lookup by username or by githubOwner?
  // Check if there's a user with username 'openai'
  const openaiUser = await db.select({ id: users.id, username: users.username, githubId: users.githubId })
    .from(users).where(eq(users.username, 'openai'));
  console.log("\nuser with username 'openai':", openaiUser);

  // Who owns the openai/skills repo?
  if (openaiRepos.length > 0) {
    const owner = await db.select({ id: users.id, username: users.username })
      .from(users).where(eq(users.id, openaiRepos[0].ownerId));
    console.log("\nowner of openai/skills repo:", owner);
  }

  process.exit(0);
}
main();
