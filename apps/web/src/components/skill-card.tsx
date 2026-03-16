import Link from "next/link";
import { Star, Download } from "lucide-react";

interface SkillCardProps {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tags: string[];
  repo: {
    starCount: number;
    downloadCount: number;
    githubOwner: string | null;
    githubRepoName: string | null;
  };
  owner: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export function SkillCard({
  id,
  slug,
  name,
  description,
  tags,
  repo,
  owner,
}: SkillCardProps) {
  const href = repo.githubOwner && repo.githubRepoName
    ? `/${repo.githubOwner}/${repo.githubRepoName}/${slug}`
    : `/skills/${owner.username}/${slug}`;

  return (
    <Link
      href={href}
      className="group block rounded border border-neutral-800/50 bg-neutral-900/20 p-4 transition-all hover:border-neon-cyan/30 hover:bg-neutral-900/40 glow-box"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {owner.avatarUrl && (
            <img
              src={owner.avatarUrl}
              alt={owner.username}
              className="h-5 w-5 rounded-full shrink-0 ring-1 ring-neutral-800"
            />
          )}
          <h3 className="font-mono text-sm font-medium text-neutral-200 group-hover:text-neon-cyan transition-colors truncate">
            <span className="text-neutral-600 group-hover:text-neon-cyan/50">&gt;</span>{" "}
            {name}
          </h3>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-600 shrink-0">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.starCount}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {repo.downloadCount}
          </span>
        </div>
      </div>
      {description && (
        <p className="mb-3 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-neon-cyan/40"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] text-neutral-700 shrink-0">
          {owner.username}
        </span>
      </div>
    </Link>
  );
}
