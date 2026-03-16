"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  repoId: string;
  initialCount: number;
  initialLiked?: boolean;
}

export function LikeButton({
  repoId,
  initialCount,
  initialLiked = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/repos/${repoId}/star`, {
        method: "POST",
      });

      if (!res.ok) {
        setLiked(liked);
        setCount(count);
        return;
      }

      const data = await res.json();
      setLiked(data.data.starred);
      setCount(data.data.starCount);
    } catch {
      setLiked(liked);
      setCount(count);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs transition-all disabled:opacity-50 ${
        liked
          ? "border-red-500/40 bg-red-500/5 text-red-400 pulse-glow"
          : "border-neutral-800/50 text-neutral-500 hover:border-red-500/30 hover:text-red-400 glow-box"
      }`}
    >
      <Heart
        className={`h-3.5 w-3.5 ${liked ? "fill-red-400 text-red-400" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}

// Keep backward-compatible export
export { LikeButton as StarButton };
