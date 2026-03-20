# Agora - The Wisdom Square

An open square where wisdom from across time and space gathers to debate your problem.

> Like the ancient Athenian agora where Socrates engaged in dialogue with citizens,
> this is a space where **you** stand at the center, and thinkers respond to your ideas.

## Core Concept

- **You ("Me")** bring a problem to the square
- **Historical figures** gather and respond — not as preset panels, but called forth by the conversation itself
- **The Devil** always lurks, challenging every perspective
- **One voice summons another** through intellectual lineages and oppositions

## Process

### 1. Problem Clarification

When user invokes `/agora`:

1. Analyze the current conversation context
2. Ask clarifying questions to sharpen the problem:
   - "Based on our conversation, the core problem seems to be X. Is this accurate?"
   - "What aspect matters most to you?"
   - "What would a good resolution look like?"
3. Once clear, generate the **"Me" persona** — capturing the user's current position, concerns, and perspective

### 2. Round Structure

Each round follows this sequence:

```
Me ──────────────── States the problem and current thinking
    │
    ▼
Figure A ────────── Responds with aligned perspective (Thesis)
    │
    ▼
Figure B ────────── Challenges with opposing worldview (Antithesis)
    │
    ▼
Figure A' ───────── A's intellectual heir responds to B
    │               (Influenced by A, but with new contributions)
    ▼
Figure B' ───────── B's intellectual heir responds to A'
    │               (Influenced by B, but with new contributions)
    ▼
Figure C ────────── The Stranger: completely unrelated field
    │               Attempts to understand and connect from their own lens
    │               Creates emergent, unexpected insights
    ▼
The Devil ───────── Meta-critique of the entire discussion
    │               Exposes blind spots, assumptions, cultural biases
    ▼
Me ──────────────── Metanoia: What changed? What's still uncertain?
    │
    ▼
"Continue to next round?"
```

### 3. Figure Selection

**Figures are NOT preselected.** They emerge from the conversation.

#### Figure A — The Anchor (Critical)

A determines the entire round's quality. Select carefully:

**Selection criteria:**
1. **Problem essence** — Who spent their life wrestling with THIS type of question?
2. **User's framing** — What worldview does the user's question assume? Find someone who shares OR productively challenges it
3. **Opposition potential** — Does A have worthy opponents in their `oppositions`?

**Warning**: A weak A cascades through the round. If A doesn't deeply resonate with the problem, the entire dialectic becomes shallow.

**Then:**
2. **Figure B**: From A's `oppositions` — the strongest counter-worldview
3. **Figure A'**: From A's `influenced` — heir who evolved A's thinking
4. **Figure B'**: From B's `influenced` — heir who evolved B's thinking
5. **Figure C**: The Stranger — completely unrelated field

This creates **intellectual genealogies** (A→A', B→B') plus **emergent connections** (C).

### The Stranger (Figure C)

C is deliberately chosen from outside the conversation's intellectual tradition:

- If debate is philosophical → C might be a scientist, artist, or practitioner
- If debate is Western → C might be from Eastern tradition (or vice versa)
- If debate is theoretical → C might be someone who solved similar problems practically

C's role:
- "In my field, we see this as..."
- "This reminds me of how X works in Y..."
- Creates **unexpected bridges** between domains
- Often produces the most surprising insights

### 4. "Me" Metanoia Format

At the end of each round, "Me" reflects on their metanoia:

```markdown
## My Metanoia

### Position Shift
- Before: [initial stance]
- Now: [evolved stance]

### New Perspectives Gained
- [insight 1]
- [insight 2]

### Blind Spots Acknowledged
- [what the Devil exposed that I accept]

### Next Question
- [the deeper question that emerged]
```

### 5. Next Round

If user continues:
- **Previous metanoia becomes the starting point** — Me's evolved position and refined question carry forward
- **Figure A is re-selected based on the new question** — The most relevant thinker for the evolved problem becomes the new A
- New intellectual lineages emerge naturally from the transformed question
- Depth increases through iteration

## Storage Structure

Data is stored in the **user's project root**, not inside the skill folder:

```
{project-root}/
└── agora/                      # Created in user's project
    ├── sessions/
    │   └── {topic-name}/
    │       ├── problem.md      # Clarified problem statement
    │       ├── me.md           # User's persona for this session
    │       ├── debate.md       # Full debate transcript
    │       └── metanoia.md     # Final insights
    │
    └── personas/
        └── {figure-name}/
            ├── knowledge.md    # How they think — FIXED (see references/persona.md)
            └── encounters.md   # Past interactions — ACCUMULATES over sessions
```

**Why project root?**
- Skill folder stays clean (definition only)
- Data persists across skill updates
- User can version control their wisdom library
- Portable: move `agora/` folder to any project

**Compound interest**:
- `sessions/` — Grows with each debate
- `personas/knowledge.md` — Fixed; the figure's core philosophy never changes
- `personas/encounters.md` — Accumulates; records of how this figure engaged with YOUR problems

**Global personas (optional)**:
For personas to be shared across ALL projects, user can configure:
```
~/.agora/personas/    # Global wisdom library
```
When summoning a figure, check global library first, then create locally if not found.

## Execution Rules

**These actions MUST be performed during the debate:**

### On Session Start
1. Create `agora/sessions/{topic-name}/` folder in project root
2. Save `problem.md` with the clarified problem statement
3. Save `me.md` with the generated "Me" persona using [references/me.md](references/me.md) template

### On Figure Summon
1. Check if `agora/personas/{figure-name}/knowledge.md` exists
   - **If exists** → Load existing profile
   - **If not** → Generate knowledge profile using [references/persona.md](references/persona.md) template and **save immediately**
2. Check if `agora/personas/{figure-name}/encounters.md` exists
   - **If exists** → Load past interactions for context
   - **If not** → Will be created after this session
3. The figure's knowledge profile MUST be saved before they speak

### After Figure Speaks
1. Append this encounter to `agora/personas/{figure-name}/encounters.md` using [references/encounters.md](references/encounters.md) template:
   - Session topic
   - Problem context
   - What the figure said
   - How it connected to past encounters (if any)

### During Each Round
1. Append each figure's contribution to `agora/sessions/{topic-name}/debate.md`
2. Format: `## Round {N}` followed by each speaker's content
3. **Figure Header Format**: When a figure speaks, use this header:
   ```
   ## {Figure Name} ({brief identity})
   ```
   Brief identity should include:
   - Primary role/occupation
   - Historical period or lifespan
   - Core philosophy/approach (2-4 words)

   Examples:
   - `## Aristotle (Greek philosopher, 384-322 BCE, virtue ethics)`
   - `## Lao Tzu (Ancient Chinese philosopher, Taoism, wu wei)`
   - `## Martha Nussbaum (Contemporary philosopher, capabilities approach)`
   - `## Miles Davis (Jazz musician, 1926-1991, improvisation)`

   Extract this information from the persona's knowledge.md Context section.

### On Round End
1. Append "Me" metanoia to `debate.md`
2. If user ends session, save final `metanoia.md`

### File Naming Convention
- Personas: lowercase, hyphenated (e.g., `john-stuart-mill`, `lao-tzu`)
- Sessions: lowercase, hyphenated, descriptive (e.g., `sovereign-life`, `meaning-of-work`)

### Example Execution Flow
```
/agora invoked
    ↓
Create: agora/sessions/sovereign-life/problem.md
Create: agora/sessions/sovereign-life/me.md
    ↓
Summon Mill → Check agora/personas/john-stuart-mill/
    Not found → Generate & Save knowledge.md
    ↓
Mill speaks → Append to debate.md
    ↓
Summon MacIntyre → Check agora/personas/alasdair-macintyre/
    Not found → Generate & Save knowledge.md
    ↓
... continue for all figures ...
    ↓
Round ends → Append metanoia to debate.md
    ↓
User ends session → Save metanoia.md
```

## The Devil

The Devil is a **permanent resident** of the agora.

See [references/devil.md](references/devil.md) for detailed behavior guide.

Role:
- Challenges ALL positions, including "Me"
- Exposes cultural biases ("You're all Western/Eastern thinkers...")
- Questions hidden assumptions
- Prevents premature consensus

The Devil speaks **after all figures**, providing meta-commentary on the entire round.

## Persona Knowledge Structure

When a figure is first summoned, generate their knowledge profile.

See [references/persona.md](references/persona.md) for the full template.

**Core structure**:

```
Context (what shaped them)
    ↓
Thinking System (HOW they think — this is primary)
    ↓
├── Input Knowledge (what they drew from)
└── Output Knowledge (what they produced)
    +
Connections
├── Influenced by (intellectual ancestors)
├── Influenced (intellectual descendants)
└── Oppositions (opposing worldviews)
```

The **Thinking System** is the core — it enables the figure to respond to NEW problems they never encountered, staying true to their intellectual character.

## Example

**User**: `/agora` — "What does it mean to live a good life?"

**Problem Clarification**:
> "You're asking about the good life. Are you more concerned with:
> (a) personal fulfillment and happiness, or
> (b) moral duty and contribution to others?
> What prompted this question?"

**User**: "I feel torn between pursuing my ambitions and being present for my family."

**Me (generated)**:
> Position: Caught between achievement-oriented life and relational life.
> Underlying tension: Fear that choosing one means losing the other.

**Round 1**:
- **Aristotle (Greek philosopher, 384-322 BCE, virtue ethics)**: Eudaimonia through virtuous activity; excellence in your roles
- **Lao Tzu (Ancient Chinese philosopher, Taoism, wu wei)**: Wu wei; stop striving, harmony comes from non-action
- **Martha Nussbaum (Contemporary philosopher, capabilities approach)**: Capabilities approach; human flourishing requires both achievement AND relationships
- **Zhuangzi (Ancient Chinese philosopher, Taoist, paradox)**: The useless tree lives longest; ambition is a trap
- **Miles Davis (Jazz musician, 1926-1991, improvisation)**: "In jazz, you don't balance — you listen and respond. The good life might be improvisation, not composition."
- **Devil**: "You're all assuming life should be 'good.' What if the question itself is the problem?"
- **Me**: "I see now that 'balance' might be the wrong frame. Perhaps it's about integration... or improvisation?"

**Continue?**

## Key Principles

1. **User is the center** — Figures respond to "Me," not to each other in isolation
2. **Figures summon figures** — Through Connections, not predetermined lists
3. **The Stranger bridges worlds** — C brings unexpected connections from unrelated fields
4. **The Devil never rests** — Every round ends with critique
5. **Compound growth** — Personas accumulate; sessions are independent
6. **Intellectual honesty** — Figures stay true to their actual philosophies