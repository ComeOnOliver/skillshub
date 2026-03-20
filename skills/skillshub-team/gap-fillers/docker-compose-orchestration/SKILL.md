# Docker Compose Orchestration

Use when orchestrating multi-container applications with Docker Compose (v2+).

## Compose File Structure
```yaml
# compose.yaml (preferred over docker-compose.yml)
name: myapp

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          memory: 512M

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app

  worker:
    build: .
    command: node worker.js
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge
```

## Key Commands
```bash
docker compose up -d              # Start all services detached
docker compose up -d --build      # Rebuild and start
docker compose down               # Stop and remove containers
docker compose down -v            # Also remove volumes
docker compose logs -f app        # Follow logs for service
docker compose exec app sh        # Shell into running container
docker compose ps                 # List running services
docker compose pull               # Pull latest images
docker compose config             # Validate and view merged config
```

## Environment Management
```yaml
# Use .env file (auto-loaded)
services:
  app:
    env_file:
      - .env
      - .env.local  # overrides
    environment:
      - NODE_ENV=${NODE_ENV:-production}
```

## Multi-stage Profiles
```yaml
services:
  app:
    profiles: []  # always started
  debug:
    profiles: ["dev"]
    image: busybox
  test:
    profiles: ["test"]
    build:
      target: test
```
```bash
docker compose --profile dev up   # Start with dev profile
```

## Production Patterns
- Always use `healthcheck` + `depends_on.condition: service_healthy`
- Set `restart: unless-stopped` for production services
- Use named volumes for persistent data, never bind mounts in prod
- Pin image versions (e.g., `postgres:16.2-alpine`, not `postgres:latest`)
- Use `deploy.resources` to set memory/CPU limits
- Use `docker compose watch` for development hot-reload

## Common Pitfalls
- Port conflicts: check `docker compose ps` and `lsof -i :PORT`
- Volume permissions: use `user: "${UID}:${GID}"` or init scripts
- Network issues: services communicate via service name, not localhost
- Build cache: use `docker compose build --no-cache` to force rebuild