# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in SkillsHub, please report it responsibly.

**Email:** [43215937+ComeOnOliver@users.noreply.github.com](mailto:43215937+ComeOnOliver@users.noreply.github.com)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** open a public GitHub issue for security vulnerabilities.

## Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 72 hours |
| Fix for critical issues | Within 7 days |
| Fix for non-critical issues | Within 30 days |

## Scope

### In Scope

- SkillsHub API (`/api/v1/*`)
- Web application (authentication, authorization, data handling)
- Authentication flows (GitHub OAuth, API key auth)
- On-chain donation system
- Skill import and indexing pipeline

### Out of Scope

- Third-party skills content (vulnerabilities in skills themselves)
- Skills hosted on external repositories
- Third-party dependencies (report these upstream)
- Social engineering attacks
- Denial of service attacks

## Rewards

We do not currently offer a paid bug bounty program. However, we greatly appreciate responsible disclosure and will acknowledge contributors in our [CHANGELOG](./CHANGELOG.md).

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |
