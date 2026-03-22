import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-importer-pua",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

const OWNER = "tanweai";
const REPO = "pua";

// All 9 skills in the repo
const SKILL_DIRS = ["pua", "pua-en", "pua-ja", "loop", "p7", "p9", "p10", "pro", "yes"];

const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "gpt", "claude", "openai"],
  coding: ["code", "coding", "refactor", "debug", "review", "programming"],
  agent: ["agent", "autonomous", "workflow", "orchestrat", "multi-agent", "skill"],
  devops: ["deploy", "infrastructure", "ops"],
  productivity: ["productivity", "pua", "performance", "pip", "proactive"],
};

function autoGenerateTags(name: string, description: string): string[] {
  const tags: string[] = [];
  const text = (name + " " + description).toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) tags.push(tag);
  }
  // Always add these for PUA
  if (!tags.includes("ai")) tags.push("ai");
  if (!tags.includes("coding")) tags.push("coding");
  if (!tags.includes("productivity")) tags.push("productivity");
  return tags.slice(0, 10);
}

function generateSlug(dirName: string): string {
  return dirName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "unnamed-skill";
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function githubFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    console.log("  ⏳ Rate limited, waiting 60s...");
    await sleep(60000);
    return githubFetch(url);
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  const db = createDb();
  let totalSkillsImported = 0;

  console.log(`🚀 Importing ${OWNER}/${REPO} (${SKILL_DIRS.length} skills)...\n`);

  // 1. Get repo metadata
  const repoData = await githubFetch(`https://api.github.com/repos/${OWNER}/${REPO}`);
  console.log(`  ⭐ ${repoData.stargazers_count} stars`);

  // 2. Upsert user
  let [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.githubId, String(repoData.owner.id)))
    .limit(1);

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`  👤 User exists: ${OWNER}`);
  } else {
    const [byUsername] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, repoData.owner.login))
      .limit(1);

    if (byUsername) {
      userId = byUsername.id;
      console.log(`  👤 User exists (by username): ${OWNER}`);
    } else {
      const [created] = await db
        .insert(users)
        .values({
          githubId: String(repoData.owner.id),
          username: repoData.owner.login,
          displayName: repoData.owner.login,
          avatarUrl: repoData.owner.avatar_url,
          role: "human",
        })
        .returning({ id: users.id });
      userId = created.id;
      console.log(`  👤 Created user: ${repoData.owner.login}`);
    }
  }

  // 3. Upsert repo
  let [existingRepo] = await db
    .select({ id: repos.id })
    .from(repos)
    .where(and(eq(repos.githubOwner, OWNER), eq(repos.githubRepoName, REPO)))
    .limit(1);

  let repoId: string;
  if (existingRepo) {
    repoId = existingRepo.id;
    await db
      .update(repos)
      .set({
        starCount: repoData.stargazers_count,
        description: repoData.description,
        updatedAt: new Date(),
      })
      .where(eq(repos.id, repoId));
    console.log(`  📦 Repo exists, updated star count`);
  } else {
    const [created] = await db
      .insert(repos)
      .values({
        ownerId: userId,
        name: REPO,
        displayName: REPO,
        description: repoData.description || "AI Coding Agent PUA/PIP skill — forces AI to exhaust every solution before giving up",
        githubRepoUrl: repoData.html_url,
        githubOwner: OWNER,
        githubRepoName: REPO,
        starCount: repoData.stargazers_count,
        downloadCount: 0,
        weeklyInstalls: 0,
      })
      .returning({ id: repos.id });
    repoId = created.id;
    console.log(`  📦 Created repo: ${OWNER}/${REPO}`);
  }

  // 4. Import each skill
  for (const dir of SKILL_DIRS) {
    const skillPath = `skills/${dir}/SKILL.md`;
    console.log(`\n  📄 Fetching ${skillPath}...`);

    try {
      const contentRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${skillPath}`,
        { headers: { ...headers, Accept: "application/vnd.github.raw" } }
      );

      if (!contentRes.ok) {
        console.log(`    ⚠️ Not found (${contentRes.status}), skipping`);
        continue;
      }

      const content = await contentRes.text();
      const { data: frontmatter, content: body } = matter(content);
      const name = (frontmatter.name as string) || dir;
      const description = ((frontmatter.description as string) || "").slice(0, 500);
      const fmTags: string[] = Array.isArray(frontmatter.tags)
        ? frontmatter.tags.map(String)
        : [];
      const finalTags = fmTags.length > 0 ? fmTags : autoGenerateTags(name, description);
      const slug = generateSlug(dir);

      // Upsert skill
      const [existing] = await db
        .select({ id: skills.id })
        .from(skills)
        .where(and(eq(skills.repoId, repoId), eq(skills.slug, slug)))
        .limit(1);

      if (existing) {
        await db
          .update(skills)
          .set({
            name,
            description: description || undefined,
            readme: body.trim(),
            tags: finalTags,
            updatedAt: new Date(),
          })
          .where(eq(skills.id, existing.id));
        console.log(`    🔄 Updated: ${slug}`);
      } else {
        await db.insert(skills).values({
          ownerId: userId,
          repoId,
          slug,
          name,
          description: description || `${name} — PUA/PIP skill from ${OWNER}/${REPO}`,
          readme: body.trim(),
          tags: finalTags,
          isPublished: true,
          importedAt: new Date(),
          source: "github_import",
        });
        totalSkillsImported++;
        console.log(`    ✅ Imported: ${slug}`);
      }

      await sleep(300);
    } catch (err: any) {
      console.log(`    ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 Import complete! ${totalSkillsImported} new skills imported.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
