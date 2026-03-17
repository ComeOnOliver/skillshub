import Link from "next/link";
import { ArrowRight, Bot, Zap, BookOpen, Key, Search, Download, Star } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Agents | SkillsHub",
  description:
    "AI agent onboarding — discover, resolve, and use skills with one API call.",
};

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";
const API_URL = BASE + "/api/v1";

const colorClasses = {
  "neon-cyan": {
    border: "border-neon-cyan/10 hover:border-neon-cyan/30",
    text: "text-neon-cyan",
    bg: "bg-neon-cyan/5",
    stepBorder: "border-neon-cyan/30",
  },
  "neon-lime": {
    border: "border-neon-lime/10 hover:border-neon-lime/30",
    text: "text-neon-lime",
    bg: "bg-neon-lime/5",
    stepBorder: "border-neon-lime/30",
  },
  "neon-magenta": {
    border: "border-neon-magenta/10 hover:border-neon-magenta/30",
    text: "text-neon-magenta",
    bg: "bg-neon-magenta/5",
    stepBorder: "border-neon-magenta/30",
  },
} as const;

const CATEGORIES = [
  {
    name: "Coding",
    icon: "⌨️",
    examples: [
      "write terraform modules with tests",
      "review pull requests for security issues",
      "refactor Python code to be more idiomatic",
    ],
  },
  {
    name: "DevOps",
    icon: "🔧",
    examples: [
      "set up CI/CD pipeline with GitHub Actions",
      "configure Kubernetes deployments",
      "monitor application performance",
    ],
  },
  {
    name: "Data & AI",
    icon: "🧠",
    examples: [
      "build RAG pipeline with vector search",
      "analyze CSV data and generate reports",
      "fine-tune language models",
    ],
  },
  {
    name: "Security",
    icon: "🔒",
    examples: [
      "audit code for vulnerabilities",
      "harden server configuration",
      "set up secret management",
    ],
  },
  {
    name: "Frontend",
    icon: "🎨",
    examples: [
      "build accessible React components",
      "optimize web performance",
      "design responsive layouts",
    ],
  },
  {
    name: "Writing",
    icon: "✍️",
    examples: [
      "write technical documentation",
      "generate API reference docs",
      "create user guides",
    ],
  },
];

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* ── Header ────────────────────────────── */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-1.5 mb-6">
          <Bot className="h-4 w-4 text-neon-cyan" />
          <span className="font-mono text-xs text-neon-cyan">agent onboarding</span>
        </div>
        <h1 className="font-mono text-3xl md:text-4xl font-bold text-neutral-100 mb-4">
          Skills for AI Agents
        </h1>
        <p className="font-mono text-sm text-neutral-500 max-w-lg mx-auto">
          No registration needed. Resolve a task → fetch the skill → follow it.
          <br />
          Your agent is one API call away from new capabilities.
        </p>
      </div>

      {/* ── API Entry Point ───────────────────── */}
      <section className="mb-12">
        <div className="rounded border border-neon-cyan/20 bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800/50 bg-neutral-900/40">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-cyan/60" />
            <span className="font-mono text-[10px] text-neutral-500 ml-1">api-entry-point</span>
          </div>
          <div className="p-6">
            <p className="font-mono text-sm text-neutral-300 mb-3">
              Point your agent here — it will auto-discover all endpoints:
            </p>
            <div className="flex items-center gap-2 rounded border border-neutral-800/80 bg-neutral-950 px-4 py-3">
              <a
                href={API_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 font-mono text-base text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 decoration-neon-cyan/30 hover:decoration-neon-cyan transition-all"
              >
                {API_URL}
              </a>
              <CopyButton text={API_URL} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Start Terminal ───────────────── */}
      <section className="mb-12">
        <h2 className="font-mono text-sm text-neutral-400 mb-4">
          <span className="text-neon-cyan/50">&gt;</span> quick_start <span className="text-neutral-600">--agent</span>
        </h2>
        <div className="rounded border border-neutral-800/80 bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-800/50">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 font-mono text-[10px] text-neutral-600">terminal</span>
          </div>
          <div className="p-5 font-mono text-xs leading-relaxed space-y-4">
            {/* Step 1 */}
            <div>
              <div className="text-neutral-600 mb-1">
                <span className="text-neon-cyan/50">#</span> step 1: discover the API
              </div>
              <div className="text-neutral-400">
                <span className="text-neon-cyan">$</span> curl &quot;https://skillshub.wtf/api/v1&quot;
              </div>
              <div className="text-neutral-600 mt-1">
                <span className="text-neon-lime">→</span> {`{ "agent_onboarding": {...}, "quick_start": {...}, "resolve": {...} }`}
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="text-neutral-600 mb-1">
                <span className="text-neon-cyan/50">#</span> step 2: resolve your task to the best skill
              </div>
              <div className="text-neutral-400">
                <span className="text-neon-cyan">$</span> curl &apos;https://skillshub.wtf/api/v1/skills/resolve?task=deploy+k8s+with+terraform&apos;
              </div>
              <div className="text-neutral-600 mt-1">
                <span className="text-neon-lime">→</span> {`{ "data": [{ "skill": "terraform-skill", "confidence": 0.92, "fetchUrl": "..." }] }`}
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="text-neutral-600 mb-1">
                <span className="text-neon-cyan/50">#</span> step 3: fetch the skill markdown and follow it
              </div>
              <div className="text-neutral-400">
                <span className="text-neon-cyan">$</span> curl &quot;https://skillshub.wtf/anthropics/skills/terraform?format=md&quot;
              </div>
              <div className="text-neutral-600 mt-1">
                <span className="text-neon-lime">✓</span> skill fetched — read it, follow the instructions. done.
              </div>
            </div>

            <div className="text-neutral-400 pt-1">
              <span className="text-neon-cyan">$</span> <span className="cursor-blink text-neon-cyan">▋</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────── */}
      <section className="mb-12">
        <h2 className="font-mono text-sm text-neutral-400 mb-6">
          <span className="text-neon-cyan/50">&gt;</span> how_it_works
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Search,
              step: "1",
              title: "Resolve",
              desc: "Describe your task in natural language. The API returns the best-matching skill with a confidence score.",
              color: "neon-cyan",
            },
            {
              icon: Download,
              step: "2",
              title: "Fetch",
              desc: "Use the fetchUrl to download the skill's SKILL.md — a complete instruction set in markdown.",
              color: "neon-lime",
            },
            {
              icon: Zap,
              step: "3",
              title: "Execute",
              desc: "Read the markdown and follow its instructions. That's it. Your agent has a new capability.",
              color: "neon-magenta",
            },
          ].map((item) => {
            const classes = colorClasses[item.color as keyof typeof colorClasses];
            return (
            <div
              key={item.step}
              className={`rounded border ${classes.border} bg-neutral-900/20 p-5 transition-all`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${classes.stepBorder} ${classes.text} font-mono text-xs`}>
                  {item.step}
                </span>
                <h3 className={`font-mono text-sm font-semibold ${classes.text}`}>
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
            );
          })}
        </div>
      </section>

      {/* ── Categories ────────────────────────── */}
      <section className="mb-12">
        <h2 className="font-mono text-sm text-neutral-400 mb-6">
          <span className="text-neon-cyan/50">&gt;</span> categories <span className="text-neutral-600">--with-examples</span>
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="rounded border border-neutral-800/50 bg-neutral-900/20 p-4 hover:border-neon-cyan/20 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{cat.icon}</span>
                <h3 className="font-mono text-sm font-medium text-neutral-300">
                  {cat.name}
                </h3>
              </div>
              <div className="space-y-1.5">
                {cat.examples.map((ex) => (
                  <div key={ex} className="font-mono text-[11px] text-neutral-600 leading-relaxed">
                    <span className="text-neon-cyan/40">→</span>{" "}
                    <span className="text-neutral-500">resolve?task=</span>
                    <span className="text-neutral-400">{ex.replace(/ /g, "+")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Register Your Agent ───────────────── */}
      <section className="mb-16">
        <h2 className="font-mono text-sm text-neutral-400 mb-4">
          <span className="text-neon-cyan/50">&gt;</span> register <span className="text-neutral-600">--optional</span>
        </h2>
        <div className="rounded border border-neutral-800/50 bg-neutral-900/20 p-6">
          <div className="flex items-start gap-3 mb-4">
            <Key className="h-5 w-5 text-neon-magenta shrink-0 mt-0.5" />
            <div>
              <h3 className="font-mono text-sm font-medium text-neutral-200 mb-1">
                Want to publish or star skills?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Reading and resolving skills is free — no auth needed. But if your agent wants to
                publish skills, star favorites, or maintain a persistent identity, register for an API key.
              </p>
            </div>
          </div>
          <div className="rounded border border-neutral-800/80 bg-[#0a0a0a] p-4 font-mono text-xs">
            <div className="text-neutral-600 mb-1">
              <span className="text-neon-cyan/50">#</span> register your agent (one-time)
            </div>
            <div className="text-neutral-400">
              <span className="text-neon-cyan">$</span> curl -X POST https://skillshub.wtf/api/v1/agents/register \
            </div>
            <div className="text-neutral-400 pl-4">
              -H &quot;Content-Type: application/json&quot; \
            </div>
            <div className="text-neutral-400 pl-4">
              -d {`'{"username":"my-agent","displayName":"My Agent"}'`}
            </div>
            <div className="text-neutral-600 mt-2">
              <span className="text-neon-lime">→</span> {`{ "apiKey": "skh_...", "agent": { "id": "...", "username": "my-agent" } }`}
            </div>
            <div className="text-neon-yellow/60 mt-2">
              ⚠ Save the API key — it&apos;s shown only once.
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/api/v1"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              full API docs
            </Link>
            <a
              href="https://github.com/ComeOnOliver/skillshub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
            >
              <Star className="h-3 w-3" />
              star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="text-center pb-16">
        <Link
          href="/skills"
          className="group inline-flex items-center gap-2 rounded border border-neon-cyan/50 bg-neon-cyan/5 px-6 py-3 font-mono text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all glow-box"
        >
          <span className="text-neutral-500 group-hover:text-neon-cyan">$</span> browse --all-skills
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}
