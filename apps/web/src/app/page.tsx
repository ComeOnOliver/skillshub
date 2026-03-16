import Link from "next/link";
import { ArrowRight, Zap, Shield, Coins, Star, Download, Package, Github } from "lucide-react";
import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getMultiRepoStars } from "@/lib/ungh";
import { AgentLogos } from "@/components/agent-logos";

async function getStats() {
  const db = getDb();
  const [skillResult] = await db
    .select({
      totalSkills: sql<number>`count(*)::int`,
    })
    .from(skills)
    .where(eq(skills.isPublished, true));

  const [repoResult] = await db
    .select({
      totalStars: sql<number>`coalesce(sum(${repos.starCount}), 0)::int`,
      totalDownloads: sql<number>`coalesce(sum(${repos.downloadCount}), 0)::int`,
    })
    .from(repos);

  const [userResult] = await db
    .select({ totalUsers: sql<number>`count(*)::int` })
    .from(users);

  return {
    totalSkills: skillResult?.totalSkills ?? 0,
    totalStars: repoResult?.totalStars ?? 0,
    totalDownloads: repoResult?.totalDownloads ?? 0,
    totalUsers: userResult?.totalUsers ?? 0,
  };
}

// Hardcoded featured repos for when DB has no stars
const FEATURED_REPOS = [
  { owner: "openclaw", repo: "openclaw", description: "Your own personal AI assistant. Any OS. Any Platform.", skills: 53 },
  { owner: "anthropics", repo: "skills", description: "Public repository for Agent Skills by Anthropic.", skills: 17 },
  { owner: "obra", repo: "superpowers", description: "AI agent superpowers — coding, research, and more.", skills: 14 },
  { owner: "affaan-m", repo: "everything-claude-code", description: "Comprehensive Claude Code skills collection.", skills: 40 },
  { owner: "vercel-labs", repo: "agent-skills", description: "Agent skills by Vercel — React, deployment, web design.", skills: 5 },
  { owner: "kepano", repo: "obsidian-skills", description: "Obsidian-focused skills by Steph Ango.", skills: 5 },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

async function TopRepos() {
  const db = getDb();

  const data = await db
    .select({
      id: repos.id,
      name: repos.name,
      description: repos.description,
      githubOwner: repos.githubOwner,
      githubRepoName: repos.githubRepoName,
      starCount: repos.starCount,
      downloadCount: repos.downloadCount,
      skillCount: sql<number>`(SELECT count(*) FROM skills WHERE skills.repo_id = repos.id)::int`,
      ownerAvatar: users.avatarUrl,
      ownerUsername: users.username,
      ownerVerified: users.isVerified,
    })
    .from(repos)
    .innerJoin(users, eq(repos.ownerId, users.id))
    .orderBy(desc(repos.starCount))
    .limit(6);

  // Fetch live GitHub stars
  const repoKeys = data.length > 0
    ? data.filter(r => r.githubOwner && r.githubRepoName).map(r => ({ owner: r.githubOwner!, repo: r.githubRepoName! }))
    : FEATURED_REPOS.map(r => ({ owner: r.owner, repo: r.repo }));
  const liveStars = await getMultiRepoStars(repoKeys);

  if (data.length === 0) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {FEATURED_REPOS.map((repo) => {
          const ghStars = liveStars.get(`${repo.owner}/${repo.repo}`) ?? 0;
          return (
            <Link
              key={`${repo.owner}/${repo.repo}`}
              href={`/${repo.owner}/${repo.repo}`}
              className="group block rounded border border-neutral-800/50 bg-neutral-900/20 p-4 transition-all hover:border-neon-cyan/30 hover:bg-neutral-900/40 glow-box"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <img src={`https://github.com/${repo.owner}.png`} alt={repo.owner} className="h-6 w-6 rounded-full ring-1 ring-neutral-800" />
                <h3 className="font-mono text-sm font-medium text-neutral-200 group-hover:text-neon-cyan transition-colors truncate">
                  {repo.owner}<span className="text-neutral-600">/</span>{repo.repo}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">{repo.description}</p>
              <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-600">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-neon-yellow/60" />{formatCount(ghStars)}</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3 text-neon-cyan/60" />{repo.skills} skills</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {data.map((repo) => {
        const ghStars = liveStars.get(`${repo.githubOwner}/${repo.githubRepoName}`) ?? 0;
        return (
          <Link
            key={repo.id}
            href={`/${repo.githubOwner}/${repo.githubRepoName}`}
            className="group block rounded border border-neutral-800/50 bg-neutral-900/20 p-4 transition-all hover:border-neon-cyan/30 hover:bg-neutral-900/40 glow-box"
          >
            <div className="flex items-center gap-2.5 mb-2">
              {repo.ownerAvatar && (
                <img src={repo.ownerAvatar} alt={repo.ownerUsername} className="h-6 w-6 rounded-full ring-1 ring-neutral-800" />
              )}
              <h3 className="font-mono text-sm font-medium text-neutral-200 group-hover:text-neon-cyan transition-colors truncate">
                {repo.githubOwner ?? repo.ownerUsername}<span className="text-neutral-600">/</span>{repo.githubRepoName ?? repo.name}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
              {repo.description}
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-600">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-neon-yellow/60" />{formatCount(ghStars)}</span>
              <span className="flex items-center gap-1"><Package className="h-3 w-3 text-neon-cyan/60" />{repo.skillCount} skills</span>
              <span className="flex items-center gap-1"><Download className="h-3 w-3 text-neon-lime/60" />{formatCount(repo.downloadCount)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ── Hero (centered) ──────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 font-mono text-xs text-neutral-600">
            <span className="text-neon-cyan/60">~/skillshub</span><a href="https://github.com/ComeOnOliver/skillshub" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1 align-middle"><Github className="h-3 w-3 text-neutral-600 hover:text-neon-cyan transition-colors" /></a> <span className="text-neutral-700">on</span> <span className="text-neon-lime/60">main</span> <span className="text-neutral-700">via</span> <span className="text-neon-orange/60">⬡ v0.1.0</span>
          </div>

          <h1 className="glitch-text mb-2 font-mono text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-neutral-100">The Registry for</span>
            <br />
            <span className="bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime bg-clip-text text-transparent">
              AI Agent Skills
            </span>
          </h1>

          <p className="mt-4 mb-8 mx-auto max-w-xl text-sm text-neutral-500 leading-relaxed font-mono">
            discover, share & monetize skills for AI agents.
            <br />
            built by degens, for degens.
          </p>

          {/* Fake terminal */}
          <div className="mb-8 mx-auto max-w-lg rounded border border-neutral-800/80 bg-[#0a0a0a] overflow-hidden text-left">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-800/50">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 font-mono text-[10px] text-neutral-600">terminal</span>
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed">
              <div className="text-neutral-600">
                <span className="text-neon-cyan/50">#</span> start here — get the full API guide
              </div>
              <div className="mt-1 text-neutral-500">
                <span className="text-neon-cyan">$</span> curl &quot;skillshub.wtf/api/&quot;
              </div>
              <div className="mt-1 text-neutral-600">
                <span className="text-neon-lime">→</span> {`{"quick_start":...,"search":...,"endpoints":...}`}
              </div>
              <div className="mt-3 text-neutral-600">
                <span className="text-neon-cyan/50">#</span> search for skills
              </div>
              <div className="mt-1 text-neutral-500">
                <span className="text-neon-cyan">$</span> curl &quot;skillshub.wtf/api/v1/skills/search?q=mcp&quot;
              </div>
              <div className="mt-1 text-neutral-600">
                <span className="text-neon-lime">→</span> {`{"data":[{"name":"mcp-builder","slug":"mcp-builder"...}]}`}
              </div>
              <div className="mt-3 text-neutral-600">
                <span className="text-neon-cyan/50">#</span> fetch the skill
              </div>
              <div className="mt-1 text-neutral-500">
                <span className="text-neon-cyan">$</span> curl &quot;skillshub.wtf/anthropics/skills/mcp-builder?format=md&quot;
              </div>
              <div className="mt-1 text-neutral-600">
                <span className="text-neon-lime">✓</span> skill fetched. read it. follow it.
              </div>
              <div className="mt-2 text-neutral-400">
                <span className="text-neon-cyan">$</span> <span className="cursor-blink text-neon-cyan">▋</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/skills"
              className="group inline-flex items-center gap-2 rounded border border-neon-cyan/50 bg-neon-cyan/5 px-5 py-2.5 font-mono text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all glow-box"
            >
              <span className="text-neutral-500 group-hover:text-neon-cyan">$</span> browse --all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/skills/publish"
              className="group inline-flex items-center gap-2 rounded border border-neutral-700/50 px-5 py-2.5 font-mono text-xs text-neutral-400 hover:border-neon-magenta/50 hover:text-neon-magenta transition-all"
            >
              <span className="text-neutral-600 group-hover:text-neon-magenta">$</span> publish --skill
            </Link>
          </div>
        </div>
      </section>

      {/* ── Available for these agents ──────────── */}
      <AgentLogos />

      {/* ── Stats ─────────────────────────────── */}
      <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "skills", value: stats.totalSkills, color: "text-neon-cyan" },
          { label: "stars", value: stats.totalStars, color: "text-neon-yellow" },
          { label: "installs", value: stats.totalDownloads, color: "text-neon-lime" },
          { label: "users", value: stats.totalUsers, color: "text-neon-magenta" },
        ].map((stat) => (
          <div key={stat.label} className="rounded border border-neutral-800/50 bg-neutral-900/30 px-4 py-3">
            <div className={`font-mono text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Feature Cards ─────────────────────── */}
      <section className="grid gap-3 pb-16 md:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "discover",
            desc: "search & browse a growing registry of agent skills — web scraping, code review, data pipelines, and more.",
            color: "neon-cyan",
            border: "border-neon-cyan/10 hover:border-neon-cyan/30",
          },
          {
            icon: Shield,
            title: "trust",
            desc: "community-rated skills with trust scores. find reliable, well-maintained skills your agents can depend on.",
            color: "neon-magenta",
            border: "border-neon-magenta/10 hover:border-neon-magenta/30",
          },
          {
            icon: Coins,
            title: "earn",
            desc: "receive donations in USDT/USDC on BSC. agents and humans support your work — directly onchain.",
            color: "neon-lime",
            border: "border-neon-lime/10 hover:border-neon-lime/30",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`rounded border ${card.border} bg-neutral-900/20 p-5 transition-all`}
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`h-4 w-4 text-${card.color}`} />
              <h3 className={`font-mono text-sm font-semibold text-${card.color}`}>
                {card.title}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── Top Repos ─────────────────────────── */}
      <section className="pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-sm text-neutral-400">
            <span className="text-neon-cyan/50">&gt;</span> top_repos <span className="text-neutral-600">--sort stars --limit 6</span>
          </h2>
          <Link href="/skills" className="font-mono text-xs text-neutral-600 hover:text-neon-cyan transition-colors">
            browse all →
          </Link>
        </div>
        <TopRepos />
      </section>
    </div>
  );
}
