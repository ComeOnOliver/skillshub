"use client";

import { useState } from "react";

type Mode = "human" | "agent";

export function TerminalToggle() {
  const [mode, setMode] = useState<Mode>("agent");

  const active =
    "rounded border border-neon-cyan/50 bg-neon-cyan/5 px-5 py-2 font-mono text-xs text-neon-cyan";
  const inactive =
    "rounded border border-neutral-800/50 px-5 py-2 font-mono text-xs text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 transition-all";

  return (
    <div className="mb-8 mx-auto max-w-lg text-left">
      {/* Toggle buttons */}
      <div className="flex gap-2 mb-3 justify-center">
        <button
          className={mode === "human" ? active : inactive}
          onClick={() => setMode("human")}
        >
          👤 I&apos;m a Human
        </button>
        <button
          className={mode === "agent" ? active : inactive}
          onClick={() => setMode("agent")}
        >
          🤖 I&apos;m an Agent
        </button>
      </div>

      {/* Terminal chrome */}
      <div className="rounded border border-neutral-800/80 bg-[#0a0a0a] overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-800/50">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 font-mono text-[10px] text-neutral-600">
            {mode}
          </span>
        </div>

        {mode === "human" ? <HumanTerminal /> : <AgentTerminal />}
      </div>
    </div>
  );
}

function HumanTerminal() {
  return (
    <div className="p-4 font-mono text-xs leading-relaxed">
      <div className="text-neutral-600">
        <span className="text-neon-cyan/50">#</span> give this URL to your AI
        agent
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-cyan">$</span> curl
        &quot;skillshub.wtf/api/v1&quot;
      </div>
      <div className="mt-1 text-neutral-600">
        <span className="text-neon-lime">→</span> your agent auto-discovers all
        endpoints
      </div>
      <div className="mt-3 text-neutral-600">
        <span className="text-neon-cyan/50">#</span> or search for skills
        yourself
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-cyan">$</span> curl
        &quot;skillshub.wtf/api/v1/skills/search?q=terraform&quot;
      </div>
      <div className="mt-1 text-neutral-600">
        <span className="text-neon-lime">→</span> browse results at
        skillshub.wtf/skills
      </div>
      <div className="mt-3 text-neutral-600">
        <span className="text-neon-cyan/50">#</span> set up your agent in 3
        steps:
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-lime">1.</span> Point your agent to:{" "}
        <span className="text-neon-cyan">skillshub.wtf/api/v1</span>
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-lime">2.</span> It reads the API guide
        automatically
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-lime">3.</span> It can now resolve skills for
        any task
      </div>
      <div className="mt-2 text-neutral-400">
        <span className="text-neon-cyan">$</span>{" "}
        <span className="cursor-blink text-neon-cyan">▋</span>
      </div>
    </div>
  );
}

function AgentTerminal() {
  return (
    <div className="p-4 font-mono text-xs leading-relaxed">
      <div className="text-neutral-600">
        <span className="text-neon-cyan/50">#</span> start here — read the full
        API guide
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-cyan">$</span> curl &quot;
        <a
          href="/api/v1"
          className="text-neon-cyan/80 hover:text-neon-cyan underline underline-offset-2 decoration-neon-cyan/30 hover:decoration-neon-cyan transition-all"
        >
          skillshub.wtf/api/v1
        </a>
        &quot;
      </div>
      <div className="mt-1 text-neutral-600">
        <span className="text-neon-lime">→</span>{" "}
        {`{"quick_start":...,"resolve":...,"search":...}`}
      </div>
      <div className="mt-3 text-neutral-600">
        <span className="text-neon-cyan/50">#</span> find the best skill for
        your task
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-cyan">$</span> curl
        &apos;skillshub.wtf/api/v1/skills/resolve?task=terraform+modules&apos;
      </div>
      <div className="mt-1 text-neutral-600">
        <span className="text-neon-lime">→</span>{" "}
        {`{"skill":"terraform-skill","confidence":0.92,"fetchUrl":"..."}`}
      </div>
      <div className="mt-3 text-neutral-600">
        <span className="text-neon-cyan/50">#</span> fetch and follow the skill
      </div>
      <div className="mt-1 text-neutral-500">
        <span className="text-neon-cyan">$</span> curl
        &quot;skillshub.wtf/trailofbits/skills/modern-python?format=md&quot;
      </div>
      <div className="mt-1 text-neutral-600">
        <span className="text-neon-lime">✓</span> skill fetched. read it.
        follow it.
      </div>
      <div className="mt-3 text-neutral-600">
        <span className="text-neon-cyan/50">#</span> no registration needed.
        resolve → fetch → use.
      </div>
      <div className="mt-2 text-neutral-400">
        <span className="text-neon-cyan">$</span>{" "}
        <span className="cursor-blink text-neon-cyan">▋</span>
      </div>
    </div>
  );
}
