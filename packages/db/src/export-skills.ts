import "dotenv/config";
import { createDb } from "./client.js";
import { skills, repos, users } from "./schema.js";
import { eq } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

const SKILLS_DIR = join(process.cwd(), "../../skills");

async function main() {
  const db = createDb();
  
  console.log("🚀 Exporting skills from DB to skills/ directory...\n");

  const data = await db
    .select({
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      readme: skills.readme,
      tags: skills.tags,
      githubOwner: repos.githubOwner,
      githubRepoName: repos.githubRepoName,
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .where(eq(skills.isPublished, true));

  console.log(`📦 Found ${data.length} published skills\n`);

  let exported = 0;
  let errors = 0;

  for (const skill of data) {
    const owner = skill.githubOwner || "unknown";
    const repo = skill.githubRepoName || "unknown";
    const slug = skill.slug;

    const dir = join(SKILLS_DIR, owner, repo, slug);
    const filePath = join(dir, "SKILL.md");

    try {
      // Build SKILL.md content with frontmatter
      const content = skill.readme || skill.description || `# ${skill.name}`;
      
      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, content + "\n");
      exported++;
    } catch (err: any) {
      errors++;
      if (errors <= 5) {
        console.log(`  ❌ ${owner}/${repo}/${slug}: ${err.message}`);
      }
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Exported ${exported} skills to ${SKILLS_DIR}`);
  if (errors > 0) console.log(`❌ ${errors} errors`);
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
