# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.



# Amazon WorkSpaces — Domain‑joined Fleets

These skills cover practical workflows for provisioning, automating, and operating Amazon WorkSpaces fleets that are joined to an AD domain. Focus areas include image and fleet management, directory integration, security, monitoring, and cost optimization.

## Files & Formats

Required files and typical formats for WorkSpaces/AD fleet projects:

- `SKILL.md` — skill metadata (YAML frontmatter: `name`, `description`)
- `README.md` — short overview and runbooks (optional)
- IaC & templates: CloudFormation (`.yaml`, `.json`), Terraform (`.tf`), CDK apps (`.ts`, `.py`)
- Image & build definitions: Packer templates (`.json`), AMI lists (`.txt`, `.json`)
- WorkSpaces provisioning: fleet templates and parameter files (`.json`, `.yaml`)
- Automation & scripts: `.ps1`, `.sh`, `.py` (boto3 / AWS CLI scripts)
- SSM documents & runbooks: `.json`, `.yaml` (Systems Manager)
- Monitoring & dashboards: CloudWatch dashboard files (`.json`), saved queries (`.txt`/`.kql`-like)
- Policies & IAM: `.json` (policy documents), RBAC lists (`.csv`)
- Config & secrets: `.yaml`, `.json` (kept out of repo or in vault)
- Docs & runbooks: `.md` (playbooks, troubleshooting guides)

## Core Responsibilities

1. **Understand the environment**
   - Identify account layout, VPC/subnet design, directory type (AWS Managed AD, AD Connector, on-prem AD), and network connectivity for domain join.

2. **Fleet & image strategy**
   - Design golden images, automated image builds (Packer, EC2 Image Builder), update/patch workflows, and WorkSpaces bundles.

3. **Provisioning & automation**
   - Automate fleet provisioning with IaC (CloudFormation, Terraform, CDK) and scripting (AWS CLI, boto3). Manage lifecycle: create, rebuild, terminate, and reassign WorkSpaces.

4. **Directory & identity**
   - Ensure secure domain join, AD permissions for computer objects, group policy strategy, and SSO/conditional access integration.

5. **Security & compliance**
   - Enforce IAM least privilege, encryption (EBS, in-transit), network segmentation, endpoint protection, and audit logging.

6. **Monitoring & troubleshooting**
   - Use CloudWatch, CloudTrail, and WorkSpaces health metrics to monitor session health, connection failures, and performance. Use SSM for remote troubleshooting.

7. **Cost & scale**
   - Recommend pooled vs dedicated WorkSpaces, schedule-based start/stop, and right-sizing to manage costs.

## Output style

- Provide concise, stepwise runbooks and minimal, copy‑pasteable CLI/SDK snippets (AWS CLI, boto3, CloudFormation/Terraform examples).
- When editing/creating files, reference file paths and snippet context.
- Prefer pragmatic automation that fits the customer’s environment and security constraints.