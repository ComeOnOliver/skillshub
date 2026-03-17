// Agent brand colors and recognizable SVG icons
const AGENTS = [
  {
    name: "Claude Code",
    color: "#D4A574",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Anthropic-inspired sparkle/starburst mark */}
        <path
          d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    ),
  },
  {
    name: "Codex",
    color: "#10B981",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* OpenAI-inspired hexagonal mark */}
        <path
          d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M12 6L16.33 8.5V13.5L12 16L7.67 13.5V8.5L12 6Z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
    ),
  },
  {
    name: "Cursor",
    color: "#FFFFFF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Cursor arrow pointer */}
        <path
          d="M5.5 3L19.5 12L13 14L10 20.5L5.5 3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Gemini",
    color: "#4285F4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Gemini-inspired four-pointed star */}
        <path
          d="M12 2C12 2 14.5 8.5 17 11C19.5 13.5 22 12 22 12C22 12 19.5 14.5 17 17C14.5 19.5 12 22 12 22C12 22 9.5 19.5 7 17C4.5 14.5 2 12 2 12C2 12 4.5 13.5 7 11C9.5 8.5 12 2 12 2Z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
    ),
  },
  {
    name: "Cline",
    color: "#3B82F6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Code angle brackets */}
        <path
          d="M9 6L3 12L9 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 6L21 12L15 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "GitHub Copilot",
    color: "#FFFFFF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Copilot-inspired dual-lens/glasses mark */}
        <path
          d="M3 14C3 14 5 8 12 8C19 8 21 14 21 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="8.5" cy="14" r="3" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.3" />
        <circle cx="15.5" cy="14" r="3" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.3" />
        <path d="M11.5 14H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Windsurf",
    color: "#06B6D4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Wave/surf icon */}
        <path
          d="M2 16C4 13 6 12 8 13C10 14 12 16 14 14C16 12 18 10 22 12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M2 20C4 17 6 16 8 17C10 18 12 20 14 18C16 16 18 14 22 16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M10 12L10 4L18 10"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    ),
  },
  {
    name: "OpenClaw",
    color: "#FF6B35",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Claw/pincer icon */}
        <path
          d="M7 4C5 4 3 6 3 9C3 12 5 13 7 13"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M17 4C19 4 21 6 21 9C21 12 19 13 17 13"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M7 13C7 13 8 17 12 20C16 17 17 13 17 13"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8" />
      </svg>
    ),
  },
  {
    name: "Antigravity",
    color: "#8B5CF6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {/* Stylized 'A' with upward motion lines */}
        <path
          d="M12 3L5 21H9L10.5 17H13.5L15 21H19L12 3Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path d="M10.8 14L12 10L13.2 14H10.8Z" fill="#050505" />
        <path d="M5 6L5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M19 6L19 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
];

export function AgentLogos() {
  return (
    <section className="mb-16 overflow-hidden">
      <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
        available for these agents
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050505] to-transparent" />
        <div className="flex animate-scroll-x gap-6">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 gap-6">
              {AGENTS.map((agent) => (
                <div
                  key={`${setIdx}-${agent.name}`}
                  className="flex shrink-0 items-center gap-2.5 rounded border border-neutral-800/30 bg-neutral-900/20 px-5 py-3 transition-all hover:border-neutral-700/50 hover:bg-neutral-900/40 group"
                  style={{ "--agent-color": agent.color } as React.CSSProperties}
                >
                  <span
                    className="opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ color: agent.color }}
                  >
                    {agent.icon}
                  </span>
                  <span
                    className="font-mono text-sm font-medium opacity-50 group-hover:opacity-90 transition-opacity"
                    style={{ color: agent.color }}
                  >
                    {agent.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
