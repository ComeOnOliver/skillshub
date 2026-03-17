import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-importer-batch2",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

// Batch 2 — 100 new repos to import (not in batch 1)
const REPOS_TO_IMPORT = [
  // Tier 1: Mega repos (10,000+ stars)
  { owner: "vercel-labs", repo: "skills" },
  { owner: "K-Dense-AI", repo: "claude-scientific-skills" },
  { owner: "agentskills", repo: "agentskills" },

  // Tier 2: Major repos (1,000–9,999 stars)
  { owner: "liyupi", repo: "ai-guide" },
  { owner: "phuryn", repo: "pm-skills" },
  { owner: "refly-ai", repo: "refly" },
  { owner: "nicobailon", repo: "visual-explainer" },
  { owner: "teng-lin", repo: "notebooklm-py" },
  { owner: "op7418", repo: "Humanizer-zh" },
  { owner: "mvanhorn", repo: "last30days-skill" },
  { owner: "zebbern", repo: "claude-code-guide" },
  { owner: "memodb-io", repo: "Acontext" },
  { owner: "glitternetwork", repo: "pinme" },
  { owner: "LeoYeAI", repo: "openclaw-master-skills" },
  { owner: "tech-leads-club", repo: "agent-skills" },
  { owner: "jeremylongshore", repo: "claude-code-plugins-plus-skills" },
  { owner: "yctimlin", repo: "mcp_excalidraw" },
  { owner: "cisco-ai-defense", repo: "skill-scanner" },
  { owner: "CloudAI-X", repo: "claude-workflow-v2" },
  { owner: "TanStack", repo: "cli" },
  { owner: "Ceeon", repo: "videocut-skills" },
  { owner: "softaworks", repo: "agent-toolkit" },
  { owner: "itsmostafa", repo: "aws-agent-skills" },
  { owner: "Prat011", repo: "awesome-llm-skills" },

  // Tier 3: Notable repos (200–999 stars)
  { owner: "jarrodwatts", repo: "claude-code-config" },
  { owner: "MoizIbnYousaf", repo: "Ai-Agent-Skills" },
  { owner: "skills-directory", repo: "skill-codex" },
  { owner: "https-deeplearning-ai", repo: "sc-agent-skills-files" },
  { owner: "PenglongHuang", repo: "chinese-novelist-skill" },
  { owner: "twostraws", repo: "Swift-Agent-Skills" },
  { owner: "daymade", repo: "claude-code-skills" },
  { owner: "wshuyi", repo: "x-article-publisher-skill" },
  { owner: "geekjourneyx", repo: "md2wechat-skill" },
  { owner: "alirezarezvani", repo: "claude-code-skill-factory" },
  { owner: "ReScienceLab", repo: "opc-skills" },
  { owner: "lijigang", repo: "ljg-skill-xray-paper" },
  { owner: "Lum1104", repo: "Understand-Anything" },
  { owner: "RoundTable02", repo: "tutor-skills" },
  { owner: "qufei1993", repo: "skills-hub" },
  { owner: "new-silvermoon", repo: "awesome-android-agent-skills" },
  { owner: "VikashLoomba", repo: "copilot-mcp" },
  { owner: "Kamalnrf", repo: "claude-plugins" },
  { owner: "mhattingpete", repo: "claude-skills-marketplace" },
  { owner: "enulus", repo: "OpenPackage" },
  { owner: "guanyang", repo: "antigravity-skills" },
  { owner: "MicrosoftDocs", repo: "Agent-Skills" },
  { owner: "axtonliu", repo: "smart-illustrator" },
  { owner: "kasperjunge", repo: "agent-resources" },
  { owner: "FrancyJGLisboa", repo: "agent-skill-creator" },
  { owner: "blader", repo: "napkin" },
  { owner: "wlzh", repo: "skills" },
  { owner: "aitytech", repo: "agentkits-marketing" },
  { owner: "Eronred", repo: "aso-skills" },
  { owner: "bentossell", repo: "visualise" },
  { owner: "antfu", repo: "skills-npm" },
  { owner: "K-Dense-AI", repo: "claude-skills-mcp" },
  { owner: "gotalab", repo: "skillport" },
  { owner: "HoangNguyen0403", repo: "agent-skills-standard" },
  { owner: "zscole", repo: "model-hierarchy-skill" },
  { owner: "RKiding", repo: "Awesome-finance-skills" },
  { owner: "blessonism", repo: "openclaw-search-skills" },
  { owner: "luwill", repo: "research-skills" },
  { owner: "sharbelxyz", repo: "x-bookmarks" },
  { owner: "second-state", repo: "payment-skill" },
  { owner: "neutree-ai", repo: "openapi-to-skills" },
  { owner: "datawhalechina", repo: "agent-skills-with-anthropic" },
  { owner: "harlan-zw", repo: "skilld" },
  { owner: "crossoverJie", repo: "SkillDeck" },
  { owner: "rominirani", repo: "antigravity-skills" },

  // Tier 4: Emerging repos (20–199 stars) — selected quality
  { owner: "bowenliang123", repo: "markdown-exporter" },
  { owner: "win4r", repo: "openclaw-workspace" },
  { owner: "klaudworks", repo: "universal-skills" },
  { owner: "MapleShaw", repo: "yt-dlp-downloader-skill" },
  { owner: "guhaohao0991", repo: "PaperClaw" },
  { owner: "agent-sh", repo: "agnix" },
  { owner: "gapmiss", repo: "obsidian-plugin-skill" },
  { owner: "frmoretto", repo: "stream-coding" },
  { owner: "blacktop", repo: "ipsw-skill" },
  { owner: "jakedahn", repo: "pomodoro" },
  { owner: "indiesoftby", repo: "defold-agent-config" },
  { owner: "Narwhal-Lab", repo: "MagicSkills" },
  { owner: "egebese", repo: "skill-manager" },
  { owner: "huangserva", repo: "servasyy_skills" },
  { owner: "ninestep", repo: "docx-format-skill" },
  { owner: "solanabr", repo: "solana-claude-config" },
  { owner: "dave1010", repo: "skills-to-agents" },
  { owner: "wilwaldon", repo: "Claude-Code-Frontend-Design-Toolkit" },
  { owner: "AdamTylerLynch", repo: "obsidian-agent-memory-skills" },
  { owner: "spboyer", repo: "sensei" },
  { owner: "KreerC", repo: "ACCESSIBILITY.md" },
  { owner: "runtimenoteslabs", repo: "cc-rig" },
  { owner: "tomkrikorian", repo: "visionOSAgents" },
  { owner: "aakashg", repo: "pm-claude-code-setup" },
  { owner: "ythx-101", repo: "x-tweet-fetcher" },
  { owner: "countbot-ai", repo: "CountBot" },
  { owner: "oh-ashen-one", repo: "reddit-growth-skill" },
  { owner: "joinmassive", repo: "clawpod" },
  { owner: "Decodo", repo: "decodo-openclaw-skill" },
  { owner: "rmyndharis", repo: "antigravity-skills" },
  { owner: "laravel", repo: "agent-skills" },
  { owner: "GuDaStudio", repo: "skills" },
  { owner: "ynulihao", repo: "AgentSkillOS" },
  { owner: "iflytek", repo: "skillhub" },
];

const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "gpt", "claude", "openai"],
  mcp: ["mcp", "model context protocol"],
  frontend: ["react", "vue", "angular", "nextjs", "next.js", "frontend", "css", "tailwind", "ui", "swiftui"],
  backend: ["api", "rest", "graphql", "server", "backend", "express", "fastapi", "django"],
  devops: ["docker", "kubernetes", "k8s", "ci/cd", "deploy", "infrastructure", "terraform", "aws", "gcp", "azure", "cloudflare"],
  database: ["database", "sql", "postgres", "mongodb", "redis", "supabase", "drizzle", "clickhouse"],
  security: ["security", "auth", "authentication", "encryption", "vulnerability", "pentest", "bug bounty"],
  testing: ["test", "testing", "jest", "pytest", "cypress", "playwright"],
  mobile: ["mobile", "ios", "android", "react native", "flutter", "expo", "swift"],
  python: ["python", "pip", "django", "flask", "fastapi"],
  typescript: ["typescript", "ts", "deno", "bun"],
  rust: ["rust", "cargo", "wasm"],
  data: ["data", "analytics", "pandas", "etl", "pipeline", "scraping"],
  coding: ["code", "coding", "refactor", "debug", "review", "programming"],
  writing: ["writing", "documentation", "docs", "markdown", "blog", "content"],
  design: ["design", "figma", "ui/ux", "prototype"],
  agent: ["agent", "autonomous", "workflow", "orchestrat", "multi-agent", "skill"],
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

  console.log(`🚀 Batch 2: Importing ${REPOS_TO_IMPORT.length} repos...\n`);

  for (let i = 0; i < REPOS_TO_IMPORT.length; i++) {
    const { owner, repo } = REPOS_TO_IMPORT[i];
    console.log(`[${i + 1}/${REPOS_TO_IMPORT.length}] ${owner}/${repo}`);

    try {
      // 1. Get repo metadata
      const repoData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
      const defaultBranch = repoData.default_branch || "main";

      // 2. Get tree to find SKILL.md files
      const treeData = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );

      const skillPaths: string[] = [];
      for (const item of treeData.tree || []) {
        if (item.type === "blob" && item.path.endsWith("/SKILL.md")) {
          skillPaths.push(item.path);
        }
      }
      // Check root SKILL.md
      if (skillPaths.length === 0) {
        for (const item of treeData.tree || []) {
          if (item.type === "blob" && item.path === "SKILL.md") {
            skillPaths.push(item.path);
          }
        }
      }

      if (skillPaths.length === 0) {
        console.log(`  ⚠️ No SKILL.md files found, skipping`);
        errors.push(`${owner}/${repo}: no SKILL.md files`);
        await sleep(500);
        continue;
      }

      console.log(`  📂 Found ${skillPaths.length} SKILL.md files`);

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
      for (let j = 0; j < skillPaths.length; j += 5) {
        const batch = skillPaths.slice(j, j + 5);
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
  console.log(`🎉 Batch 2 Import complete!`);
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
