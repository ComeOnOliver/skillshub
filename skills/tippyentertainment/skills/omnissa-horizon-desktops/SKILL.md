# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.



# Omnissa — Horizon Desktops

This skill covers practical workflows for designing, deploying, and operating VMware Horizon desktop environments (Connection Server, Composer/Instant Clone, vCenter, ESXi/vSphere, and cloud variants). Focus areas include image & template strategy, provisioning, identity integration, security, monitoring, and automation.

## Files & Formats

Required files and typical formats for Horizon projects:

- `SKILL.md` — skill metadata (YAML frontmatter: `name`, `description`)
- `README.md` — short overview and runbooks (optional)
- Image & templates: `.ova`, `.ovf`, `.vmdk`, AMI/VM templates lists (`.txt`/`.json`)
- Automation: `.ps1` (PowerCLI/PowerShell), `.sh`, `.py` (pyvmomi), Terraform (`.tf`), Ansible (`.yml`)
- vSphere exports/configs: `.json`, `.yaml`, `.xml`
- IaC & CI: `azure-pipelines.yml`, `.github/workflows/*.yml`
- Docs & runbooks: `.md` (runbooks, troubleshooting guides)
- Monitoring & dashboards: `.json` (vRealize/Log Insight dashboards), saved queries (`.txt`)
- Policy & security: `.json` (NSX/Firewall rules), RBAC lists (`.csv`)

## Core Responsibilities

1. **Validate environment & prerequisites**
   - Identify vCenter/vSphere versions, Connection Server topology, Composer/Instant Clone usage, and AD integration method.

2. **Image & bundle strategy**
   - Design golden images, snapshot policies, patch/update workflows, and template management (Instant Clone vs full clone tradeoffs).

3. **Provisioning & lifecycle management**
   - Automate provisioning (PowerCLI, Terraform, Ansible) and manage lifecycle: create, rebuild, recompose, retire.

4. **Directory, identity & profiles**
   - Ensure domain join, AD permissions for computer objects, GPO strategy, profile management (UE/VMT, FSLogix if used) and SSO integration.

5. **Networking & security**
   - Design secure network segments, consider NSX micro-segmentation, load balancing for Connection Servers, and encryption in transit/at rest.

6. **Monitoring & troubleshooting**
   - Use vRealize, Horizon dashboards, and logging to monitor session health, connection failures, and resource usage; use SVM/SSO logs for troubleshooting.

7. **Scaling, cost & DR**
   - Recommend pooled vs dedicated, schedule-based power management, and disaster recovery/backup approaches.

## Output style

- Provide concise runbooks and minimal copyable PowerCLI/CLI/Ansible/Terraform examples.
- Reference precise file paths and configuration snippets when suggesting edits.
- Prefer pragmatic automation and clear rollback instructions.
