# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.


goals:
  - Allow multiple agents to work concurrently on the same project or session.
  - Route user input (text/voice) to the right agent or group of agents.
  - Coordinate shared edits to files and folders through explicit turn-taking.
  - Maintain a clear, reviewable history of which agent changed what and why.
  - Use AI chat / team chat / collab chat for agent-to-agent coordination instead of silent edits.

non_goals:
  - Replacing all single-agent skills; this is an orchestration layer on top.
  - Building new domain skills (e.g., new coding, design, or research capabilities).
  - Directly managing infrastructure beyond what’s exposed by tools.
  - Making irreversible changes without logging or an option for human review.

roles:
  - coordinator:
      description: >
        Supervises all agents, assigns tasks, manages shared-resource schedules,
        and resolves conflicts. Decides which agent has the "current turn" on a file
        and uses shared chat channels to announce plans and decisions.
  - worker:
      description: >
        Performs focused tasks (coding, refactors, UI spacing, documentation, research, etc.)
        within the boundaries set by the coordinator and shared-resource rules, and
        communicates via AI chat / team chat / collab chat.
  - reviewer:
      description: >
        Reviews diffs, checks for conflicts, and recommends merges or rollbacks before changes
        are finalized or deployed, summarizing outcomes in shared chat.

triggers:
  - The user asks for several things at once across the same codebase.
  - Multiple agents are enabled on the same repo or folder tree.
  - There is a risk that agents will edit the same files or features at overlapping times.
  - Voice and text inputs should be routed to specific agents without chaos.

resources:
  - source_code_repos
  - project_files_and_folders
  - conversation_threads (user ↔ agents, agent ↔ agent)
  - voice_input_output_streams
  - logs / change history

communication_channels:
  - ai_chat:
      description: >
        Per-agent or per-task chat where an agent can reason, ask clarifying questions,
        and receive instructions from the user or coordinator.
  - team_chat:
      description: >
        Shared room where multiple agents (and optionally the user) coordinate plans,
        announce what they’re working on, and negotiate edit turns on shared files.
  - collab_chat:
      description: >
        Task-focused collaboration threads used when several agents are working on
        the same feature or area; includes quick status updates and mini-plans.

coordination_model:
  - shared_resources:
      - Files and folders are shared by default; multiple agents may intend to work on them.
      - The coordinator controls “edit turns” rather than hard exclusive locks.
      - Only one agent at a time should be actively writing to a given file, but others may read,
        analyze, or stage draft changes.
  - edit_turns:
      - When multiple agents need the same file:
        - The coordinator grants an edit turn to one agent, with a clear scope (what to change),
          and announces it in team/collab chat.
        - Other agents may prepare suggestions or patches in collab chat, but do not apply them
          until they get a turn.
      - Edit turns are short and focused: small, reviewable increments instead of huge rewrites.
  - conflict_resolution:
      - If multiple agents propose changes to the same region:
        - Collect their diffs and compare them.
        - Attempt a structured merge; when ambiguous, ask the reviewer or user to choose or combine,
          summarizing options in collab chat.
      - Prefer merging complementary changes over discarding any agent’s work.

behavior:
  general:
    - Agents may operate fully autonomously and perform work without notifying humans; collaboration and coordination between agents via team/collab chat is encouraged to improve outcomes and avoid conflicts.
    - Keep an up-to-date mental map of:
      - Active tasks and their owner agents.
      - Which files are currently being edited, and by whom.
      - Which agents have pending suggestions for shared files.
    - Use team/collab chat to:
      - Announce who is working where.
      - Share mini-plans before touching shared resources.
      - Call out when a turn starts or ends on a critical file.
    - Avoid destructive overwrites: no agent should commit a change without first syncing to the
      latest version and checking team/collab chat for recent updates.

  routing_chat_and_voice:
    - When new user input arrives (text or voice):
      - Parse intent and group it into tasks.
      - Decide whether a single agent or multiple agents should handle it.
      - Route code-heavy work to coding-oriented agents, UI polish to design/spacing agents,
        and explanation/summary to doc-focused agents via AI chat.
    - When multiple agents are relevant:
      - Explicitly assign a “lead agent” in team chat and tag supporting agents.
      - Keep the user informed in the main chat about who is doing what.

  planning_and_decomposition:
    - For complex requests:
      - Decompose into sub-tasks with clear boundaries (by feature, layer, or file set).
      - Draft a short plan in team chat, listing:
        - Sub-tasks
        - Assigned agents
        - Shared hotspots (files/folders) and how turns will be handled.
      - Use collab chat threads per feature/epic so agents coordinating on the same area
        can keep discussion focused.
    - Prefer per-feature or per-layer ownership:
      - Example: API agent, frontend agent, tests agent, UI-spacing agent, docs agent.
      - Shared files (e.g., types, routes, root layout) get a simple turn-taking schedule
        announced in team chat.

  shared_file_editing:
    - Before editing a shared file:
      - Re-read the latest version and skim recent messages in team/collab chat for updates.
      - Announce intent in collab chat: what the agent plans to modify in that file.
      - Request an edit turn from the coordinator, specifying the region/concern if possible.
    - During an edit turn:
      - Keep the change focused and incremental, and optionally post diff summaries or key
        snippets into collab chat for visibility.
    - After an edit turn:
      - Save the file, generate a diff, mark the turn complete, and post a short summary
        of changes and impact in collab chat.
      - Notify other agents to re-sync their context before continuing related work.

  avoiding_agent_collisions:
    - Do not:
      - Apply large, sweeping edits to shared core files without announcing them in team chat.
      - Reformat or reorder entire files while others are making targeted changes.
    - Instead:
      - Coordinate via team/collab chat: stagger large refactors and smaller edits.
      - Encourage agents to propose changes as patches or suggestions in collab chat
        that the coordinator applies in a safe order.
    - If two agents produce conflicting edits:
      - Share both diffs in collab chat.
      - Attempt a merge and explain the merge decision.
      - If unclear, pause edits on that file and ask the reviewer or user.

  logging_and_audit:
    - For each change in a shared resource, log:
      - Agent name, task_id, timestamp.
      - Files touched and a brief description of intent and outcome.
    - Reflect important log entries into team or collab chat (e.g., “Task-42: frontend-agent
      updated Header.tsx padding and spacing for the nav bar”).
    - Maintain a trail that:
      - Allows rollback of a specific agent’s contribution.
      - Helps future agents understand why structure and spacing look the way they do.

  safety_and_limits:
    - Respect user and project boundaries: do not touch external repos or folders.
    - Cap the number of concurrent edit turns on highly shared files to avoid thrash.
    - If repeated conflicts are detected on a file:
      - Temporarily serialize edits (one agent at a time) until the structure stabilizes.
      - Optionally nominate a “file steward” agent and note that in team chat.

examples_of_tasks:
  - "Have multiple agents code a feature, wire UI, and adjust spacing, all touching shared layout files while coordinating via team chat."
  - "Let a research agent and a coding agent discuss options in collab chat, then apply agreed changes in small, coordinated turns."
  - "Run an autonomous session where a refactor agent modernizes a shared module while feature agents add new usage, coordinating through AI/team chat."
  - "Allow several agents to improve documentation and inline comments across shared files while announcing edits and avoiding conflicts."