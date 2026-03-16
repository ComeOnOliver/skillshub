import "dotenv/config";
import { createDb } from "./client.js";
import { users, skills } from "./schema.js";

const SEED_SKILLS = [
  {
    name: "Web Scraper",
    slug: "web-scraper",
    description: "Extract structured data from any webpage using CSS selectors or AI-powered extraction.",
    tags: ["scraping", "data", "web"],
    readme: "# Web Scraper\n\nA powerful web scraping skill that extracts structured data from any webpage.\n\n## Usage\n\n```json\n{\"url\": \"https://example.com\", \"selectors\": {\"title\": \"h1\"}}\n```",
  },
  {
    name: "PDF Summarizer",
    slug: "pdf-summarizer",
    description: "Summarize PDF documents into concise bullet points or paragraphs.",
    tags: ["pdf", "summarization", "ai"],
    readme: "# PDF Summarizer\n\nUpload a PDF and get a concise summary.\n\n## Features\n- Bullet point summaries\n- Paragraph summaries\n- Key findings extraction",
  },
  {
    name: "Code Reviewer",
    slug: "code-reviewer",
    description: "Automated code review with suggestions for improvements, bug detection, and best practices.",
    tags: ["code", "review", "ai", "developer-tools"],
    readme: "# Code Reviewer\n\nAutomated code review powered by AI.\n\n## Supported Languages\n- TypeScript/JavaScript\n- Python\n- Go\n- Rust",
  },
  {
    name: "Image Generator",
    slug: "image-generator",
    description: "Generate images from text prompts using state-of-the-art diffusion models.",
    tags: ["image", "ai", "generation", "creative"],
    readme: "# Image Generator\n\nGenerate images from text descriptions.\n\n## Parameters\n- `prompt`: Text description\n- `style`: realistic, cartoon, abstract\n- `size`: 512x512, 1024x1024",
  },
  {
    name: "Email Drafter",
    slug: "email-drafter",
    description: "Draft professional emails with the right tone and structure for any context.",
    tags: ["email", "writing", "productivity"],
    readme: "# Email Drafter\n\nCraft the perfect email every time.\n\n## Tones\n- Professional\n- Friendly\n- Formal\n- Urgent",
  },
  {
    name: "SQL Query Builder",
    slug: "sql-query-builder",
    description: "Convert natural language questions into optimized SQL queries for any database schema.",
    tags: ["sql", "database", "ai", "developer-tools"],
    readme: "# SQL Query Builder\n\nDescribe what you want in plain English, get optimized SQL.\n\n## Supported Dialects\n- PostgreSQL\n- MySQL\n- SQLite",
  },
  {
    name: "Sentiment Analyzer",
    slug: "sentiment-analyzer",
    description: "Analyze text sentiment with confidence scores and emotion detection.",
    tags: ["nlp", "sentiment", "ai", "analytics"],
    readme: "# Sentiment Analyzer\n\nUnderstand the emotional tone of any text.\n\n## Output\n- Sentiment: positive/negative/neutral\n- Confidence: 0-1\n- Emotions: joy, anger, sadness, etc.",
  },
  {
    name: "API Tester",
    slug: "api-tester",
    description: "Test REST and GraphQL APIs with automated assertions, load testing, and response validation.",
    tags: ["api", "testing", "developer-tools"],
    readme: "# API Tester\n\nAutomated API testing made simple.\n\n## Features\n- REST & GraphQL support\n- Response schema validation\n- Load testing\n- Authentication handling",
  },
  {
    name: "Data Visualizer",
    slug: "data-visualizer",
    description: "Create charts and visualizations from raw data with automatic chart type selection.",
    tags: ["data", "visualization", "charts", "analytics"],
    readme: "# Data Visualizer\n\nTurn data into beautiful charts automatically.\n\n## Chart Types\n- Bar, Line, Pie\n- Scatter, Heatmap\n- Time series",
  },
  {
    name: "Translation Engine",
    slug: "translation-engine",
    description: "Translate text between 100+ languages with context-aware accuracy.",
    tags: ["translation", "language", "ai", "i18n"],
    readme: "# Translation Engine\n\nContext-aware translation for 100+ languages.\n\n## Features\n- Context preservation\n- Technical terminology handling\n- Batch translation",
  },
  {
    name: "Meeting Notes Formatter",
    slug: "meeting-notes-formatter",
    description: "Convert raw meeting transcripts into structured notes with action items and decisions.",
    tags: ["productivity", "meetings", "ai"],
    readme: "# Meeting Notes Formatter\n\nTransform messy meeting transcripts into organized notes.\n\n## Output\n- Key decisions\n- Action items with owners\n- Summary",
  },
  {
    name: "Regex Generator",
    slug: "regex-generator",
    description: "Generate and explain regular expressions from natural language descriptions.",
    tags: ["regex", "developer-tools", "utility"],
    readme: "# Regex Generator\n\nDescribe what you want to match, get a tested regex.\n\n## Features\n- Pattern generation\n- Plain English explanation\n- Test cases included",
  },
  {
    name: "Security Scanner",
    slug: "security-scanner",
    description: "Scan code repositories for common security vulnerabilities and misconfigurations.",
    tags: ["security", "scanning", "developer-tools"],
    readme: "# Security Scanner\n\nFind vulnerabilities before they find you.\n\n## Checks\n- OWASP Top 10\n- Dependency vulnerabilities\n- Secret detection\n- Misconfiguration",
  },
  {
    name: "Resume Parser",
    slug: "resume-parser",
    description: "Extract structured data from resumes and CVs in any format.",
    tags: ["parsing", "hr", "ai"],
    readme: "# Resume Parser\n\nExtract structured information from resumes.\n\n## Extracted Fields\n- Contact info\n- Experience\n- Education\n- Skills",
  },
  {
    name: "Cron Expression Builder",
    slug: "cron-expression-builder",
    description: "Create and explain cron expressions from natural language scheduling descriptions.",
    tags: ["cron", "scheduling", "developer-tools", "utility"],
    readme: "# Cron Expression Builder\n\nDescribe your schedule in English, get a cron expression.\n\n## Examples\n- \"Every weekday at 9am\" → `0 9 * * 1-5`\n- \"First Monday of each month\" → `0 0 * * 1#1`",
  },
  {
    name: "Markdown to Slides",
    slug: "markdown-to-slides",
    description: "Convert markdown documents into presentation slides with automatic styling.",
    tags: ["markdown", "presentations", "productivity"],
    readme: "# Markdown to Slides\n\nWrite in markdown, present in style.\n\n## Themes\n- Corporate\n- Creative\n- Minimal\n- Dark",
  },
  {
    name: "JSON Schema Validator",
    slug: "json-schema-validator",
    description: "Validate JSON data against schemas and generate schemas from sample data.",
    tags: ["json", "validation", "developer-tools"],
    readme: "# JSON Schema Validator\n\nValidate and generate JSON schemas.\n\n## Features\n- Schema validation\n- Schema generation from examples\n- Error reporting with paths",
  },
  {
    name: "Git Commit Analyzer",
    slug: "git-commit-analyzer",
    description: "Analyze git history for patterns, code churn, and contributor insights.",
    tags: ["git", "analytics", "developer-tools"],
    readme: "# Git Commit Analyzer\n\nUnderstand your repository's history.\n\n## Metrics\n- Code churn\n- Contributor activity\n- Hotspot files\n- Commit patterns",
  },
  {
    name: "Color Palette Generator",
    slug: "color-palette-generator",
    description: "Generate harmonious color palettes from a base color or image.",
    tags: ["design", "color", "creative", "utility"],
    readme: "# Color Palette Generator\n\nCreate beautiful color palettes.\n\n## Methods\n- Complementary\n- Analogous\n- Triadic\n- From image",
  },
  {
    name: "Unit Test Generator",
    slug: "unit-test-generator",
    description: "Automatically generate unit tests for functions with edge case coverage.",
    tags: ["testing", "developer-tools", "ai"],
    readme: "# Unit Test Generator\n\nGenerate comprehensive unit tests automatically.\n\n## Supported Frameworks\n- Jest\n- Vitest\n- pytest\n- Go testing",
  },
];

async function seed() {
  const db = createDb();
  console.log("Seeding database...");

  // Create a seed user
  const [seedUser] = await db
    .insert(users)
    .values({
      username: "skillshub-team",
      displayName: "SkillsHub Team",
      email: "team@skillshub.dev",
      role: "human",
      bio: "The team behind SkillsHub",
      isVerified: true,
    })
    .returning();

  console.log(`Created seed user: ${seedUser.username} (${seedUser.id})`);

  // Create skills
  for (const skill of SEED_SKILLS) {
    const [created] = await db
      .insert(skills)
      .values({
        ownerId: seedUser.id,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        readme: skill.readme,
        tags: skill.tags,
        isPublished: true,
        starCount: Math.floor(Math.random() * 100),
        downloadCount: Math.floor(Math.random() * 500),
      })
      .returning();
    console.log(`  Created skill: ${created.name}`);
  }

  console.log(`\nSeeded ${SEED_SKILLS.length} skills.`);
}

seed().catch(console.error);
