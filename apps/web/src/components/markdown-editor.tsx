"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write markdown here...",
  minRows = 16,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setTab("write")}
          className={`px-4 py-2 font-mono text-xs transition-colors ${
            tab === "write"
              ? "border-b-2 border-neon-cyan text-neon-cyan bg-neutral-900"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 font-mono text-xs transition-colors ${
            tab === "preview"
              ? "border-b-2 border-neon-cyan text-neon-cyan bg-neutral-900"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full bg-transparent px-4 py-3 font-mono text-sm text-white outline-none resize-y placeholder:text-neutral-600"
        />
      ) : (
        <div className="min-h-[300px] px-4 py-3">
          {value ? (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-mono prose-code:text-neon-cyan prose-a:text-neon-cyan">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="font-mono text-sm text-neutral-600">
              Nothing to preview
            </p>
          )}
        </div>
      )}
    </div>
  );
}
