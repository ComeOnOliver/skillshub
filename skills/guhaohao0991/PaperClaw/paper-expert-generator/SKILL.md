# Paper Expert Generator

Generate a complete, ready-to-use domain-specific paper expert agent by adapting the PaperClaw architecture for any research field.

## Workflow

### Step 1: Domain Interview

Collect these details from the user before generating anything. Ask conversationally – do not dump all questions at once. Start with the most critical ones:

**Critical (ask first):**
1. **Research domain** – Primary field (e.g., "bioinformatics", "quantum computing", "computer vision")
2. **Core topics** – Specific sub-areas or problems (e.g., "protein folding, drug discovery, single-cell sequencing")
3. **Key methods/techniques** – Central methodologies (e.g., "transformers, GNN, diffusion models, RL")

**Important (ask second):**
4. **Evaluation priorities** – What dimensions matter most for paper quality in this domain?
5. **Exclusion topics** – What should be filtered out? (e.g., "finance, social media, NLP")
6. **Output location** – Where to create the agent? (default: `~/agents/<domain-slug>/`)

**Optional (ask only if needed):**
7. **Notification channel** – Feishu/Lark webhook URL for push notifications
8. **LLM config** – API base URL, model name, API key (default: same as PaperClaw models.json)
9. **Schedule timezone** – Default is `Asia/Singapore`

Infer reasonable defaults for anything not provided and confirm before proceeding.

### Step 2: Build Keyword Library

Construct a structured keyword library from the domain interview. Aim for:

- **Core queries** (3–5): Direct topic+method combinations for arXiv `ti:` searches
- **Method queries** (3–5): Method+application combinations  
- **Application queries** (2–3): Use-case-specific terms
- **Exclusion keywords** (3–6): Out-of-scope terms to filter

See `references/domain-adaptation-guide.md` Section 1 for keyword examples across 8 common domains.

### Step 3: Design Evaluation Rubric

Design 4 domain-specific scoring dimensions (each scored 1–10) that replace PaperClaw's SciML dimensions (`engineering_value`, `architecture_innovation`, `theoretical_contribution`, `result_reliability`).

The scoring formula is unchanged:
```
final_score = base_score × 0.9 + impact_score × 0.1
base_score = (dim1 + dim2 + dim3 + dim4) / 4
impact_score = date_citation_adjustment(citations, age_months)
```

See `references/domain-adaptation-guide.md` Section 2 for rubric examples by domain.

### Step 4: Generate Agent Files

Run the scaffolding script to create the directory structure:

```bash
python ~/.comate/skills/paper-expert-generator/scripts/init_domain_agent.py \
  --domain "<domain_slug>" \
  --output "<output_dir>" \
  --paperclaw-skills "<paperclaw_skills_path>"
```

Example:
```bash
python ~/.comate/skills/paper-expert-generator/scripts/init_domain_agent.py \
  --domain "bioinfo-ml" \
  --output ~/agents/bioinfo-ml \
  --paperclaw-skills /work/work/PaperClaw/skills
```

Generated structure:
```
<output_dir>/
├── agent/
│   ├── AGENT.md          ← write domain content here
│   ├── models.json       ← pre-filled from template
│   └── schedules.json    ← pre-filled from template
├── skills/
│   ├── arxiv-search/     ← copy from PaperClaw (needs keyword update)
│   ├── semantic-scholar/ ← copy from PaperClaw (no changes needed)
│   ├── paper-review/     ← copy from PaperClaw (needs rubric update)
│   ├── daily-search/     ← copy from PaperClaw (minor text update)
│   └── weekly-report/    ← copy from PaperClaw (minor text update)
└── workspace/
    └── evaluated_papers.json  ← initialized empty
```

### Step 5: Write AGENT.md

Use `assets/templates/AGENT.md.template` as the base. The AGENT.md must include:

1. **Role Definition** – Domain expert persona with specific depth. Replace SciML expertise with domain-specific expertise (key algorithms, theoretical foundations, benchmark datasets, top venues/conferences).

2. **Keyword Library** – Paste structured keywords from Step 2.

3. **Four Core Tasks** (preserve exact structure from PaperClaw):
   - **Task 1 (Paper Research)**: Download PDF → write `summary.md` answering 10 domain-adapted questions
   - **Task 2 (Paper Evaluation)**: 4-dimension scoring → write `scores.md` → update `metadata.json` → update registry
   - **Task 3 (Daily Search)**: Cron trigger → `daily_paper_search.py --top 3` → dedup → trigger Task 1+2
   - **Task 4 (Weekly Report)**: Cron trigger → `generate_weekly_report_v2.py` → push notification

4. **Mandatory `<think>` Reasoning** – Required in Task 2 evaluation.

5. **Dedup Gate** – Always check `evaluated_papers.json` before starting paper review.

See `references/agent-template-guide.md` for the full AGENT.md authoring guide.

### Step 6: Adapt Skill SKILL.md Files

Minimal adaptation needed – Python scripts are domain-agnostic:

| Skill | Required changes to SKILL.md |
|-------|------------------------------|
| `arxiv-search` | Replace the keyword list with domain keywords from Step 2 |
| `paper-review` | Replace 4 scoring dimensions + update the 10 summary questions |
| `daily-search` | Update domain name in task description text |
| `weekly-report` | Update domain name in report title |
| `semantic-scholar` | No changes needed |

### Step 7: Configure models.json and schedules.json

**models.json**: Edit `agent/models.json`, fill in:
- `baseUrl`: LLM API endpoint  
- `apiKey`: API key placeholder  
- `id` and `name`: Model identifier

**schedules.json**: Default schedule is pre-filled. Adjust `tz` field if not in Singapore timezone.

### Step 8: Validate and Deliver

Checklist before presenting results:
- [ ] `AGENT.md` has domain role, keywords, 4 tasks, rubric
- [ ] `paper-review/SKILL.md` has domain scoring dimensions + 10 adapted questions
- [ ] `arxiv-search/SKILL.md` has domain keyword list
- [ ] `models.json` has correct structure (API key placeholder)
- [ ] `workspace/evaluated_papers.json` initialized as `[]`
- [ ] All 5 skill directories exist

Then present the output summary (see next section).

## Output Summary Format

Always deliver this summary after generation:

```markdown
## Generated Agent: <Domain Name> Paper Expert

**Domain**: <domain>
**Location**: `<output_dir>`
**Model**: <model_name>

### Keyword Library (<N> total queries)
**Core**: <query1>, <query2>, <query3>
**Methods**: <query1>, <query2>
**Exclusions**: <term1>, <term2>, ...

### Evaluation Rubric
| Dimension | Score Weight | Measures |
|-----------|-------------|---------|
| <dim1>    | 25%         | ...     |
| <dim2>    | 25%         | ...     |
| <dim3>    | 25%         | ...     |
| <dim4>    | 25%         | ...     |

### Schedule
- Daily search: `0 20 * * *` (<timezone>)
- Weekly report: `0 10 * * 0` (<timezone>)

### Quick Start
1. Open OpenClaw → select agent from `<output_dir>/agent/`
2. Set API key in `agent/models.json`
3. Test: "Search for recent papers on <core_topic>"
4. Or wait for first daily trigger at 20:00
```

## References

- `references/domain-adaptation-guide.md` – Keyword and rubric examples for 8 common domains
- `references/agent-template-guide.md` – Full AGENT.md authoring guide with annotated sections
- `assets/templates/AGENT.md.template` – Base template for the generated AGENT.md
- `assets/templates/models.json` – Base models config template
- `assets/templates/schedules.json` – Base schedules config template