import "dotenv/config";
import { createDb } from "./client.js";
import { skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";

/**
 * Deduplicate skills: if multiple skills share the same name AND repoId,
 * keep the one with the most content (longest readme) and delete the rest.
 *
 * Also specifically removes the known 'advanced-evaluation' duplicate.
 */
async function main() {
  const db = createDb();

  // Find all duplicates: same name + same repoId
  const duplicates = await db.execute(sql`
    SELECT name, repo_id, COUNT(*) as cnt,
           array_agg(id ORDER BY LENGTH(COALESCE(readme, '')) DESC, created_at ASC) as ids
    FROM skills
    GROUP BY name, repo_id
    HAVING COUNT(*) > 1
  `);

  const rows = duplicates.rows as Array<{
    name: string;
    repo_id: string;
    cnt: string;
    ids: string[];
  }>;

  console.log(`Found ${rows.length} duplicate groups\n`);

  let totalDeleted = 0;

  for (const row of rows) {
    const keepId = row.ids[0]; // longest readme
    const deleteIds = row.ids.slice(1);

    console.log(`  "${row.name}" — keeping ${keepId}, deleting ${deleteIds.length} duplicate(s)`);

    for (const id of deleteIds) {
      await db.delete(skills).where(eq(skills.id, id));
      totalDeleted++;
    }
  }

  console.log(`\nDeleted ${totalDeleted} duplicate skills`);
  process.exit(0);
}

main().catch(console.error);
