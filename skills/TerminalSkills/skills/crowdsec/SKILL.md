# CrowdSec

## Overview

CrowdSec is an open-source, community-driven security engine. It detects attacks (brute force, DDoS, scans) by analyzing logs and shares threat intelligence with the community. Think fail2ban but collaborative and modern.

## Instructions

### Step 1: Install

```bash
curl -s https://install.crowdsec.net | sudo bash
sudo apt install crowdsec crowdsec-firewall-bouncer-iptables
```

### Step 2: Configure Collections

```bash
# Install detection scenarios
sudo cscli collections install crowdsecurity/nginx
sudo cscli collections install crowdsecurity/sshd
sudo cscli collections install crowdsecurity/linux
sudo cscli collections list
```

### Step 3: Monitor

```bash
sudo cscli decisions list      # blocked IPs
sudo cscli alerts list         # alerts
sudo cscli metrics             # statistics
```

### Step 4: Docker Deployment

```yaml
# docker-compose.yml — CrowdSec with Nginx bouncer
services:
  crowdsec:
    image: crowdsecurity/crowdsec
    volumes:
      - /var/log/nginx:/var/log/nginx:ro
      - crowdsec_config:/etc/crowdsec
      - crowdsec_data:/var/lib/crowdsec/data
    environment:
      COLLECTIONS: "crowdsecurity/nginx crowdsecurity/http-cve"
  bouncer:
    image: crowdsecurity/nginx-bouncer
    environment:
      CROWDSEC_BOUNCER_API_KEY: your-api-key
volumes:
  crowdsec_config:
  crowdsec_data:
```

## Guidelines

- Free and open-source. Community shares 10M+ threat signals.
- Bouncers enforce decisions — iptables, nginx, Cloudflare, AWS WAF.
- Lower false positives than fail2ban due to community-validated intelligence.
- Console (app.crowdsec.net) provides dashboard and threat visualization.
