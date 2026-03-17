import "dotenv/config";
import { createDb } from "./client.js";
import { skills, repos } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

async function main() {
  const db = createDb();

  // 1. Remove 'docker' tag from Jetpack Compose skills (android)
  const composeFix = await db.execute(sql`
    UPDATE skills SET tags = array_remove(tags, 'docker')
    WHERE 'docker' = ANY(tags) AND 'android' = ANY(tags)
    AND (name ILIKE '%compose%' AND name NOT ILIKE '%docker%')
  `);
  console.log("Removed docker from Jetpack Compose skills:", composeFix.rowCount);

  // 2. Remove 'ios' from non-iOS skills (financial, email, clinical etc)
  const iosFix = await db.execute(sql`
    UPDATE skills SET tags = array_remove(tags, 'ios')
    WHERE 'ios' = ANY(tags)
    AND name NOT ILIKE '%ios%' AND name NOT ILIKE '%swift%' AND name NOT ILIKE '%xcode%'
    AND name NOT ILIKE '%apple%' AND name NOT ILIKE '%axiom%'
    AND coalesce(description,'') NOT ILIKE '%ios%' AND coalesce(description,'') NOT ILIKE '%swift%'
    AND coalesce(description,'') NOT ILIKE '%xcode%' AND coalesce(description,'') NOT ILIKE '%iphone%'
    AND coalesce(description,'') NOT ILIKE '%ipad%' AND coalesce(description,'') NOT ILIKE '%apple%'
  `);
  console.log("Removed ios from non-iOS skills:", iosFix.rowCount);

  // 3. Remove 'react' from non-React skills
  const reactFix = await db.execute(sql`
    UPDATE skills SET tags = array_remove(tags, 'react')
    WHERE 'react' = ANY(tags)
    AND name NOT ILIKE '%react%' AND name NOT ILIKE '%jsx%' AND name NOT ILIKE '%next%'
    AND coalesce(description,'') NOT ILIKE '%react%' AND coalesce(description,'') NOT ILIKE '%jsx%'
    AND coalesce(description,'') NOT ILIKE '%next.js%' AND coalesce(description,'') NOT ILIKE '%nextjs%'
  `);
  console.log("Removed react from non-React skills:", reactFix.rowCount);

  // 4. Remove 'mobile' from non-mobile skills
  const mobileFix = await db.execute(sql`
    UPDATE skills SET tags = array_remove(tags, 'mobile')
    WHERE 'mobile' = ANY(tags)
    AND name NOT ILIKE '%mobile%' AND name NOT ILIKE '%ios%' AND name NOT ILIKE '%android%'
    AND name NOT ILIKE '%react native%' AND name NOT ILIKE '%flutter%' AND name NOT ILIKE '%expo%'
    AND coalesce(description,'') NOT ILIKE '%mobile%' AND coalesce(description,'') NOT ILIKE '%ios%'
    AND coalesce(description,'') NOT ILIKE '%android%' AND coalesce(description,'') NOT ILIKE '%react native%'
  `);
  console.log("Removed mobile from non-mobile skills:", mobileFix.rowCount);

  // 5. Remove 'python' from non-Python skills
  const pythonFix = await db.execute(sql`
    UPDATE skills SET tags = array_remove(tags, 'python')
    WHERE 'python' = ANY(tags)
    AND name NOT ILIKE '%python%' AND name NOT ILIKE '%py%' AND name NOT ILIKE '%django%'
    AND name NOT ILIKE '%flask%' AND name NOT ILIKE '%pandas%'
    AND coalesce(description,'') NOT ILIKE '%python%' AND coalesce(description,'') NOT ILIKE '%pip%'
    AND coalesce(description,'') NOT ILIKE '%django%' AND coalesce(description,'') NOT ILIKE '%flask%'
    AND coalesce(description,'') NOT ILIKE '%pandas%' AND coalesce(description,'') NOT ILIKE '%pytest%'
    AND coalesce(description,'') NOT ILIKE '%fastapi%'
  `);
  console.log("Removed python from non-Python skills:", pythonFix.rowCount);

  // Check final counts
  for (const tag of ['docker', 'ios', 'react', 'mobile', 'python']) {
    const [r] = (await db.execute(sql`SELECT count(*)::int as cnt FROM skills WHERE ${sql.raw("'" + tag + "'")} = ANY(tags)`)).rows as any[];
    console.log(`  ${tag}: ${r.cnt} skills`);
  }

  process.exit(0);
}
main();
