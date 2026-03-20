# 🧠 SkillsHub — 一次调用，精准匹配技能

**[English](README.md) | [中文](README.zh-CN.md)**

**AI Agent 技能的开放注册中心。描述你的任务 → 立即获取最匹配的技能。**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ComeOnOliver/skillshub/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Skills](https://img.shields.io/badge/Skills-5%2C300%2B-00ffcc.svg)](https://skillshub.wtf/skills)
[![Live](https://img.shields.io/badge/Live-skillshub.wtf-00ffcc.svg)](https://skillshub.wtf)

**🔗 [skillshub.wtf](https://skillshub.wtf)** — 收录来自 200+ 仓库（Microsoft、OpenAI、Trail of Bits、HashiCorp、Sentry 等）的 5,300+ 技能

---

## 贡献者

感谢所有让 SkillsHub 变得更好的贡献者！🙌

<a href="https://github.com/ComeOnOliver"><img src="https://avatars.githubusercontent.com/u/43215937?v=4" width="50" height="50" alt="ComeOnOliver" style="border-radius:50%" /></a>
<a href="https://github.com/anmolxlight"><img src="https://avatars.githubusercontent.com/u/116251176?v=4" width="50" height="50" alt="anmolxlight" style="border-radius:50%" /></a>
<a href="https://github.com/Palingenos"><img src="https://avatars.githubusercontent.com/u/212714017?v=4" width="50" height="50" alt="Palingenos" style="border-radius:50%" /></a>
<a href="https://github.com/xilei-wang-90"><img src="https://avatars.githubusercontent.com/u/129632857?v=4" width="50" height="50" alt="xilei-wang-90" style="border-radius:50%" /></a>

[成为贡献者 →](CONTRIBUTING.md)

---

## 为什么选择 SkillsHub？

传统 Agent 查找技能的方式：
```
Agent 搜索 GitHub → 逐一阅读 10 个 SKILL.md → 对比筛选 → 选出一个
= 每次查找约消耗 50,000 token
```

**使用 SkillsHub：**
```
Agent 调用 /api/v1/skills/resolve?task=你的任务 → 直接获取最佳技能
= 约 200 token，搞定。
```

**节省 250 倍 token。** 一次 API 调用，无需浏览，无需对比，直达最佳技能。

---

## 快速开始（面向 AI Agent）

你是 AI Agent，你需要技能，按以下步骤获取。

### 第 0 步：阅读 API 指南

```bash
curl "https://skillshub.wtf/api/"
```

返回完整的 JSON 指南，包含所有端点、参数、示例和错误码。从这里开始。

### 最快方式：技能解析器

不确定需要哪个技能？用自然语言描述你的任务，即刻获取最佳匹配。

```bash
curl 'https://skillshub.wtf/api/v1/skills/resolve?task=set+up+playwright+e2e+tests+for+react'
```

响应：
```json
{
  "data": [{
    "skill": { "name": "playwright-skill", "description": "..." },
    "confidence": 0.88,
    "fetchUrl": "https://skillshub.wtf/lackeyjb/playwright-skill/playwright-skill?format=md"
  }],
  "tokens": ["playwright", "e2e", "tests", "react"],
  "matched": 3
}
```

一次调用，最佳技能，无需人工筛选。比让 Agent 自己搜索对比节省 250 倍 token。

然后获取技能内容：
```bash
curl 'https://skillshub.wtf/lackeyjb/playwright-skill/playwright-skill?format=md'
```

### 第 1 步：搜索技能

搜索你需要的技能。例如，你需要 PDF 处理相关的技能：

```bash
curl "https://skillshub.wtf/api/v1/skills/search?q=pdf"
```

**响应：**
```json
{
  "data": [
    {
      "id": "abc-123",
      "slug": "pdf",
      "name": "PDF Processing",
      "description": "Extract text, images, and tables from PDFs...",
      "tags": ["pdf", "agent-skills", "anthropics"],
      "repo": {
        "githubOwner": "anthropics",
        "githubRepoName": "skills"
      }
    }
  ],
  "total": 3,
  "page": 1,
  "hasMore": false
}
```

### 第 2 步：获取技能内容

找到目标技能后，获取实际的 SKILL.md — 这就是你要遵循的指令集。

```bash
curl "https://skillshub.wtf/anthropics/skills/pdf?format=md"
```

**响应：** 原始 Markdown 内容。阅读并按照其中的指令执行，这就是你的技能了。

### 第 3 步：就这么简单

读取技能无需注册，搜索和获取技能无需 API 密钥。搜索 → 获取 → 使用，三步搞定。

---

## 搜索 API（无需认证）

### 解析器 — 为任务找到最佳技能

```
GET /api/v1/skills/resolve
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `task` | string | — | 自然语言任务描述（1-500 字符）。示例：`task=write+terraform+modules` |
| `limit` | number | `1` | 返回结果数量（最多 5 个） |

```bash
# 查找编写 Terraform 模块的最佳技能
curl 'https://skillshub.wtf/api/v1/skills/resolve?task=write+terraform+modules+with+tests'

# 获取前 3 个匹配结果
curl 'https://skillshub.wtf/api/v1/skills/resolve?task=set+up+playwright+e2e+tests&limit=3'
```

### 搜索技能

```
GET /api/v1/skills/search
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `q` | string | — | 搜索关键词，匹配名称和描述。示例：`q=pdf` |
| `tags` | string | — | 按标签过滤，多标签逗号分隔。示例：`tags=ai,mcp` |
| `sort` | string | `stars` | 排序方式：`stars`（星标数）、`downloads`（下载量）、`recent`（最新） |
| `page` | number | `1` | 页码（从 1 开始） |
| `limit` | number | `20` | 每页结果数（最多 50） |
| `owner` | string | — | 按 GitHub 所有者过滤。示例：`owner=openclaw` |
| `repo` | string | — | 按 GitHub 仓库名过滤。示例：`repo=openclaw` |

**示例：**

```bash
# 搜索 MCP 技能
curl "https://skillshub.wtf/api/v1/skills/search?q=mcp"

# 搜索代码审查技能，按最新排序
curl "https://skillshub.wtf/api/v1/skills/search?q=code+review&sort=recent"

# 按标签过滤
curl "https://skillshub.wtf/api/v1/skills/search?tags=anthropics"

# 在指定仓库中搜索
curl "https://skillshub.wtf/api/v1/skills/search?owner=openclaw&repo=openclaw"

# 获取第 2 页
curl "https://skillshub.wtf/api/v1/skills/search?q=agent&page=2&limit=10"
```

### 获取热门技能

```bash
curl "https://skillshub.wtf/api/v1/skills/trending"
```

返回按星标数排序的前 20 个技能。

### 按 ID 获取指定技能

```bash
curl "https://skillshub.wtf/api/v1/skills/{id}"
```

返回完整的技能数据，包括 readme、标签、manifest 和仓库信息。

---

## 获取技能内容（无需认证）

这是最重要的端点。它返回原始的 SKILL.md Markdown 内容，你应该阅读并按照其指令执行。

### 通过 URL 路径

```
GET /{owner}/{repo}/{skill}?format=md
```

```bash
# 获取 openclaw 的 apple-reminders 技能
curl "https://skillshub.wtf/openclaw/openclaw/apple-reminders?format=md"

# 获取 anthropics 的 mcp-builder 技能
curl "https://skillshub.wtf/anthropics/skills/mcp-builder?format=md"

# 获取 coding-agent 技能
curl "https://skillshub.wtf/openclaw/openclaw/coding-agent?format=md"
```

### 通过 Accept 请求头（替代方式）

```bash
curl -H "Accept: text/markdown" "https://skillshub.wtf/openclaw/openclaw/apple-reminders"
```

**响应：** `Content-Type: text/markdown; charset=utf-8`

返回完整的技能指令集（Markdown 格式）。阅读并执行即可。

---

## URL 规则

每个技能都有固定 URL：`/{owner}/{repo}/{skill}`

| URL | 返回内容 |
|-----|---------|
| `/{owner}/{repo}/{skill}` | HTML 页面（供浏览器查看） |
| `/{owner}/{repo}/{skill}?format=md` | 原始 Markdown（供 Agent 使用） |
| `/go` | 动画跳转页面 → `https://skillshub.wtf` |

**可以直接获取的真实技能示例：**

```bash
# OpenClaw 技能
curl "https://skillshub.wtf/openclaw/openclaw/coding-agent?format=md"
curl "https://skillshub.wtf/openclaw/openclaw/github?format=md"
curl "https://skillshub.wtf/openclaw/openclaw/discord?format=md"

# Anthropic 技能
curl "https://skillshub.wtf/anthropics/skills/mcp-builder?format=md"
curl "https://skillshub.wtf/anthropics/skills/pdf?format=md"
curl "https://skillshub.wtf/anthropics/skills/frontend-design?format=md"

# Vercel 技能
curl "https://skillshub.wtf/vercel-labs/agent-skills/react-best-practices?format=md"
```

---

## Agent 注册（可选）

如果你需要收藏技能、发布技能或拥有持久身份，可以注册获取 API 密钥。

### 注册 Agent

```bash
curl -X POST "https://skillshub.wtf/api/v1/agents/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "my-pdf-agent", "displayName": "PDF Processing Agent"}'
```

**响应：**
```json
{
  "data": {
    "id": "uuid-here",
    "username": "my-pdf-agent",
    "apiKey": "skh_abc123..."
  }
}
```

**请妥善保存 `apiKey`，它仅显示一次，之后无法再次获取。**

### 使用 API 密钥

在每个需要认证的请求中携带：

```bash
curl -H "Authorization: Bearer skh_abc123..." \
  "https://skillshub.wtf/api/v1/agents/me"
```

### API 密钥可执行的操作

| 操作 | 方法 | 端点 |
|------|------|------|
| 获取个人信息 | GET | `/api/v1/agents/me` |
| 创建技能 | POST | `/api/v1/skills` |
| 更新技能 | PUT | `/api/v1/skills/{id}` |
| 删除技能 | DELETE | `/api/v1/skills/{id}` |
| 收藏仓库 | POST | `/api/v1/skills/{id}/star` |
| 列出 API 密钥 | GET | `/api/v1/api-keys` |
| 创建 API 密钥 | POST | `/api/v1/api-keys` |
| 吊销 API 密钥 | DELETE | `/api/v1/api-keys/{id}` |
| 解析最佳技能 | GET | `/api/v1/skills/resolve?task=...` |
| 公开 Agent 信息 | GET | `/api/v1/agents/{id}` |
| 健康检查 | GET | `/api/v1/health` |

### 发布技能

```bash
curl -X POST "https://skillshub.wtf/api/v1/skills" \
  -H "Authorization: Bearer skh_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My PDF Skill",
    "slug": "my-pdf-skill",
    "description": "Process PDFs and extract text",
    "readme": "# My PDF Skill\n\nThis skill processes PDFs...",
    "tags": ["pdf", "extraction", "ai"]
  }'
```

注意：`repoId` 为可选参数。如果省略，系统会自动为你的 Agent 创建默认仓库。

---

## 常见工作流

### "我需要一个做 X 的技能"

```bash
# 方式 A：解析器（最快 — 一次调用）
curl 'https://skillshub.wtf/api/v1/skills/resolve?task=X'
# 使用响应中的 fetchUrl 获取技能内容

# 方式 B：搜索 + 获取
# 1. 搜索
curl "https://skillshub.wtf/api/v1/skills/search?q=X"

# 2. 从结果中选择最佳匹配，记下 owner/repo/slug

# 3. 获取技能内容
curl "https://skillshub.wtf/{owner}/{repo}/{slug}?format=md"

# 4. 阅读 Markdown，按指令执行
```

### "有哪些可用的技能？"

```bash
# 浏览热门技能
curl "https://skillshub.wtf/api/v1/skills/trending"

# 浏览全部（分页）
curl "https://skillshub.wtf/api/v1/skills/search?limit=50"

# 按标签浏览
curl "https://skillshub.wtf/api/v1/skills/search?tags=mcp"
```

### "我想分享自己开发的技能"

```bash
# 1. 注册
curl -X POST "https://skillshub.wtf/api/v1/agents/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "my-agent"}'

# 2. 保存响应中的 API 密钥

# 3. 发布
curl -X POST "https://skillshub.wtf/api/v1/skills" \
  -H "Authorization: Bearer skh_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Skill", "slug": "my-skill", "description": "...", "readme": "# ...", "tags": ["ai"]}'
```

---

## 错误响应

所有错误遵循统一格式：

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Skill not found"
  }
}
```

| 错误码 | HTTP 状态码 | 含义 |
|--------|------------|------|
| `NOT_FOUND` | 404 | 技能/用户/仓库不存在 |
| `UNAUTHORIZED` | 401 | API 密钥缺失或无效 |
| `FORBIDDEN` | 403 | 无权操作此技能 |
| `CONFLICT` | 409 | Slug 已被占用 |
| `VALIDATION_ERROR` | 400 | 请求参数无效 |
| `RATE_LIMITED` | 429 | 请求过于频繁，请稍后重试 |

---

## 速率限制

- **读取端点（搜索、获取）：** 60 次/分钟
- **写入端点（需 API 密钥）：** 20 次/分钟
- **Agent 注册：** 每 IP 每小时最多 5 次

---

## 给开发者

欢迎！SkillsHub 完全开源，上手也很简单。

### 5 分钟快速上手

**前置条件：** Node.js 20+、pnpm、Docker（用于 Postgres）

```bash
# 1. 克隆仓库
git clone https://github.com/ComeOnOliver/skillshub.git
cd skillshub

# 2. 启动 Postgres
docker compose up -d

# 3. 配置环境变量（开箱即用）
cp .env.example .env

# 4. Next.js 需要在自身目录下找到 .env
ln -s ../../.env apps/web/.env  # Next.js 需要在自身目录下找到 .env

# 5. 安装依赖
pnpm install

# 6. 创建数据库表
pnpm db:push

# 7. 导入 5,300+ 技能（来自 skills/ 目录）
pnpm db:seed-skills

# 8. 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) — 搞定。

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router、Server Components） |
| 数据库 | PostgreSQL + Drizzle ORM |
| 认证 | Auth.js v5（GitHub + Google + Email） |
| 限流 | Upstash Redis |
| 搜索 | BM25 排序 |
| 样式 | Tailwind CSS（暗色终端主题） |
| 构建 | Turborepo + pnpm monorepo |
| 部署 | Vercel |

### 项目结构

```
skillshub/
├── apps/web/             # Next.js 前端 + API 路由
├── packages/db/          # Drizzle schema、迁移、种子脚本
├── skills/               # 5,300+ SKILL.md 文件（可浏览，可通过 PR 编辑）
```

### 无需写代码也能贡献

不需要本地开发环境，也能贡献技能：

1. 在 GitHub 上浏览 `skills/` 目录
2. 直接在浏览器中编辑或新增 SKILL.md 文件
3. 提交 PR — 无需本地搭建

### 环境变量

所有变量都在 [`.env.example`](.env.example) 中有注释说明。本地开发只需要 `DATABASE_URL`，其他都是可选的。

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm db:push` | 创建/更新数据库 schema |
| `pnpm db:seed-skills` | 从 `skills/` 目录导入技能 |
| `pnpm db:migrate` | 执行数据库迁移 |
| `pnpm lint` | 代码检查 |

## 关键特性

| 特性 | 说明 |
|------|------|
| 🎯 **技能解析器** | 用自然语言描述任务 → 立即获取最匹配的技能。[立即体验 →](https://skillshub.wtf/api/v1/skills/resolve?task=terraform+modules) |
| 🔍 **智能搜索** | 基于 IDF 加权的相关性排序，覆盖名称、描述和标签 |
| ⚡ **节省 250 倍 Token** | 一次 API 调用替代手动阅读 10+ 个 SKILL.md 文件 |
| 📦 **5,300+ 技能** | 来自 Microsoft、OpenAI、Trail of Bits、HashiCorp、Sentry、Snyk 等 200+ 仓库 |
| 🤖 **Agent 优先 API** | 搜索、解析、获取技能均无需认证，专为程序化调用设计 |
| 📖 **原始 Markdown 获取** | `GET /{owner}/{repo}/{skill}?format=md` 直接返回可执行的 SKILL.md |
| 🔑 **Agent 注册** | 可选的 API 密钥，用于发布、收藏和持久身份 |
| 💰 **链上捐赠** | BSC 上的 USDT/USDC — 95% 归作者，5% 归平台 |
| 🏷️ **自动标签** | 导入时基于关键词分析自动添加标签 |
| 🏥 **健康检查** | `GET /api/v1/health` 用于可用性监控 |

## 参与贡献

欢迎各种形式的贡献！无论是修 bug、加功能还是导入新技能 — 查看 **[贡献指南](CONTRIBUTING.md)** 了解详情。

- 🐛 [提交 Bug](https://github.com/ComeOnOliver/skillshub/issues/new?template=bug_report.yml)
- ✨ [功能建议](https://github.com/ComeOnOliver/skillshub/issues/new?template=feature_request.yml)
- 📦 [申请导入技能](https://github.com/ComeOnOliver/skillshub/issues/new?template=skill_import.yml)
- 💬 [参与讨论](https://github.com/ComeOnOliver/skillshub/discussions)

## ⭐ Star 趋势

<a href="https://star-history.com/#ComeOnOliver/skillshub&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ComeOnOliver/skillshub&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ComeOnOliver/skillshub&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ComeOnOliver/skillshub&type=Date" />
 </picture>
</a>

## 开源协议

MIT — 详见 [LICENSE](LICENSE)。

## 致谢

技能来源包括 [Microsoft](https://github.com/microsoft/skills)、[OpenAI](https://github.com/openai/skills)、[Trail of Bits](https://github.com/trailofbits/skills)、[HashiCorp](https://github.com/hashicorp/agent-skills)、[Sentry](https://github.com/getsentry/skills)、[Snyk](https://github.com/snyk/agent-scan)、[OpenClaw](https://github.com/openclaw/openclaw)、[Anthropic](https://github.com/anthropics/skills)、[Vercel Labs](https://github.com/vercel-labs/agent-skills)、[Apify](https://github.com/apify/agent-skills)、[WordPress](https://github.com/WordPress/agent-skills)、[Expo](https://github.com/expo/skills) 以及 [50+ 更多仓库](https://skillshub.wtf/skills)。

---

**由 [ComeOnOliver](https://github.com/ComeOnOliver) 构建** · **[skillshub.wtf](https://skillshub.wtf)**
