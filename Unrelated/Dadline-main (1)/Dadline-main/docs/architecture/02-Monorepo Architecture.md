# 02 — Monorepo Architecture
> Version: 2.0
---

# Purpose

This document defines the repository structure of the Dadline project.

The Monorepo architecture provides the following benefits:

- Simplified project management
- Shared code written only once
- Unified versioning across all applications
- Faster CI/CD execution
- Efficient build caching

---

# Why Monorepo?

Dadline is more than a single website.

It is designed to support multiple applications, including:

- Public Website
- Admin Panel
- Office Panel
- Mobile API
- AI Services
- Public API
- Documentation
- Background Workers
- WebSocket Server

Using separate repositories would introduce:

- Duplicate types
- Duplicate UI components
- Duplicate utilities
- Version inconsistencies
- More complex dependency management
- Complicated release processes

For these reasons, a Monorepo architecture was selected.

---

# Selected Technologies

| Purpose | Technology |
|----------|------------|
| Package Manager | pnpm |
| Workspace | pnpm Workspace |
| Monorepo | Turborepo |
| Task Runner | Turbo |
| Build Cache | Turbo Remote Cache (Future) |

---

# Root Structure

```text
dadline/

apps/
packages/
infrastructure/
docs/
scripts/
tooling/
.github/

.env.example
.gitignore
package.json
pnpm-workspace.yaml
turbo.json
docker-compose.yml
docker-compose.dev.yml
README.md
```

---

# Root Responsibilities

The root directory is responsible only for project-level configuration.

It must not contain:

- Business logic
- React components
- Laravel code
- Database code

It should contain only:

- Workspace configuration
- Docker configuration
- Scripts
- Documentation
- CI/CD configuration

---

# apps/

All executable applications are located under `apps/`.

```text
apps/

web/
admin/
office/
api/
```

---

## apps/web

**Domain**

```text
dadline.net
```

**Responsibilities**

- Landing Page
- Blog
- SEO
- Service Pages
- User Registration
- Authentication
- User Dashboard

---

## apps/admin

**Domain**

```text
admin.dadline.net
```

**Responsibilities**

- User Management
- Case Management
- Payment Management
- Reporting
- System Settings

---

## apps/office

**Domain**

```text
office.dadline.net
```

**Responsibilities**

- Lawyer Dashboard
- Case Management
- Client Management
- Meeting Management
- Document Management

---

## apps/api

**Technology**

Laravel 13

**Responsibilities**

- Business Logic
- Authentication
- Authorization
- REST API
- Queue Processing
- Events
- Notifications

This application contains no frontend.

---

# Future Applications

Additional applications can be introduced without changing the repository structure.

```text
apps/

worker/

socket/

ai/

docs/

status/

mobile-api/
```

---

# packages/

All shared code is located in `packages/`.

```text
packages/

ui/
api-client/
types/
utils/
config/
eslint/
typescript/
```

---

# ui

Official Design System.

```text
packages/ui/

components/
hooks/
providers/
styles/
icons/
tokens/
themes/

index.ts
```

## Rules

All reusable UI components must be implemented here.

Examples:

```text
Button
Input
Card
Dialog
Badge
Avatar
Table
Pagination
Tabs
Tooltip
```

Duplicating these components inside applications is prohibited.

---

# api-client

All frontend-to-backend communication is handled through this package.

```text
packages/api-client/

client/

repositories/

types/

index.ts
```

Examples:

```text
UserRepository
CaseRepository
LawyerRepository
AuthRepository
DocumentRepository
```

## Why Repository?

Frontend applications must never call Axios or Fetch directly.

All requests must pass through repository classes.

---

# types

Shared project types.

```text
User
Case
Lawyer
Document
Invoice
Notification
ApiResponse
Pagination
```

## Rule

Types must never be duplicated.

All shared types must be imported from:

```text
@dadline/types
```

---

# utils

Shared utility functions.

```text
formatCurrency()

formatDate()

slugify()

phoneFormatter()

uuid()

download()

copy()
```

---

# config

Shared configuration.

```text
tailwind

eslint

prettier

lint-staged

commitlint
```

---

# eslint

All projects use a single shared ESLint configuration.

---

# typescript

All projects inherit from a common base configuration.

```text
base.json

next.json

node.json
```

---

# docs/

Official project documentation.

```text
Architecture

API

Database

ADR

Deployment

Guidelines

Conventions
```

---

# infrastructure/

Infrastructure resources.

```text
docker/

traefik/

postgres/

redis/

backup/

monitoring/
```

---

# scripts/

Project scripts.

```text
setup

deploy

backup

restore

seed

reset

lint
```

---

# tooling/

Development tools.

```text
husky

git-hooks

templates

generators
```

---

# Import Rules

Allowed:

```text
apps
↓
packages
```

Allowed:

```text
packages
↓
packages
```

Not Allowed:

```text
apps/web
↓
apps/admin
```

---

# Dependency Rules

```text
apps
↓
packages
↓
node_modules
```

Dependencies must always flow in this direction.

---

# Package Naming

All packages use the following namespace:

```text
@dadline/*
```

Examples:

```text
@dadline/ui
@dadline/utils
@dadline/types
@dadline/api-client
```

---

# Environment Variables

Each application must use only its own environment configuration.

Examples:

```text
apps/web/.env

apps/admin/.env

apps/office/.env

apps/api/.env
```

Applications must never access another application's environment variables.

---

# Build Strategy

## Development

```bash
pnpm dev
```

Runs all applications concurrently.

---

## Production

```bash
pnpm --filter web build

pnpm --filter admin build

pnpm --filter office build

pnpm --filter api build
```

---

# CI Strategy

```text
Lint
↓
Type Check
↓
Unit Test
↓
Build
↓
Docker Build
↓
Push Image
↓
Deploy
↓
Health Check
```

---

# Golden Rules

- Each application is independent.
- Shared code belongs only in `packages`.
- Business logic exists only in Laravel.
- Frontend applications are API consumers only.
- Types are defined once and shared.
- There is only one Design System.
- Direct imports between applications are prohibited.

---

# Architecture Overview

```text
                    Monorepo

                       │

     ┌─────────────────┴─────────────────┐

     │                                   │

   apps                            packages

     │                                   │

┌────┼────┬─────┐           ┌─────────────┼────────────┐

│    │    │     │           │             │            │

web admin office api       ui       api-client      types

                                    │

                                    ▼

                              Laravel API
```

---

# Checklist

- [x] Turborepo
- [x] pnpm Workspace
- [x] Shared Packages
- [x] Docker First
- [x] Feature First
- [x] Import Rules
- [x] Build Strategy
- [x] CI Strategy
- [x] Enterprise Ready