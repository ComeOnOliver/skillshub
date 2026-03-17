import "dotenv/config";
import { createDb } from "./client.js";
import { sql } from "drizzle-orm";

async function main() {
  const db = createDb();

  console.log("=== ios tagged skills — first 10 by star_count desc ===");
  const ios = await db.execute(sql`
    SELECT s.name, substring(s.description,1,80) as desc, r.github_owner
    FROM skills s JOIN repos r ON s.repo_id = r.id
    WHERE 'ios' = ANY(s.tags)
    ORDER BY r.star_count DESC LIMIT 10
  `);
  ios.rows.forEach((r: any) => console.log(`  ${r.github_owner}/${r.name}: ${r.desc}`));

  console.log("\n=== react tagged skills — first 10 ===");
  const react = await db.execute(sql`
    SELECT s.name, substring(s.description,1,80) as desc, r.github_owner
    FROM skills s JOIN repos r ON s.repo_id = r.id
    WHERE 'react' = ANY(s.tags)
    ORDER BY r.star_count DESC LIMIT 10
  `);
  react.rows.forEach((r: any) => console.log(`  ${r.github_owner}/${r.name}: ${r.desc}`));

  console.log("\n=== docker tagged skills — first 10 ===");
  const docker = await db.execute(sql`
    SELECT s.name, substring(s.description,1,80) as desc, r.github_owner
    FROM skills s JOIN repos r ON s.repo_id = r.id
    WHERE 'docker' = ANY(s.tags)
    ORDER BY r.star_count DESC LIMIT 10
  `);
  docker.rows.forEach((r: any) => console.log(`  ${r.github_owner}/${r.name}: ${r.desc}`));

  process.exit(0);
}
main();
