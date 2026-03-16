import { Star, Download, Calendar, ExternalLink, BadgeCheck } from "lucide-react";
import { formatCount } from "@/lib/utils";
import Link from "next/link";

interface SkillSidebarProps {
  weeklyInstalls: number;
  githubStars: number;
  createdAt: Date;
  githubRepoUrl: string | null;
  githubOwner: string | null;
  githubRepoName: string | null;
  tags: string[];
  owner: {
    username: string;
    isVerified: boolean;
  };
  skillId: string;
  starButton: React.ReactNode;
  donateButton: React.ReactNode;
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const blocks = Math.round(pct / 10);
  return (
    <span className={`font-mono text-[10px] ${color}`}>
      {"█".repeat(blocks)}
      <span className="text-neutral-800">{"░".repeat(10 - blocks)}</span>
    </span>
  );
}

export function SkillSidebar({
  weeklyInstalls,
  githubStars,
  createdAt,
  githubRepoUrl,
  githubOwner,
  githubRepoName,
  tags,
  owner,
  starButton,
  donateButton,
}: SkillSidebarProps) {
  // Use reasonable max for bars
  const maxInstalls = Math.max(weeklyInstalls, 100);
  const maxGhStars = Math.max(githubStars, 50);

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        {starButton}
        {donateButton}
      </div>

      {/* Statistics */}
      <div className="rounded border border-neutral-800/40 bg-neutral-900/20 p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
          ┌ stats
        </h3>
        <div className="space-y-3">
          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 font-mono text-neutral-500">
                <Download className="h-3 w-3" />
                installs/wk
              </span>
              <span className="font-mono font-semibold text-neon-lime">
                {formatCount(weeklyInstalls)}
              </span>
            </div>
            <StatBar value={weeklyInstalls} max={maxInstalls} color="text-neon-lime/60" />
          </div>
          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 font-mono text-neutral-500">
                <Star className="h-3 w-3" />
                gh stars
              </span>
              <span className="font-mono font-semibold text-neon-yellow">
                {formatCount(githubStars)}
              </span>
            </div>
            <StatBar value={githubStars} max={maxGhStars} color="text-neon-yellow/60" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-mono text-neutral-500">
              <Calendar className="h-3 w-3" />
              first seen
            </span>
            <span className="font-mono text-neutral-400">
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="mt-3 font-mono text-[10px] text-neutral-800">
          └────────────
        </div>
      </div>

      {/* Repository */}
      {githubRepoUrl && githubOwner && githubRepoName && (
        <div className="rounded border border-neutral-800/40 bg-neutral-900/20 p-4">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
            ┌ repo
          </h3>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-neutral-400 hover:text-neon-cyan transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {githubOwner}/{githubRepoName}
          </a>
          <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-neutral-600">
            <span>by {owner.username}</span>
            {owner.isVerified && (
              <BadgeCheck className="h-3 w-3 text-neon-cyan" />
            )}
          </div>
          <div className="mt-2 font-mono text-[10px] text-neutral-800">
            └────────────
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rounded border border-neutral-800/40 bg-neutral-900/20 p-4">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
            ┌ tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/skills?tags=${tag}`}
                className="font-mono text-[10px] text-neon-cyan/40 hover:text-neon-cyan transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
          <div className="mt-2 font-mono text-[10px] text-neutral-800">
            └────────────
          </div>
        </div>
      )}
    </div>
  );
}
