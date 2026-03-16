"use client";

import { useState } from "react";
import { Key, Trash2, Pencil, Check, X } from "lucide-react";
import { revokeApiKey, renameApiKey } from "./actions";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export function KeyItem({ item }: { item: ApiKeyItem }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    setLoading(true);
    try {
      await revokeApiKey(item.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRename() {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      await renameApiKey(item.id, editName);
      setEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${
        item.revokedAt
          ? "border-red-800 bg-red-900/20"
          : "border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <Key className="h-4 w-4 text-neutral-400" />
        <div>
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-sm text-white outline-none focus:border-neutral-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setEditName(item.name);
                  }
                }}
              />
              <button
                onClick={handleRename}
                disabled={loading}
                className="rounded p-1 hover:bg-neutral-800"
              >
                <Check className="h-3.5 w-3.5 text-green-600" />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditName(item.name);
                }}
                className="rounded p-1 hover:bg-neutral-800"
              >
                <X className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </div>
          ) : (
            <p className="font-medium">{item.name}</p>
          )}
          <p className="font-mono text-xs text-neutral-500">
            {item.keyPrefix}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right text-xs text-neutral-500">
          {item.revokedAt ? (
            <span className="text-red-400">Revoked</span>
          ) : (
            <>
              <p>
                Created {new Date(item.createdAt).toLocaleDateString()}
              </p>
              {item.lastUsedAt && (
                <p>
                  Last used{" "}
                  {new Date(item.lastUsedAt).toLocaleDateString()}
                </p>
              )}
            </>
          )}
        </div>
        {!item.revokedAt && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              disabled={loading || editing}
              className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              title="Rename"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="rounded p-1.5 text-neutral-400 hover:bg-red-900/30 hover:text-red-400"
              title="Revoke"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
