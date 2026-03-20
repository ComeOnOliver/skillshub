import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and } from "drizzle-orm";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

const SKILLS_DIR = join(__dirname, "../../../skills");

async function main() {
  if (!existsSync(SKILLS_DIR)) {
    console.error("skills/ directory not found. Run from repo root.");
    process.exit(1);
  }

  const db = createDb();
  let imported = 0;
  let skipped = 0;

  const owners = readdirSync(SKILLS_DIR);
  for (const owner of owners) {
    const ownerDir = join(SKILLS_DIR, owner);
    const repoNames = readdirSync(ownerDir).filter(f => {
      try { return readdirSync(join(ownerDir, f)).length > 0; } catch { return false; }
    });

    for (const repoName of repoNames) {
      const repoDir = join(ownerDir, repoName);
      const slugs = readdirSync(repoDir).filter(f =>
        existsSync(join(repoDir, f, "SKILL.md"))
      );
      if (slugs.length === 0) continue;

      // Ensure user exists
      let [user] = await db.select().from(users).where(eq(users.username, owner)).limit(1);
      if (!user) {
        [user] = await db.insert(users).values({
          username: owner,
          role: "human",
        }).returning();
      }

      // Ensure repo exists
      let [repo] = await db.select().from(repos)
        .where(and(eq(repos.githubOwner, owner), eq(repos.githubRepoName, repoName)))
        .limit(1);
      if (!repo) {
        [repo] = await db.insert(repos).values({
          githubOwner: owner,
          githubRepoName: repoName,
          githubUrl: `https://github.com/${owner}/${repoName}`,
          ownerId: user.id,
        }).returning();
      }

      for (const slug of slugs) {
        // Skip if exists
        const existing = await db.select({ id: skills.id }).from(skills)
          .where(and(eq(skills.slug, slug), eq(skills.repoId, repo.id)))
          .limit(1);
        if (existing.length > 0) { skipped++; continue; }

        const readme = readFileSync(join(repoDir, slug, "SKILL.md"), "utf8");
        let name = slug;
        let description = "";
        try {
          const { data, content } = matter(readme);
          name = data.name || slug;
          description = (data.description || content.slice(0, 500)).slice(0, 500);
        } catch {
          description = readme.slice(0, 500);
        }

        await db.insert(skills).values({
          slug, name, description: description || `Skill: ${name}`,
          readme, repoId: repo.id, ownerId: user.id,
          isPublished: true, source: "github",
        });
        imported++;
        if (imported % 100 === 0) console.log(`Imported: ${imported}...`);
      }
    }
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}`);
}

main().catch(console.error);
