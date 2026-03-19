import "dotenv/config";
import { createDb } from "./client.js";
import { skills, users, skillEvents, skillFeedback } from "./schema.js";
import { eq, and, sql, ilike } from "drizzle-orm";

/** Delete a skill and its related events/feedback */
async function deleteSkillCascade(db: ReturnType<typeof createDb>, skillId: string) {
  await db.delete(skillEvents).where(eq(skillEvents.skillId, skillId));
  await db.delete(skillFeedback).where(eq(skillFeedback.skillId, skillId));
  await db.delete(skills).where(eq(skills.id, skillId));
}

/**
 * Cleanup script for Round 2 QA:
 * 1. Delete template/placeholder skills
 * 2. Delete cross-repo duplicates (same name + same description), keep oldest
 * 3. Delete specific known junk skill ('test' by dgk-dev)
 */
async function main() {
  const db = createDb();
  let totalDeleted = 0;

  // ── 1. Delete template/placeholder skills ──
  console.log("=== Step 1: Removing template skills ===");

  const templates = await db
    .select({ id: skills.id, name: skills.name, description: skills.description })
    .from(skills)
    .where(
      and(
        sql`lower(${skills.name}) IN ('template', 'template-skill')`,
        ilike(skills.description, '%Replace with description%')
      )
    );

  for (const t of templates) {
    console.log(`  Deleting template: "${t.name}" (${t.id})`);
    await deleteSkillCascade(db, t.id);
    totalDeleted++;
  }
  console.log(`  Deleted ${templates.length} template skill(s)\n`);

  // ── 2. Delete cross-repo duplicates (same name AND same description) ──
  console.log("=== Step 2: Removing cross-repo duplicates ===");

  const duplicateGroups = await db.execute(sql`
    SELECT name, COALESCE(description, '') as description,
           COUNT(*) as cnt,
           array_agg(id ORDER BY created_at ASC) as ids
    FROM skills
    GROUP BY name, COALESCE(description, '')
    HAVING COUNT(*) > 1
  `);

  const dupRows = duplicateGroups.rows as Array<{
    name: string;
    description: string;
    cnt: string;
    ids: string[];
  }>;

  console.log(`  Found ${dupRows.length} duplicate group(s)`);

  let dupDeleted = 0;
  for (const row of dupRows) {
    const keepId = row.ids[0]; // oldest
    const deleteIds = row.ids.slice(1);
    console.log(`  "${row.name}" — keeping oldest ${keepId}, deleting ${deleteIds.length} dupe(s)`);
    for (const id of deleteIds) {
      await deleteSkillCascade(db, id);
      dupDeleted++;
      totalDeleted++;
    }
  }
  console.log(`  Deleted ${dupDeleted} duplicate skill(s)\n`);

  // ── 3. Delete specific junk skill: 'test' by dgk-dev ──
  console.log("=== Step 3: Removing known junk skill ===");

  const junkSkills = await db
    .select({ id: skills.id, name: skills.name, description: skills.description })
    .from(skills)
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(
      and(
        eq(skills.name, "test"),
        eq(users.username, "dgk-dev"),
        ilike(skills.description, 'Persistent verification mode%')
      )
    );

  for (const j of junkSkills) {
    console.log(`  Deleting junk: "${j.name}" (${j.id}) — "${j.description?.slice(0, 60)}..."`);
    await deleteSkillCascade(db, j.id);
    totalDeleted++;
  }
  console.log(`  Deleted ${junkSkills.length} junk skill(s)\n`);

  console.log(`=== TOTAL DELETED: ${totalDeleted} skill(s) ===`);
  process.exit(0);
}

main().catch(console.error);
