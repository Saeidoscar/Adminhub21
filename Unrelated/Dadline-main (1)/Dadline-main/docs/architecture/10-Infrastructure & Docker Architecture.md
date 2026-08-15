# 10 — Infrastructure & Docker Architecture
> Version: 2.0
> **Cloud-Native Infrastructure**
---

# Overview

Dadline's infrastructure follows a simple principle:

> **Production should be as close to Development as possible.**

All services run inside Docker containers.

No service is installed directly on the host operating system.

---

# Infrastructure Goals

- Docker First
- Immutable Infrastructure
- Zero-Downtime Deployment
- Reverse Proxy
- Automatic SSL
- Easy Scaling
- Easy Backup
- Monitoring Ready
- Cloud Ready
- Self-Hosted Friendly

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Reverse Proxy | Traefik v3 |
| Container Runtime | Docker Engine |
| Orchestration | Docker Compose |
| Backend | Laravel 13 |
| Frontend | Next.js 16 |
| Database | PostgreSQL 17 |
| Cache | Redis 8 |
| Object Storage | S3 Compatible Storage |
| CDN | ArvanCloud |
| SSL | Let's Encrypt |
| Queue | Redis |
| Scheduler | Laravel Scheduler |
| Worker | Laravel Horizon |

---

# Why Docker?

Every service should be isolated and self-contained.

Benefits:

- Consistent environments
- Simple deployments
- Fast rollbacks
- Isolation
- Reproducible builds
- Portability

---

# Why Traefik?

Traefik is the project's primary reverse proxy.

Benefits:

- Docker Native
- Automatic Service Discovery
- Automatic HTTPS
- Dynamic Configuration
- Dashboard
- Middleware Support
- Load Balancing
- ArvanCloud Compatible

---

# Infrastructure Diagram

```text
                      Internet
                           │
                           ▼
                    ArvanCloud CDN
                           │
                           ▼
                    ArvanCloud WAF
                           │
                           ▼
                     Traefik v3
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   dadline.net      admin.dadline      office.dadline
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                     Laravel API
                           │
        ┌──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼
 PostgreSQL         Redis       S3 Compatible
                                   Storage
```

---

# Docker Networks

The infrastructure uses three Docker networks.

```text
proxy

backend

internal
```

---

## proxy

Public network.

Only Traefik is exposed through this network.

---

## backend

Internal communication between application services.

```text
Laravel

Next.js

Redis

PostgreSQL
```

---

## internal

Restricted network for services that should never be publicly accessible.

---

# Directory Structure

```text
infrastructure/

docker/

compose/

development/

production/

traefik/

dynamic/

certificates/

postgres/

redis/

backup/

monitoring/
```

---

# Docker Compose Files

```text
docker-compose.yml

docker-compose.dev.yml

docker-compose.prod.yml
```

---

# Production Containers

```text
traefik

web

admin

office

api

postgres

redis

horizon

scheduler
```

---

# Optional Containers

Future additions may include:

```text
meilisearch

typesense

mailpit

grafana

prometheus

loki

tempo
```

Production always uses **S3 Compatible Storage** for file storage.

---

# Container Naming

```text
dadline-web

dadline-admin

dadline-office

dadline-api

dadline-postgres

dadline-redis

dadline-traefik
```

---

# Persistent Volumes

Persistent volumes include:

```text
postgres_data

redis_data

traefik_data

logs
```

---

# Stateless Containers

The following containers should remain stateless:

```text
Laravel

Next.js
```

---

# Environment Variables

Each application maintains its own environment configuration.

```text
apps/web/.env

apps/admin/.env

apps/api/.env
```

---

# Secrets

Production secrets must never be committed to Git.

Examples:

```text
APP_KEY

DB_PASSWORD

REDIS_PASSWORD

AWS_SECRET_ACCESS_KEY

SMTP_PASSWORD
```

---

# Health Checks

Every service should expose a health check.

Laravel:

```text
GET /up
```

Next.js:

```text
GET /
```

PostgreSQL:

```text
pg_isready
```

Redis:

```text
PING
```

---

# Restart Policy

All containers use:

```text
unless-stopped
```

---

# Logging

Applications write logs to:

```text
STDOUT
```

Docker is responsible for log collection and management.

---

# Queue Workers

Laravel Horizon runs in a dedicated container.

```text
dadline-horizon
```

---

# Scheduler

Laravel Scheduler runs in its own container.

```text
dadline-scheduler
```

Every minute it executes:

```text
php artisan schedule:run
```

---

# Object Storage

Files are always stored outside application containers.

Supported providers include:

- ParsPack
- ArvanCloud

Storage is managed through Laravel Filesystem.

---

# File Upload Flow

```text
Browser

↓

Laravel API

↓

Validation

↓

S3 Compatible Storage

↓

Database Metadata

↓

Response
```

---

# SSL

Traefik manages SSL certificates.

Supported options:

```text
Let's Encrypt
```

or

```text
ArvanCloud Origin Certificate
```

---

# ArvanCloud

ArvanCloud provides:

- CDN
- DNS
- WAF
- DDoS Protection
- Caching
- TLS

---

# Resource Limits

Every container should define CPU and memory limits.

```yaml
CPU

Memory
```

---

# Backup Strategy

Daily:

- PostgreSQL backup

Weekly:

- Docker volume snapshot

Files:

- Stored in S3 Compatible Storage

---

# Disaster Recovery

Recovery objectives:

Recovery Time Objective (RTO):

```text
30 Minutes
```

Recovery Point Objective (RPO):

```text
15 Minutes
```

---

# Monitoring

Initial deployment includes health checks only.

Future monitoring stack:

```text
Prometheus

Grafana

Loki

Tempo
```

---

# Deployment Flow

```text
GitHub

↓

GitHub Actions

↓

Docker Build

↓

Docker Registry

↓

Server Pull

↓

Rolling Restart

↓

Health Check

↓

Deployment Complete
```

---

# Security Rules

- Run containers as non-root users.
- Publish only required ports.
- Never expose PostgreSQL to the public internet.
- Keep Redis on internal networks only.
- Restrict Object Storage access using IAM.
- Never embed secrets inside Docker images.

---

# Golden Rules

- Docker First
- Traefik Reverse Proxy
- Stateless Applications
- Persistent Data Only
- S3 Compatible Storage
- Health Checks
- Automatic HTTPS
- ArvanCloud Frontend
- Immutable Infrastructure
- Zero Manual Configuration

---

# Checklist

- [x] Docker
- [x] Docker Compose
- [x] Traefik v3
- [x] PostgreSQL 17
- [x] Redis 8
- [x] Laravel Horizon
- [x] Laravel Scheduler
- [x] ArvanCloud
- [x] S3 Compatible Storage
- [x] Let's Encrypt
- [x] Health Checks
- [x] Backup Strategy

---

# Architecture Decision Record

## ADR-010

### Decision

Use **Docker Compose** and **Traefik** as the project's primary infrastructure platform.

### Rationale

- Simple to manage for a small development team
- Lower operational cost than Kubernetes
- Fast deployments
- Easily scalable without architectural changes
- Fully aligned with a Container-First approach

### Consequences

- All services are containerized.
- Deployments and rollbacks are standardized and repeatable.
- New services can be added with minimal infrastructure changes.
- Future migration to Kubernetes is possible without major architectural changes.