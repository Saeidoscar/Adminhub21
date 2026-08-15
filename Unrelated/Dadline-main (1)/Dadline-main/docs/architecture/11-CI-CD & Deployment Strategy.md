# 11 — CI/CD & Deployment Strategy
> Version: 2.0
> **Automated, Predictable & Zero-Downtime Deployments**
---

# Overview

The goal of the Dadline CI/CD pipeline is to automate the entire Build, Test, and Deployment process, ensuring that deployments are repeatable, reliable, and independent of manual intervention.

No manual deployments are performed in the production environment.

All deployments are executed through GitHub Actions.

---

# Goals

- Fully Automated
- Repeatable
- Zero Downtime
- Fast Rollback
- Immutable Deployments
- Security First
- GitOps Friendly

---

# Technology Stack

| Purpose | Technology |
|----------|------------|
| Source Control | GitHub |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (GHCR) |
| Deployment | Docker Compose |
| Reverse Proxy | Traefik |
| Server | Ubuntu LTS |
| Notifications | Telegram / Discord (Future) |

---

# Git Flow

## Main Branches

```text
main
develop
```

## Temporary Branches

```text
feature/*
bugfix/*
hotfix/*
release/*
refactor/*
```

---

# Deployment Strategy

| Branch | Environment |
|---------|-------------|
| develop | Staging |
| main | Production |

---

# Workflow Overview

```text
Developer

↓

Git Push

↓

GitHub

↓

GitHub Actions

↓

Lint

↓

Static Analysis

↓

Tests

↓

Build Docker Images

↓

Push GHCR

↓

SSH Deploy

↓

Docker Compose Pull

↓

Rolling Restart

↓

Health Check

↓

Deployment Complete
```

---

# Pipeline Stages

## Stage 1

Checkout

```bash
actions/checkout
```

---

## Stage 2

Install Dependencies

```bash
pnpm install

composer install
```

---

## Stage 3

Static Analysis

Frontend

```text
TypeScript

ESLint
```

Backend

```text
Laravel Pint

PHPStan
```

---

## Stage 4

Unit Tests

Frontend

```text
Vitest
```

Backend

```text
Pest
```

---

## Stage 5

Integration Tests

- API Tests
- Database Tests

---

## Stage 6

Build

```text
Next.js

Laravel

Docker Images
```

---

## Stage 7

Push Images

```text
ghcr.io/dadline/web

ghcr.io/dadline/admin

ghcr.io/dadline/office

ghcr.io/dadline/api
```

---

## Stage 8

Deploy

Production Server

```bash
docker compose pull

docker compose up -d
```

---

## Stage 9

Health Check

Laravel

```text
GET /up
```

Next.js

```text
GET /
```

---

## Stage 10

Notifications (Future)

```text
Telegram

Discord

Slack
```

---

# Docker Image Policy

Every release generates a new Docker image.

Images are immutable.

Existing image tags must never be overwritten.

---

# Docker Tags

Latest

```text
latest
```

Version

```text
v2.0.0
```

Commit

```text
sha-xxxxxxxx
```

---

# Build Strategy

Each application is built independently.

```text
web

admin

office

api
```

---

# Parallel Builds

GitHub Actions executes all application builds in parallel whenever possible.

---

# Deployment Strategy

Production deployments use a rolling restart.

```bash
docker compose up -d
```

This minimizes service interruption during deployment.

---

# Database Migration

Deployment order:

```text
Deploy Image

↓

Run Migrations

↓

Restart Services

↓

Health Check
```

Database migrations must complete successfully before the deployment is considered healthy.

---

# Rollback Strategy

If deployment fails:

```text
Previous Docker Image
```

is restored automatically.

Target rollback time:

```text
< 5 Minutes
```

---

# Deployment Lock

Only one production deployment is allowed at a time.

GitHub Actions concurrency should be enabled to prevent simultaneous deployments.

---

# Secrets

GitHub Secrets

```text
SSH_PRIVATE_KEY

SERVER_HOST

SERVER_USER

GHCR_TOKEN

APP_KEY

AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY
```

---

# Never Store

The following must never be committed to the repository:

```text
.env

Private Keys

Passwords

Secrets
```

---

# Environment Files

Development

```text
.env
```

Production

```text
.env.production
```

Staging

```text
.env.staging
```

---

# Release Process

```text
Merge

↓

CI

↓

Tag

↓

Docker Build

↓

Deploy

↓

Health Check

↓

Release
```

---

# Release Versioning

Semantic Versioning

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
2.0.0

3.1.0

3.1.1
```

---

# Feature Flags

New features should be released behind Feature Flags.

Examples:

```text
AI_CHAT

LAWYER_SEARCH_V2

NEW_PAYMENT
```

---

# Maintenance Mode

Maintenance mode should be avoided whenever possible.

If required, Laravel Maintenance Mode should be enabled.

---

# Zero-Downtime Rules

- Start the new container.
- Perform a health check.
- Switch traffic to the new container.
- Remove the old container.

---

# Health Checks

Laravel

```text
/up
```

Next.js

```text
/
```

Database

```text
pg_isready
```

Redis

```text
PING
```

---

# Failure Policy

If a health check fails, the deployment must be rolled back automatically.

---

# Monitoring

Every deployment should record:

- Version
- Commit
- Build Time
- Deploy Time
- Triggered By
- Result

---

# Logging

All application logs are written to:

```text
STDOUT
```

GitHub Actions retains complete pipeline logs.

---

# Security Rules

- Deploy only from approved branches.
- Protect production branches.
- Require pull request reviews.
- Require successful status checks.
- Enable signed commits (Future).

---

# Backup Before Deployment

A database backup is mandatory before running database migrations.

---

# Server Requirements

Minimum requirements:

```text
Ubuntu 24.04 LTS

Docker

Docker Compose

Traefik

Git
```

---

# CI/CD Diagram

```text
Developer
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
 ┌────┼──────────────────────┐
 ▼    ▼                      ▼
Lint Tests            Static Analysis
      │
      ▼
Docker Build
      │
      ▼
GHCR
      │
      ▼
Production Server
      │
      ▼
Docker Compose
      │
      ▼
Health Check
      │
      ▼
Deployment Success
```

---

# Golden Rules

- No manual deployments
- Everything is versioned
- Everything is Dockerized
- Health checks are mandatory
- Always maintain a rollback plan
- Backup before migrations
- Immutable Docker images
- GitHub Actions is the only deployment pipeline
- Protect production branches
- Zero-downtime deployments

---

# Checklist

- [x] GitHub Actions
- [x] GHCR
- [x] Docker Images
- [x] Parallel Build
- [x] Rolling Deploy
- [x] Health Checks
- [x] Rollback
- [x] Feature Flags
- [x] Semantic Versioning
- [x] Protected Branches
- [x] Backup Before Migration

---

# Architecture Decision Record

## ADR-011

### Decision

Adopt **GitHub Actions** and **GitHub Container Registry (GHCR)** as the project's official CI/CD platform.

### Rationale

- Seamless GitHub integration
- Simple maintenance
- Well-suited for solo development
- Easily scalable for larger teams
- Reduces human error

### Consequences

- All deployments are fully traceable.
- The release process is fully automated.
- Rollbacks are fast and standardized.
- Development, Staging, and Production environments follow the same deployment workflow.