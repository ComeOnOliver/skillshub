import "dotenv/config";
import { createDb } from "./client.js";
import { repos, users } from "./schema.js";
import { eq, sql, isNull } from "drizzle-orm";

/**
 * For repos where githubOwner doesn't match the ownerId user's username,
 * create a proper user for the GitHub org and update the repo ownership.
 * This fixes the /owner page showing 0 skills because there's no matching user.
 */
async function main() {
  const db = createDb();

  // Find repos where githubOwner doesn't have a matching user
  const mismatched = await db.execute(sql`
    SELECT r.id, r.github_owner, r.github_repo_name, r.owner_id, u.username as current_owner
    FROM repos r
    JOIN users u ON u.id = r.owner_id
    WHERE r.github_owner IS NOT NULL
      AND r.github_owner != u.username
  `);

  console.log(`Found ${mismatched.rows.length} repos with mismatched owners\n`);

  for (const row of mismatched.rows as any[]) {
    const githubOwner = row.github_owner;
    console.log(`  ${githubOwner}/${row.github_repo_name} (owned by ${row.current_owner})`);

    // Check if user already exists for this github owner
    let [existing] = await db.select({ id: users.id }).from(users)
      .where(eq(users.username, githubOwner)).limit(1);

    if (!existing) {
      // Create user with GitHub avatar
      const [created] = await db.insert(users).values({
        username: githubOwner,
        displayName: githubOwner,
        avatarUrl: `https://github.com/${githubOwner}.png`,
        role: "human",
      }).returning({ id: users.id });
      existing = created;
      console.log(`    → Created user: ${githubOwner}`);
    }

    // Don't reassign repo ownership - the original importer should still own it
    // But the /owner page looks up by githubOwner, which should find repos fine
    // The real issue is the user info display
    console.log(`    → User exists: ${githubOwner} (${existing.id})`);
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch(console.error);
