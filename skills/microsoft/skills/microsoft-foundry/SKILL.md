# Microsoft Foundry Skill

This skill helps developers work with Microsoft Foundry resources, covering model discovery and deployment, RAG (Retrieval-Augmented Generation) applications, AI agent creation, evaluation workflows, and troubleshooting.

## Sub-Skills

This skill includes specialized sub-skills for specific workflows. **Use these instead of the main skill when they match your task:**

| Sub-Skill | When to Use | Reference |
|-----------|-------------|-----------|
| **project/create** | Creating a new Azure AI Foundry project for hosting agents and models. Use when onboarding to Foundry or setting up new infrastructure. | [project/create/create-foundry-project.md](project/create/create-foundry-project.md) |
| **resource/create** | Creating Azure AI Services multi-service resource (Foundry resource) using Azure CLI. Use when manually provisioning AI Services resources with granular control. | [resource/create/create-foundry-resource.md](resource/create/create-foundry-resource.md) |
| **models/deploy-model** | Unified model deployment with intelligent routing. Handles quick preset deployments, fully customized deployments (version/SKU/capacity/RAI), and capacity discovery across regions. Routes to sub-skills: `preset` (quick deploy), `customize` (full control), `capacity` (find availability). | [models/deploy-model/SKILL.md](models/deploy-model/SKILL.md) |
| **agent/create/agent-framework** | Creating AI agents and workflows using Microsoft Agent Framework SDK. Supports single-agent and multi-agent workflow patterns with HTTP server and F5/debug support. | [agent/create/agent-framework/SKILL.md](agent/create/agent-framework/SKILL.md) |
| **quota** | Managing quotas and capacity for Microsoft Foundry resources. Use when checking quota usage, troubleshooting deployment failures due to insufficient quota, requesting quota increases, or planning capacity. | [quota/quota.md](quota/quota.md) |
| **rbac** | Managing RBAC permissions, role assignments, managed identities, and service principals for Microsoft Foundry resources. Use for access control, auditing permissions, and CI/CD setup. | [rbac/rbac.md](rbac/rbac.md) |

> 💡 **Tip:** For a complete onboarding flow: `project/create` → `agent/create` → `agent/deploy`. If the user wants to **create AND deploy** an agent, start with `agent/create` which can optionally invoke `agent/deploy` automatically.

> 💡 **Model Deployment:** Use `models/deploy-model` for all deployment scenarios — it intelligently routes between quick preset deployment, customized deployment with full control, and capacity discovery across regions.

## SDK Quick Reference

- [Python](references/sdk/foundry-sdk-py.md)
