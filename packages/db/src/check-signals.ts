import "dotenv/config";
import { createDb } from "./client.js";
import { sql } from "drizzle-orm";

async function main() {
  const db = createDb();
  
  const [stats] = (await db.execute(sql`
    SELECT 
      min(r.star_count) as min_stars, max(r.star_count) as max_stars, avg(r.star_count)::int as avg_stars,
      min(r.download_count) as min_dl, max(r.download_count) as max_dl, avg(r.download_count)::int as avg_dl,
      min(r.weekly_installs) as min_weekly, max(r.weekly_installs) as max_weekly,
      (SELECT count(*) FROM users WHERE total_donations_received::numeric > 0) as users_with_donations,
      (SELECT max(total_donations_received::numeric) FROM users) as max_donations,
      (SELECT avg(length(s.readme)) FROM skills s WHERE s.readme IS NOT NULL)::int as avg_readme_len,
      (SELECT min(length(s.readme)) FROM skills s WHERE s.readme IS NOT NULL)::int as min_readme_len,
      (SELECT max(length(s.readme)) FROM skills s WHERE s.readme IS NOT NULL)::int as max_readme_len,
      (SELECT avg(array_length(s.tags, 1)) FROM skills s WHERE array_length(s.tags, 1) > 0)::numeric(4,1) as avg_tags,
      (SELECT count(*) FROM stars) as total_stars_given,
      (SELECT count(DISTINCT repo_id) FROM stars) as repos_starred
    FROM repos r
  `)).rows;
  console.log("=== DATA SIGNALS ===");
  console.log(JSON.stringify(stats, null, 2));

  // Sample: search for "terraform" and see what we get
  const terraform = (await db.execute(sql`
    SELECT s.name, s.slug, length(s.readme) as readme_len, array_length(s.tags, 1) as tag_count,
      r.star_count, r.download_count, s.description,
      CASE WHEN s.name ILIKE '%terraform%' THEN 'name_match' ELSE 'desc_match' END as match_type
    FROM skills s
    JOIN repos r ON s.repo_id = r.id
    WHERE s.is_published = true 
      AND (s.name ILIKE '%terraform%' OR s.description ILIKE '%terraform%')
    ORDER BY r.star_count DESC
    LIMIT 15
  `)).rows;
  console.log("\n=== TERRAFORM SEARCH (current order) ===");
  terraform.forEach((r: any) => console.log(`  ${r.match_type} | ⭐${r.star_count} | readme:${r.readme_len} | tags:${r.tag_count} | ${r.name}`));

  process.exit(0);
}
main();
