import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "./search-bar";
import { getUser } from "@/lib/session";

async function UserNav() {
  const user = await getUser();

  if (!user) {
    return (
      <Link
        href="/api/auth/github"
        className="group rounded border border-neon-cyan/40 px-4 py-1.5 font-mono text-xs text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all glow-box"
      >
        <span className="text-neutral-500 group-hover:text-neon-cyan">$</span> login --github
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/skills/import"
        className="font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
      >
        +import
      </Link>
      <Link
        href="/dashboard"
        className="font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
      >
        ~/dashboard
      </Link>
      {user.avatarUrl ? (
        <Link href="/dashboard">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-7 w-7 rounded-full ring-1 ring-neutral-700 hover:ring-neon-cyan/50 transition-all"
          />
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 font-mono text-xs text-neon-cyan ring-1 ring-neutral-700"
        >
          {user.username.charAt(0).toUpperCase()}
        </Link>
      )}
    </div>
  );
}

export function Nav() {
  return (
    <header className="border-b border-neutral-800/60 bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-1.5 font-mono text-base font-bold text-neutral-100 hover:text-neon-cyan transition-colors">
            <span className="text-neon-cyan/70 group-hover:text-neon-cyan">&gt;_</span>
            <span>SkillsHub</span>
            <span className="cursor-blink text-neon-cyan ml-0.5 font-light">▋</span>
          </Link>
          {/* Network indicator */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-800/50">
            <span className="net-pulse h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="font-mono text-[10px] text-neutral-500">mainnet</span>
          </div>
        </div>
        <div className="mx-6 flex-1 max-w-sm">
          <Suspense fallback={<div className="h-9" />}>
            <SearchBar />
          </Suspense>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/skills"
            className="font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
          >
            /browse
          </Link>
          <Suspense
            fallback={
              <div className="h-7 w-16 animate-pulse rounded bg-neutral-800/50" />
            }
          >
            <UserNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
