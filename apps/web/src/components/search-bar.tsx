"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input when URL changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function navigate(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/skills?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate(value);
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(query);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neon-cyan/40 pointer-events-none select-none">
        &gt;
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="search skills..."
        className="w-full rounded border border-neutral-800/60 bg-neutral-900/50 py-2 pl-7 pr-4 font-mono text-xs text-neon-cyan placeholder-neutral-600 outline-none focus:border-neon-cyan/30 focus:bg-neutral-900/80 transition-all"
      />
    </form>
  );
}
