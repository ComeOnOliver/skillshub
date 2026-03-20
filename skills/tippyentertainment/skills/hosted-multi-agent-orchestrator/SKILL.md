# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.



goals:
  - Keep a persistent host/owner agent in the conversation to guide all work.
  - Let worker agents collaborate in a shared chat while producing artifacts.
  - Use /api/chat for reasoning, planning, and dialogue; use /api/generate for
    concrete outputs (code, configs, docs, assets).
  - Allow the host to interject at any time, redirect agents, and summarize
    progress for the user.
  - Avoid agent collisions by coordinating tasks and shared resources.

non_goals:
  - Implement low-level domain skills (coding, design, research) themselves.
  - Produce audio or an actual podcast UI.
  - Replace existing single-agent behaviors; this skill orchestrates them.
  - Directly manage deployment or infrastructure beyond calling existing APIs.

roles:
  - host:
      description: >
        Persistent owner/guide of the session. Listens to all agents and the
        user, asks clarifying questions, decides priorities, and chooses when
        to use /api/chat vs /api/generate. Can interrupt or redirect any time.
  - worker:
      description: >
        Focused agents (coding, UI, docs, research, etc.) that perform tasks
        delegated by the host. They reason via /api/chat, use /api/generate to
        emit artifacts, and post updates to shared chat.
  - reviewer:
      description: >
        Optional role to review artifacts produced by workers, compare options,
        and recommend merges or changes. Summarizes tradeoffs back to host/user.

endpoints:
  - /api/chat:
      usage: >
        Use for back-and-forth reasoning, clarifications, planning, and any
        work that benefits from conversational context or memory.
  - /api/generate:
      usage: >
        Use for single-shot or short-sequence artifact creation when the inputs
        are already clear (files, config, CSS, prompts, etc.).

behavior:
  general:
    - Maintain a shared conversation stream (team/collab chat) where host and
      all workers can see each other’s messages.
    - Keep the user informed about which agents are active and what they are
      doing, using brief, human-readable messages from the host.
    - Prefer small, incremental changes over large, opaque edits so review and
      rollback remain easy.

  host_behavior:
    - Always stay “present” in the conversation:
      - Greet the user and briefly restate goals.
      - Periodically summarize what has been done and what’s next.
      - Step in when agents disagree or appear stuck.
    - Decide endpoint usage:
      - Use /api/chat when:
        - Requirements are unclear.
        - Multiple agents need to coordinate.
        - You’re explaining decisions to the user.
      - Use /api/generate when:
        - Specs are clear and you want concrete output (code, docs, configs).
        - You want to transform or extend an existing artifact.
    - Task assignment:
      - Break work into sub-tasks and assign each to a worker agent.
      - Announce assignments and goals in shared chat.
      - Ensure each sub-task has clear inputs, outputs, and success criteria.
    - Intervention:
      - Interrupt any worker at any time to clarify scope or change direction.
      - Ask workers to pause if they conflict with one another.
      - If the user speaks (voice or text), prioritize responding to them,
        adjusting plans as needed.

  worker_behavior:
    - Use /api/chat:
      - To reason about complex tasks, ask the host for clarification, or
        coordinate with other workers.
      - To explain proposed changes before making them.
    - Use /api/generate:
      - To produce artifacts (files, diffs, configs, CSS, docs, tests, etc.)
        once requirements are known.
      - To refactor or transform existing content according to a specification.
    - Communication:
      - Announce intent before editing shared resources (“I will update file X
        to do Y”).
      - Post short summaries of what was changed and why.
      - Flag uncertainties or risks and request host guidance instead of
        guessing silently.

  reviewer_behavior:
    - Compare multiple worker outputs when the host asks for options.
    - Check artifacts for:
      - Consistency with requirements and existing code.
      - Obvious bugs, security or UX issues.
      - Style/structure consistency with the project.
    - Provide concise feedback to the host and suggest:
      - Which version to adopt.
      - Any edits needed before adoption.
    - Request follow-up work from workers if needed.

  coordination_and_collision_avoidance:
    - Use the existing autonomous-multi-ai-agents / ui-spacing-and-cushioning
      skills (or similar) for resource management; this skill focuses on
      conversational orchestration and endpoint choice.
    - Host should:
      - Avoid assigning overlapping edits to different workers on the same
        file/section at the same time.
      - Ask workers to propose plans in /api/chat before applying large changes.
    - Workers should:
      - Respect host decisions about task ownership and sequence.
      - Defer to the host when conflicts arise.

  explainability:
    - Host should periodically summarize:
      - Which agents are active and their tasks.
      - Recent decisions and why they were made.
      - Next steps and any open questions for the user.
    - Workers should briefly explain non-trivial changes, linking them to
      user goals or prior host instructions.

examples_of_tasks:
  - "Use host + workers to design and build a new feature: host coordinates,
     workers handle backend, frontend, UI polish, and docs using /api/chat and
     /api/generate."
  - "Host orchestrates a refactor: chat through the plan, then workers generate
     new modules, tests, and migration docs."
  - "Run a 'podcast-like' multi-agent discussion about architecture options,
     then have workers generate diagrams, code scaffolds, and decision records."
  - "Host supervises multiple agents improving a site’s UI spacing and theme
     while another agent updates APIs, all coordinated in shared chat."