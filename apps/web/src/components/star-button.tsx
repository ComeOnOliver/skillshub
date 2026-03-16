"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarButtonProps {
  repoId: string;
  initialCount: number;
  initialStarred?: boolean;
}

export function StarButton({
  repoId,
  initialCount,
  initialStarred = false,
}: StarButtonProps) {
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    // Optimistic update
    setStarred(!starred);
    setCount(starred ? count - 1 : count + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/repos/${repoId}/star`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert on error
        setStarred(starred);
        setCount(count);
        return;
      }

      const data = await res.json();
      setStarred(data.data.starred);
      setCount(data.data.starCount);
    } catch {
      // Revert on error
      setStarred(starred);
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
        starred
          ? "border-neon-yellow/40 bg-neon-yellow/5 text-neon-yellow pulse-glow"
          : "border-neutral-800/50 text-neutral-500 hover:border-neon-yellow/30 hover:text-neon-yellow glow-box"
      }`}
    >
      <Star
        className={`h-3.5 w-3.5 ${starred ? "fill-neon-yellow text-neon-yellow" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
