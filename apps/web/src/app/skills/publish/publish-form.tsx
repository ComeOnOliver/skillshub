"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const tags = (form.get("tags") as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const body = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      readme: form.get("readme"),
      tags,
    };

    try {
      const res = await fetch("/api/skills/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to publish");
      }

      const data = await res.json();
      // Redirect to the skill's canonical URL
      if (data.data.slug) {
        router.push(`/dashboard/skills`);
      } else {
        router.push(`/skills/${data.data.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Name</label>
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-neutral-500"
          placeholder="My Awesome Skill"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Slug</label>
        <input
          name="slug"
          required
          minLength={2}
          maxLength={100}
          pattern="^[a-z0-9-]+$"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-neutral-500"
          placeholder="my-awesome-skill"
        />
        <p className="mt-1 text-xs text-neutral-400">
          URL-friendly name. Only lowercase letters, numbers, and hyphens.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          maxLength={500}
          rows={2}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-neutral-500"
          placeholder="A brief description of what your skill does..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Tags (comma-separated)
        </label>
        <input
          name="tags"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-neutral-500"
          placeholder="ai, scraping, data"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          README (Markdown)
        </label>
        <textarea
          name="readme"
          rows={12}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-neutral-500"
          placeholder="# My Skill&#10;&#10;Describe your skill in detail..."
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Skill"}
      </button>
    </form>
  );
}
