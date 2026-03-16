import Link from "next/link";
import { ArrowRight, Zap, Shield, Coins } from "lucide-react";
import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { SkillCard } from "@/components/skill-card";

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

async function TopSkills() {
  const db = getDb();

  const data = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
      repo: {
        starCount: repos.starCount,
        downloadCount: repos.downloadCount,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
      },
      owner: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(eq(skills.isPublished, true))
    .orderBy(desc(repos.starCount))
    .limit(6);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-neutral-600">
          <span className="text-neon-cyan/40">$</span> ls skills/<br />
          <span className="text-neutral-500 mt-1 block">// no skills published yet — be the first</span>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {data.map((skill) => (
        <SkillCard key={skill.id} {...skill} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ── Hero ──────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="mb-6 font-mono text-xs text-neutral-600">
            <span className="text-neon-cyan/60">~/skillshub</span> <span className="text-neutral-700">on</span> <span className="text-neon-lime/60">main</span> <span className="text-neutral-700">via</span> <span className="text-neon-orange/60">⬡ v0.1.0</span>
          </div>

          <h1 className="glitch-text mb-2 font-mono text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-neutral-100">The Registry for</span>
            <br />
            <span className="bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime bg-clip-text text-transparent">
              AI Agent Skills
            </span>
          </h1>

          <p className="mt-4 mb-8 max-w-xl text-sm text-neutral-500 leading-relaxed font-mono">
            discover, share & monetize skills for AI agents.
            <br />
            built by degens, for degens.
          </p>

          {/* Fake terminal */}
          <div className="mb-8 max-w-lg rounded border border-neutral-800/80 bg-[#0a0a0a] overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-800/50">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 font-mono text-[10px] text-neutral-600">terminal</span>
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed">
              <div className="text-neutral-500">
                <span className="text-neon-cyan">$</span> npx skillshub search &quot;web scraping&quot;
              </div>
              <div className="mt-1 text-neutral-600">
                <span className="text-neon-lime">found</span> 12 skills matching query
              </div>
              <div className="mt-2 text-neutral-500">
                <span className="text-neon-cyan">$</span> npx skillshub add haoran/web-scraper
              </div>
              <div className="mt-1 text-neutral-600">
                <span className="text-neon-lime">✓</span> installed web-scraper@1.2.0
              </div>
              <div className="mt-2 text-neutral-400">
                <span className="text-neon-cyan">$</span> <span className="cursor-blink text-neon-cyan">▋</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

      {/* ── Top Skills ────────────────────────── */}
      <section className="pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-sm text-neutral-400">
            <span className="text-neon-cyan/50">&gt;</span> top_skills <span className="text-neutral-600">--sort stars --limit 6</span>
          </h2>
          <Link href="/skills" className="font-mono text-xs text-neutral-600 hover:text-neon-cyan transition-colors">
            view all →
          </Link>
        </div>
        <TopSkills />
      </section>
    </div>
  );
}
