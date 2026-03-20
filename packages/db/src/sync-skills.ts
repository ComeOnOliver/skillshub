import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-sync",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function getRepoTree(owner: string, repo: string): Promise<{ path: string; sha: string }[] | null> {
  for (const branch of ["main", "master"]) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.tree) {
        return data.tree
          .filter((t: any) => t.path.endsWith("SKILL.md"))
          .map((t: any) => ({ path: t.path, sha: t.sha }));
      }
    } catch {}
  }
  return null;
}

async function fetchSkillContent(owner: string, repo: string, path: string, branch = "main"): Promise<string | null> {
  for (const b of [branch, "main", "master"]) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${b}/${path}`, {
        headers: { "User-Agent": "skillshub-sync" },
      });
      if (res.ok) return await res.text();
    } catch {}
  }
  return null;
}

function extractSlug(path: string): string {
  // skills/foo/SKILL.md → foo, or just foo/SKILL.md → foo
  const parts = path.replace(/\/SKILL\.md$/i, "").split("/");
  return parts[parts.length - 1] || path;
}

async function main() {
  const db = createDb();

  // Get all repos with their skills
  const allRepos = await db
    .select({
      repoId: repos.id,
      owner: repos.githubOwner,
      repoName: repos.githubRepoName,
      skillCount: sql<number>`(SELECT count(*) FROM skills WHERE skills.repo_id = repos.id AND skills.is_published = true)::int`,
    })
    .from(repos)
    .orderBy(repos.githubOwner);

  console.log(`Checking ${allRepos.length} repos for updates...\n`);

  let totalUpdated = 0;
  let totalNew = 0;
  let totalReposChecked = 0;
  let totalErrors = 0;

  for (const repo of allRepos) {
    totalReposChecked++;
    if (totalReposChecked % 20 === 0) {
      console.log(`Progress: ${totalReposChecked}/${allRepos.length} repos checked, ${totalUpdated} updated, ${totalNew} new`);
    }

    const tree = await getRepoTree(repo.owner, repo.repoName);
    if (!tree) {
      totalErrors++;
      await sleep(500);
      continue;
    }

    // Get existing skills for this repo
    const existingSkills = await db
      .select({ id: skills.id, slug: skills.slug, readme: skills.readme })
      .from(skills)
      .where(and(eq(skills.repoId, repo.repoId), eq(skills.isPublished, true)));

    const existingMap = new Map(existingSkills.map(s => [s.slug, s]));

    for (const file of tree) {
      const slug = extractSlug(file.path);
      const existing = existingMap.get(slug);

      // Fetch the current content
      const content = await fetchSkillContent(repo.owner, repo.repoName, file.path);
      if (!content || content.length < 50) continue;

      if (existing) {
        // Check if content changed (compare trimmed to avoid whitespace diffs)
        if (existing.readme?.trim() !== content.trim()) {
          // Parse frontmatter for updated metadata
          let name = slug;
          let description = "";
          try {
            const { data, content: body } = matter(content);
            name = data.name || slug;
            description = (data.description || body.slice(0, 500)).slice(0, 500);
          } catch {
            description = content.slice(0, 500);
          }

          await db.update(skills).set({
            readme: content,
            name,
            description: description || `Skill: ${name}`,
            updatedAt: new Date(),
          }).where(eq(skills.id, existing.id));
          totalUpdated++;
          console.log(`  ✏️  Updated: ${repo.owner}/${repo.repoName}/${slug}`);
        }
      } else {
        // New skill — get or create user
        let [user] = await db.select().from(users).where(eq(users.username, repo.owner)).limit(1);
        if (!user) {
          [user] = await db.insert(users).values({ username: repo.owner, role: "human" }).returning();
        }

        let name = slug;
        let description = "";
        try {
          const { data, content: body } = matter(content);
          name = data.name || slug;
          description = (data.description || body.slice(0, 500)).slice(0, 500);
        } catch {
          description = content.slice(0, 500);
        }

        try {
          await db.insert(skills).values({
            slug, name, description: description || `Skill: ${name}`,
            readme: content, repoId: repo.repoId, ownerId: user.id,
            isPublished: true, source: "github",
          });
          totalNew++;
          console.log(`  ✅ New: ${repo.owner}/${repo.repoName}/${slug}`);
        } catch(e: any) {
          if (e?.cause?.code === "23505") { /* duplicate key, skip */ }
          else { console.log(`  ⚠️ Error: ${slug}: ${String(e).slice(0,80)}`); }
        }
      }

      await sleep(100); // Rate limit
    }

    await sleep(300); // Between repos
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Sync complete!`);
  console.log(`  Repos checked: ${totalReposChecked}`);
  console.log(`  Repos errored: ${totalErrors}`);
  console.log(`  Skills updated: ${totalUpdated}`);
  console.log(`  Skills new: ${totalNew}`);
}

main().catch(console.error);
