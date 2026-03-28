# Nginx

## Overview

Nginx is a high-performance web server and reverse proxy that serves static files, proxies requests to application servers, load balances across backends, terminates TLS, and caches responses. It handles thousands of concurrent connections with minimal resource usage through an event-driven, non-blocking architecture.

## Instructions

- When configuring server blocks, define virtual hosts with `server_name` for domain matching and `listen` for ports, using separate blocks for HTTP (port 80, redirect to HTTPS) and HTTPS (port 443 with SSL and HTTP/2).
- When setting up reverse proxying, use `proxy_pass` to forward to upstream servers and set `proxy_set_header` for Host, X-Real-IP, X-Forwarded-For, and X-Forwarded-Proto to preserve client information.
- When load balancing, define `upstream` blocks with multiple servers and choose the strategy: round-robin (default), `least_conn`, `ip_hash` for sticky sessions, or weighted distribution.
- When configuring TLS, set modern protocols (`TLSv1.2 TLSv1.3`), enable `ssl_stapling` and session caching, and integrate with Let's Encrypt via certbot for automatic certificate renewal.
- When serving static files, enable `gzip` compression for text-based content, set `expires 1y` for hashed assets, use `sendfile on` for efficient transfer, and `try_files` for SPA fallback routing.
- When adding security, set headers (X-Frame-Options, X-Content-Type-Options, HSTS, CSP) and configure rate limiting with `limit_req_zone` to prevent abuse.

## Examples

### Example 1: Set up Nginx as reverse proxy with TLS for a Node.js app

**User request:** "Configure Nginx with HTTPS to proxy to my Node.js API on port 3000"

**Actions:**
1. Create a server block listening on port 443 with SSL certificate paths and HTTP/2
2. Configure `proxy_pass http://localhost:3000` with proper header forwarding
3. Add a port 80 server block that redirects all HTTP to HTTPS
4. Enable ssl_stapling, session caching, and modern cipher suites

**Output:** An Nginx configuration with TLS termination, HTTP-to-HTTPS redirect, and reverse proxy to the Node.js app.

### Example 2: Configure load balancing with health checks

**User request:** "Load balance across three API servers with failover"

**Actions:**
1. Define an `upstream` block with three backend servers and `least_conn` strategy
2. Set `max_fails=3 fail_timeout=30s` for automatic health checking
3. Add a `backup` server that activates only when primary servers are down
4. Configure proxy caching for GET requests to reduce backend load

**Output:** A load-balanced setup with automatic failover, health checks, and response caching.

## Guidelines

- Use `server_name` with specific domains; avoid the `_` catch-all in production for security.
- Always redirect HTTP to HTTPS with `return 301 https://$host$request_uri` on the port 80 block.
- Set security headers on every server block using an included snippet file for consistency.
- Use `try_files` for SPA routing instead of `rewrite` since it is faster and more explicit.
- Rate-limit API endpoints with `limit_req zone=api burst=20 nodelay` to prevent abuse without affecting normal traffic.
- Cache static assets aggressively: `expires 1y` for hashed filenames and `expires 1h` for HTML.
- Always test config before reload: `nginx -t && nginx -s reload` to prevent downtime from syntax errors.
