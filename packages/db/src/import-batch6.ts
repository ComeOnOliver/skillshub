import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-importer-batch6",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

// Batch 6 — Academic, science, creative, life skills + major skill collections we missed
const REPOS_TO_IMPORT = [
  // === Tier 1: Mega repos (10k+ stars) ===
  { owner: "anthropics", repo: "skills" },                          // 96k⭐, 18 SKILL.md — THE official Anthropic skills
  { owner: "obra", repo: "superpowers" },                           // 92k⭐, 14 SKILL.md — Agentic skills framework
  { owner: "github", repo: "awesome-copilot" },                     // 25k⭐, 329 SKILL.md — GitHub's copilot community skills
  { owner: "sickn33", repo: "antigravity-awesome-skills" },         // 25k⭐, 1265 SKILL.md — massive skills collection
  { owner: "vercel-labs", repo: "agent-skills" },                   // 23k⭐, 5 SKILL.md — Vercel official agent skills
  { owner: "googleworkspace", repo: "cli" },                        // 21k⭐, 93 SKILL.md — Google Workspace CLI skills
  { owner: "kepano", repo: "obsidian-skills" },                     // 14k⭐, 5 SKILL.md — Obsidian official skills
  { owner: "muratcankoylan", repo: "Agent-Skills-for-Context-Engineering" }, // 13k⭐, 19 SKILL.md — Context engineering

  // === Tier 2: Large repos (1k-10k stars) ===
  { owner: "libukai", repo: "awesome-agent-skills" },               // 3k⭐, 6 SKILL.md — Curated skill guide (Chinese)

  // === Tier 3: Notable repos with many skills ===
  { owner: "luisschmitzheadline", repo: "VC-Skills.md" },           // 14⭐, 107 SKILL.md — VC/finance skills
  { owner: "haolange", repo: "RDC-Agent-Frameworks" },              // 7⭐, 60 SKILL.md — RenderDoc debugging/reverse engineering
  { owner: "SnailSploit", repo: "Claude-Red" },                     // 12⭐, 37 SKILL.md — Offensive security skills
  { owner: "michaelboeding", repo: "skills" },                      // 10⭐, 36 SKILL.md — Broad personal collection
  { owner: "vosslab", repo: "vosslab-skills" },                     // 1⭐, 19 SKILL.md — Research/education workflows

  // === Tier 4: Quality niche repos ===
  // Product Management / Marketing / Business
  { owner: "Hmtheo", repo: "pm-skills-library" },                   // 0⭐, 7 SKILL.md — Product management skills
  { owner: "Stallin-Sanamandra", repo: "b2b-saas-marketing-skills" }, // 1⭐, 6 SKILL.md — B2B SaaS marketing
  { owner: "polything", repo: "starter-skills" },                   // 0⭐, 6 SKILL.md — Marketing starter pack
  { owner: "comsky", repo: "remy-skill-recipes" },                  // 9⭐, 7 SKILL.md — Prompt engineering recipes

  // Education / Research
  { owner: "malkreide", repo: "socratic-method-skill" },            // 0⭐, 2 SKILL.md — Socratic method teaching
  { owner: "zebbern", repo: "agent-skills-authoring" },             // 19⭐, 1 SKILL.md — Skill authoring guide

  // n8n / Automation
  { owner: "geckse", repo: "n8n-skills" },                         // 7⭐, 2 SKILL.md — n8n automation
  { owner: "strativd", repo: "ai-skills" },                        // 7⭐, 3 SKILL.md — AI agent skills collection
  { owner: "garyblankenship", repo: "SKILL.md" },                  // 6⭐, 2 SKILL.md — Self-improving components

  // Security
  { owner: "Erikote04", repo: "Swift-API-Design-Guidelines-Agent-Skill" }, // 10⭐, 1 SKILL.md — Swift API guidelines
  { owner: "dbwls99706", repo: "ros2-engineering-skills" },         // 9⭐, 1 SKILL.md — ROS2 robotics
  { owner: "jacksonjp0311-gif", repo: "Clawbot-skills" },          // 11⭐, 3 SKILL.md — OpenClaw skill collection

  // Writing / SaaS / Misc
  { owner: "Sunhao25", repo: "skills" },                           // 1⭐, 1 SKILL.md — Writing/SaaS skills
  { owner: "ychampion", repo: "claude-self-learning" },             // 6⭐, 1 SKILL.md — Self-learning plugin
  { owner: "UeberUeber", repo: "ueber-skills" },                   // 2⭐, 2 SKILL.md — Custom skills
];

const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ["artificial intelligence", "machine learning", "llm", "gpt", "openai", "anthropic", "deep learning"],
  mcp: ["mcp", "model context protocol"],
  frontend: ["react", "vue", "angular", "nextjs", "next.js", "frontend", "front-end", "tailwind", "swiftui", "css"],
  backend: ["graphql", "backend", "back-end", "rest api", "grpc", "microservice"],
  devops: ["docker", "kubernetes", "k8s", "ci/cd", "terraform", "aws", "gcp", "azure", "cloudflare"],
  database: ["database", "sql", "postgres", "mongodb", "redis", "supabase", "clickhouse"],
  security: ["security", "authentication", "encryption", "vulnerability", "pentest", "offensive security", "red team"],
  testing: ["testing", "test framework", "jest", "pytest", "cypress", "playwright"],
  mobile: ["mobile app", "react native", "flutter", "expo"],
  python: ["python", "django", "flask", "fastapi", "pytest"],
  typescript: ["typescript", "deno"],
  rust: ["rust ", "rustlang", "cargo"],
  golang: ["golang", "goroutine"],
  data: ["data engineering", "data pipeline", "analytics", "pandas", "etl"],
  coding: ["code review", "refactor", "debugging", "programming"],
  writing: ["technical writing", "documentation", "blog writing"],
  design: ["ui design", "figma", "ui/ux", "wireframe"],
  agent: ["ai agent", "autonomous agent", "multi-agent", "agentic"],
  education: ["education", "teaching", "tutorial", "socratic"],
  marketing: ["marketing", "growth", "seo", "content marketing"],
  finance: ["finance", "venture capital", "investment", "trading"],
  robotics: ["robotics", "ros2", "robot"],
  automation: ["n8n", "automation", "zapier"],
  obsidian: ["obsidian"],
  gamedev: ["unreal engine", "unity", "game dev", "godot", "renderdoc"],
};

function autoGenerateTags(name: string, description: string): string[] {
  const tags: string[] = [];
  const text = (name + " " + description).toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) tags.push(tag);
  }
  return tags.slice(0, 10);
}

function generateSlug(dirName: string): string {
  const slug = dirName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug.length === 0 ? "unnamed-skill" : slug;
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
  let totalReposImported = 0;
  let errors: string[] = [];

  console.log(`🚀 Batch 6: Importing ${REPOS_TO_IMPORT.length} repos...\n`);

  for (let i = 0; i < REPOS_TO_IMPORT.length; i++) {
    const { owner, repo } = REPOS_TO_IMPORT[i];
    console.log(`[${i + 1}/${REPOS_TO_IMPORT.length}] ${owner}/${repo}`);

    try {
      // 1. Get repo metadata
      const repoData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
      const defaultBranch = repoData.default_branch || "main";

      // 2. Get tree to find SKILL.md files
      let treeData: any;
      try {
        treeData = await githubFetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
        );
      } catch (e: any) {
        // Some large repos truncate; try without recursive
        console.log(`  ⚠️ Tree truncated, trying non-recursive...`);
        treeData = await githubFetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
        );
      }

      const skillPaths: string[] = [];
      for (const item of treeData.tree || []) {
        if (item.type === "blob" && (item.path.endsWith("/SKILL.md") || item.path === "SKILL.md")) {
          skillPaths.push(item.path);
        }
      }

      if (skillPaths.length === 0) {
        console.log(`  ⚠️ No SKILL.md files found, skipping`);
        errors.push(`${owner}/${repo}: no SKILL.md files`);
        await sleep(500);
        continue;
      }

      // Cap at 200 skills per repo to avoid API exhaustion
      const cappedPaths = skillPaths.slice(0, 200);
      if (skillPaths.length > 200) {
        console.log(`  📂 Found ${skillPaths.length} SKILL.md files (capping at 200)`);
      } else {
        console.log(`  📂 Found ${skillPaths.length} SKILL.md files`);
      }

      // 3. Upsert user
      let [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.githubId, String(repoData.owner.id)))
        .limit(1);

      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [byUsername] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, repoData.owner.login))
          .limit(1);

        if (byUsername) {
          userId = byUsername.id;
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

      // 4. Upsert repo
      let [existingRepo] = await db
        .select({ id: repos.id })
        .from(repos)
        .where(and(eq(repos.githubOwner, owner), eq(repos.githubRepoName, repo)))
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
      } else {
        const [created] = await db
          .insert(repos)
          .values({
            ownerId: userId,
            name: repo,
            displayName: repo,
            description: repoData.description || `Skills from ${owner}/${repo}`,
            githubRepoUrl: repoData.html_url,
            githubOwner: owner,
            githubRepoName: repo,
            starCount: repoData.stargazers_count,
            downloadCount: 0,
            weeklyInstalls: 0,
          })
          .returning({ id: repos.id });
        repoId = created.id;
        totalReposImported++;
      }

      // 5. Fetch and import each skill (batch 5 at a time)
      let skillsInRepo = 0;
      for (let j = 0; j < cappedPaths.length; j += 5) {
        const batch = cappedPaths.slice(j, j + 5);
        const results = await Promise.allSettled(
          batch.map(async (path) => {
            const contentRes = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
              { headers: { ...headers, Accept: "application/vnd.github.raw" } }
            );
            if (!contentRes.ok) return null;
            return { path, content: await contentRes.text() };
          })
        );

        for (const result of results) {
          if (result.status !== "fulfilled" || !result.value) continue;
          const { path, content } = result.value;

          const parts = path.split("/");
          const dirName =
            parts.length >= 3
              ? parts[parts.length - 2]
              : parts.length === 2
                ? parts[0]
                : repo;

          const { data: frontmatter, content: body } = matter(content);
          const name = (frontmatter.name as string) || dirName;
          const description = ((frontmatter.description as string) || "").slice(0, 500);
          const fmTags: string[] = Array.isArray(frontmatter.tags)
            ? frontmatter.tags.map(String)
            : [];
          const finalTags =
            fmTags.length > 0 ? fmTags : autoGenerateTags(name, description);
          const slug = generateSlug(dirName);

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
          } else {
            await db.insert(skills).values({
              ownerId: userId,
              repoId,
              slug,
              name,
              description: description || `${name} skill from ${owner}/${repo}`,
              readme: body.trim(),
              tags: finalTags,
              isPublished: true,
              importedAt: new Date(),
              source: "github_import",
            });
            totalSkillsImported++;
            skillsInRepo++;
          }
        }
        await sleep(300); // Rate limit friendly
      }

      console.log(`  ✅ Imported ${skillsInRepo} new skills`);
      await sleep(500);
    } catch (err: any) {
      console.log(`  ❌ Error: ${err.message}`);
      errors.push(`${owner}/${repo}: ${err.message}`);
      await sleep(1000);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 Batch 6 Import complete!`);
  console.log(`   New repos: ${totalReposImported}`);
  console.log(`   New skills: ${totalSkillsImported}`);
  if (errors.length > 0) {
    console.log(`   Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`     - ${e}`));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
