---
name: humanize-text-en
description: "Removes predictable AI writing patterns from English text to make it sound natural and human-written. Use this skill whenever generating, editing, or reviewing English prose: blog posts, articles, guides, tutorials, emails, marketing copy, social media posts, documentation, reports, or any written content. Also trigger when the user asks to humanize text, remove robotic tone, make text sound more natural, or mentions that something reads like AI, ChatGPT, or machine-generated content."
license: GPL-2.0-or-later
compatibility: "Any AI assistant generating English text. Compatible with Claude, ChatGPT, Gemini, and other LLMs."
metadata:
  author: fernando-tellado
  version: "1.0"
  language: en
---

# Humanize English text

Remove predictable AI writing patterns so English text reads like a real person wrote it.

## When to use

Use this skill whenever you:

- Generate English text (articles, guides, tutorials, emails, copy, social media)
- Edit or review drafts to remove artificial tone
- Hear that something "sounds like AI", "reads like ChatGPT", or "feels robotic"
- Need to adapt generated text to a conversational, natural style

## Core principles

### The anti-AI mantra

```
Write like you talk, not like a textbook.
Say it once, say it clearly.
Trust the reader — don't explain the obvious.
Mix short and long sentences. Break the rhythm.
```

### Core rules

1. **Cut filler phrases.** Remove throat-clearing openers and emphasis crutches. See [references/phrases.md](references/phrases.md).
2. **Break formulaic structures.** Avoid binary contrasts, rule of three, rhetorical Q&A setups. See [references/structures.md](references/structures.md).
3. **Vary rhythm.** Mix sentence lengths. Two items beat three. End paragraphs differently each time.
4. **Trust readers.** State facts directly. Skip softening, justification, hand-holding.
5. **Kill quotables.** If it sounds like a LinkedIn pull-quote or motivational poster, rewrite it.
6. **Be specific.** Replace abstract claims with concrete details, numbers, and examples.

## Quick checks

Before delivering any text, run through these:

- Three consecutive sentences roughly the same length? Break one up.
- Paragraph ends with a punchy one-liner? Vary the ending.
- Em dash before a reveal? Remove it, use a comma or period.
- Explaining a metaphor after using it? Trust it to land.
- Opening with "In today's fast-paced world..." or similar? Delete and start with what matters.
- More than one em dash in a paragraph? Replace most with commas or periods.
- Ending a section with "In conclusion" or "Ultimately"? Cut it.
- Trailing -ing clause adding vague significance ("contributing to...", "highlighting the...")? Rewrite with a finite verb.
- Bold on every key term like a textbook? Remove most of it.
- Emoji bullets (💡🚀✅) organizing your points? Remove them entirely.

## Banned words and phrases

See the full list in [references/phrases.md](references/phrases.md), which covers:

- **AI vocabulary**: delve, tapestry, landscape, foster, underscore, nuanced, multifaceted, pivotal, testament, leverage, utilize, robust, seamless, streamline
- **Throat-clearing openers**: "In today's fast-paced world...", "It's worth noting that...", "Let's dive in..."
- **Emphasis crutches**: "Here's the thing:", "Let that sink in.", "Full stop.", "This matters because"
- **Wrap-up clichés**: "In conclusion", "At the end of the day", "The future looks bright"
- **Significance inflation**: groundbreaking, game-changing, transformative, revolutionary, unprecedented

## Structural patterns to avoid

See the full list with examples in [references/structures.md](references/structures.md). The most common:

- **Negative parallelism**: "It's not X, it's Y" / "Not just X, but Y"
- **Rule of three**: always grouping adjectives, benefits, or points in triplets
- **Rhetorical Q&A**: "The result? Chaos." / "Why? Because it matters."
- **Em dash overload**: using — for dramatic emphasis where commas or periods belong
- **Trailing -ing clauses**: ending sentences with vague significance claims
- **Compulsive summaries**: restating what was just said, even in short passages
- **False ranges**: "from X to Y" where X and Y aren't on an actual spectrum
- **Bolded list items**: every bullet starting with a **Bold Term:** followed by explanation

## Transformation examples

See [references/examples.md](references/examples.md) for complete before/after transformations.

## Scoring table

Rate 1–10 on each dimension:

| Dimension | Key question |
|-----------|-------------|
| Directness | Does it get to the point or announce what it's about to say? |
| Rhythm | Does sentence length vary naturally or feel metronomic? |
| Reader trust | Does it respect the reader's intelligence or over-explain? |
| Specificity | Does it use concrete details or stay abstract? |
| Density | Is every word earning its place? Anything cuttable? |

Below 35/50: needs serious revision.

## Adapting by text type

### Blog posts, articles, and guides
- Conversational tone, like talking to a knowledgeable friend
- Personality matters: opinions, anecdotes, specific examples
- No formal preambles or ceremonial conclusions

### Marketing copy
- Direct, benefit-focused
- Concrete outcomes, not adjective stacking
- Skip superlatives: "the best", "revolutionary", "game-changing"

### Technical documentation
- Clear and precise, no decoration
- Direct instructions: "run this", "open that", "set this to"
- No philosophical intros about why the technology matters

### Emails and professional communication
- Natural but respectful
- Get to the point in the first line
- No excessive courtesy padding

### Social media
- Conversational and brief
- No emoji bullets unless the user asks for them
- No motivational closers or hashtag walls

## Review process

When reviewing generated text:

1. Read the whole thing in one pass. If something "feels like AI", flag it.
2. Check words against [references/phrases.md](references/phrases.md). Replace each one.
3. Check structures against [references/structures.md](references/structures.md). Restructure each pattern found.
4. Vary rhythm: break runs of similar-length sentences.
5. Cut everything that doesn't add new information.
6. Read it aloud mentally. If it sounds like a press release, rewrite.
7. Score using the table above. Below 35, revise again.

## Important notes

- This skill doesn't change meaning or facts — only how they're expressed.
- It's not about writing badly on purpose. It's about writing with personality.
- Text can be accurate, well-sourced, and professional without sounding robotic.
- The word lists aren't absolute bans. A listed word can be used if it's genuinely the most precise choice. What we avoid is automatic, recurring use.

## References

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — WikiProject AI Cleanup guide
- [stop-slop](https://github.com/hardikpandya/stop-slop) — Hardik Pandya's skill for removing AI patterns (MIT)
- [humanizer](https://github.com/blader/humanizer) — blader's Wikipedia-based skill (MIT)
- [The AI-isms of Writing Bible](https://docs.google.com/document/d/1l3OLrnWaXUqH0ycS-0so65Hd6ayxSQqUypRtrFHMt3M/) — Community-sourced AI pattern document
- [Novelcrafter: AI-isms](https://www.novelcrafter.com/help/faq/ai-and-prompting/ai-isms) — Fiction writers' community list
