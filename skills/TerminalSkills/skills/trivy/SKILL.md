# Trivy

## Overview

Trivy is an open-source vulnerability scanner by Aqua Security. Scans container images, filesystems, git repos, and IaC for vulnerabilities, misconfigurations, and exposed secrets.

## Instructions

### Step 1: Install

```bash
brew install trivy
```

### Step 2: Container Scanning

```bash
trivy image node:20-alpine
trivy image --severity CRITICAL,HIGH my-app:latest
trivy image --format json --output results.json my-app:latest
```

### Step 3: Filesystem and Secret Scan

```bash
trivy fs .
trivy fs --scanners vuln,secret,misconfig .
```

### Step 4: IaC Scanning

```bash
trivy config ./terraform/
trivy config ./k8s/
```

## Guidelines

- Free and open-source — no account needed.
- Local vulnerability DB, updated automatically — scans are fast.
- Supports SBOM generation (CycloneDX, SPDX) for compliance.
- Use in CI to block deployments with critical CVEs.
