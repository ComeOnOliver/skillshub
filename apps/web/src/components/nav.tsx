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
            <span className="font-mono text-[10px] text-neutral-500">live</span>
          </div>
        </div>
        <div className="mx-6 flex-1 max-w-sm">
          <Suspense fallback={<div className="h-9" />}>
            <SearchBar />
          </Suspense>
        </div>
        <nav className="flex items-center gap-4">
          <a
            href="https://github.com/ComeOnOliver/skillshub"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded border border-neutral-800/60 px-3 py-1 font-mono text-[11px] text-neutral-500 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
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
