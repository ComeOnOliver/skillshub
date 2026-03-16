// Agent brand colors and simple SVG icons
const AGENTS = [
  {
    name: "AMP",
    color: "#00D4AA",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2L2 19h20L12 2zm0 4l7 11H5l7-11z" />
      </svg>
    ),
  },
  {
    name: "Antigravity",
    color: "#8B5CF6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Claude Code",
    color: "#D4A574",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" fillOpacity="0.9" />
      </svg>
    ),
  },
  {
    name: "ClawdBot",
    color: "#FF6B6B",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="9" cy="10" r="1.5" />
        <circle cx="15" cy="10" r="1.5" />
      </svg>
    ),
  },
  {
    name: "Cline",
    color: "#3B82F6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
      </svg>
    ),
  },
  {
    name: "Codex",
    color: "#10B981",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="3" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
        <path d="M7 8h10M7 12h6M7 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Cursor",
    color: "#FFFFFF",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M5 3l14 9-6 2-3 6-5-17z" />
      </svg>
    ),
  },
  {
    name: "Droid",
    color: "#F59E0B",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <rect x="5" y="10" width="14" height="10" rx="2" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
        <path d="M8 10V8a4 4 0 118 0v2" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="9.5" cy="14.5" r="1" />
        <circle cx="14.5" cy="14.5" r="1" />
      </svg>
    ),
  },
  {
    name: "Gemini",
    color: "#4285F4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
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
