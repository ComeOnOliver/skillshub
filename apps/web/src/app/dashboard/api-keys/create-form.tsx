"use client";

import { useState } from "react";
import { Plus, Copy, Check } from "lucide-react";
import { createApiKey } from "./actions";

export function CreateApiKeyForm() {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createApiKey(name);
      setNewKey(result.key);
      setName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-neutral-700 p-6">
      <h2 className="mb-4 text-lg font-semibold">Create API Key</h2>

      {newKey ? (
        <div className="rounded-lg border border-green-700 bg-green-900/30 p-4">
          <p className="mb-2 text-sm font-medium text-green-300">
            API key created! Copy it now — it won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-neutral-900 px-3 py-2 font-mono text-sm">
              {newKey}
            </code>
            <button
              onClick={handleCopy}
              className="rounded-md border border-neutral-700 p-2 hover:bg-neutral-800"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-sm text-green-400 hover:underline"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g., my-agent)"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white outline-none focus:border-neutral-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
