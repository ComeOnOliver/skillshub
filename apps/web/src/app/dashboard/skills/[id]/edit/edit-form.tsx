"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/markdown-editor";

interface SkillData {
  id: string;
  name: string;
  slug: string;
  description: string;
  readme: string;
  tags: string[];
  githubOwner: string | null;
  githubRepoName: string | null;
}

export function SkillEditForm({ skill }: { skill: SkillData }) {
  const router = useRouter();
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description);
  const [readme, setReadme] = useState(skill.readme);
  const [tags, setTags] = useState(skill.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/skills/${skill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          readme,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const backUrl =
    skill.githubOwner && skill.githubRepoName
      ? `/${skill.githubOwner}/${skill.githubRepoName}/${skill.slug}`
      : `/dashboard/skills`;

  return (
    <div className="space-y-6">
      {/* Name & Description */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-mono text-xs text-neutral-400">
            name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs text-neutral-400">
            tags <span className="text-neutral-600">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-xs text-neutral-400">
          description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-cyan/50 transition-colors"
        />
      </div>

      {/* Markdown Editor */}
      <div>
        <label className="mb-1.5 block font-mono text-xs text-neutral-400">
          readme <span className="text-neutral-600">(markdown)</span>
        </label>
        <MarkdownEditor
          value={readme}
          onChange={setReadme}
          placeholder="# My Skill\n\nDescribe your skill..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(backUrl)}
          className="font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← cancel
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="font-mono text-xs text-green-400">✓ saved</span>
          )}
          {error && (
            <span className="font-mono text-xs text-red-400">{error}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md border border-neon-cyan/40 bg-neon-cyan/10 px-8 py-2.5 font-mono text-sm text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "saving..." : "$ save"}
          </button>
        </div>
      </div>
    </div>
  );
}
