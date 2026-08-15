# Dadline Architecture v2.0
> Enterprise Software Architecture Documentation
---

## Overview

Dadline is a comprehensive legal services platform designed to provide online legal services, case management, legal process automation, artificial intelligence capabilities, and public APIs.

This document serves as the official architecture reference for the project, and all developers are expected to follow the standards defined here.

---

# Goals

- Enterprise Ready
- Cloud Ready
- Docker First
- API First
- AI Ready
- SEO Friendly
- High Performance
- Secure by Default
- Developer Friendly
- Scalable
- Maintainable

---

# Core Principles

## Simplicity First

Every feature should be implemented with the minimum necessary complexity.

Avoid introducing unnecessary layers.

---

## API First

All system capabilities are designed as APIs first.

All clients (Web, Admin, Office, and Mobile) act exclusively as API consumers.

---

## Feature First

Code is organized by feature rather than file type.

---

## Modular Monolith

Microservices are introduced only when there is a clear and justified need.

---

## Convention over Configuration

The project follows well-defined standards.

Conventions take precedence over individual preferences.

---

# Technology Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

---

## Backend

- Laravel 13
- PHP 8.4

---

## Database

- PostgreSQL 17

---

## Authentication

- Auth.js v5
- Laravel Sanctum

---

## Storage

- S3 Compatible Storage

Supported providers:

- AWS S3
- ArvanCloud R2
- Arvan Object Storage
- Liara Object Storage
- DigitalOcean Spaces
- Backblaze B2

---

## Cache

- Redis 8

---

## Queue

- Redis Queue

---

## Infrastructure

- Docker
- Docker Compose
- Traefik v3

---

## Monorepo

- pnpm Workspace
- Turborepo

---

## Testing

### Backend

- Pest

### Frontend

- Vitest
- Playwright

---

## CI/CD

- GitHub Actions

---

# Architecture

```text
                 Internet
                      │
             ArvanCloud CDN/WAF
                      │
                      ▼
                 Traefik v3
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
 dadline.net     admin.dadline    office.dadline
      │               │               │
      └───────────────┴───────────────┘
                      │
                  Laravel API
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
 PostgreSQL       Redis        S3 Storage
```

---

# Repository Structure

```text
dadline/

apps/
packages/
infrastructure/
tooling/
scripts/
docs/
.github/

docker-compose.yml
turbo.json
pnpm-workspace.yaml
README.md
```

---

# Applications

```text
apps/

web/
admin/
office/
api/
```

---

# Shared Packages

```text
packages/

ui/
types/
utils/
config/
api-client/
eslint/
typescript/
```

---

# Development Rules

- No business logic should be implemented in the frontend.
- No database queries should be written directly in controllers.
- All APIs must be versioned.
- All identifiers must use UUID v7.
- All files must be stored in S3-compatible storage.
- All services must be containerized with Docker.
- All projects must use TypeScript Strict Mode.
- Every pull request must pass the CI pipeline.