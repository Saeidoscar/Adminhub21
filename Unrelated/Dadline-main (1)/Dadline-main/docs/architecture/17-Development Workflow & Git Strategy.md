# 17 — Development Workflow & Git Strategy
> Version: 2.0
---

# Overview

This document defines a standardized development workflow to ensure that every change in Dadline is traceable, reviewable, and deployable.

The workflow is designed to:

- Be simple for a solo developer today.
- Scale seamlessly to a larger engineering team in the future.

---

# Engineering Principles

All developers should follow these principles:

- Small Changes
- Frequent Commits
- Small Pull Requests
- Automated Testing
- Automated Deployment
- Code Review
- Documentation First

---

# Git Strategy

The project follows **Trunk-Based Development** with two primary branches.

```text
main

develop
```

---

## main

Always production-ready.

Direct commits are not allowed.

---

## develop

Primary branch for day-to-day development.

All new features are merged into `develop` first.

---

# Branch Types

## Feature

```text
feature/
```

Examples:

```text
feature/create-case
feature/payment-gateway
feature/ai-chat
```

---

## Bugfix

```text
bugfix/
```

Examples:

```text
bugfix/login-timeout
bugfix/file-upload
```

---

## Hotfix

For production issues.

```text
hotfix/
```

---

## Release

When required.

```text
release/
```

---

## Refactor

```text
refactor/
```

---

# Branch Naming Convention

Format:

```text
type/short-description
```

Valid examples:

```text
feature/document-upload
bugfix/otp-expiration
hotfix/payment-error
```

Invalid examples:

```text
new-feature
temp
mybranch
fix2
```

---

# Development Workflow

```text
Issue

↓

Create Branch

↓

Development

↓

Tests

↓

Commit

↓

Push

↓

Pull Request

↓

Review

↓

CI

↓

Merge

↓

Deploy
```

---

# Pull Request Rules

Every Pull Request should:

- Be small and focused.
- Address a single concern.
- Pass all build checks.
- Pass all tests.
- Pass linting.

---

# Maximum Pull Request Size

Recommended:

```text
< 500 Lines Changed
```

---

# Commit Strategy

Commits should be small and meaningful.

Examples:

```text
Add upload validation

Fix OTP expiration

Improve search performance
```

---

# Conventional Commits

Always use:

```text
feat:
fix:
docs:
refactor:
test:
perf:
style:
ci:
build:
chore:
```

Examples:

```text
feat(case): add lawyer assignment

fix(auth): resolve expired session

docs(api): update versioning

refactor(search): simplify filters
```

---

# Commit Requirements

Every commit must:

- Build successfully.
- Pass linting.
- Pass tests.

---

# Avoid

```text
final
test
aaa
update
new changes
```

---

# Pull Request Template

Each Pull Request should include:

- Summary
- Related Issue
- Screenshots (if applicable)
- Checklist
- Testing Notes

---

# Merge Strategy

Always use:

```text
Squash Merge
```

Benefits:

- Cleaner Git history
- Fewer commits
- Easier rollback

---

# Protected Branches

```text
main

develop
```

Protection rules:

- No direct pushes
- Pull Requests required
- CI must pass
- Code review required

---

# Code Review

Review should cover:

- Architecture
- Naming
- Performance
- Security
- Tests
- Readability
- Documentation

---

# Review Checklist

- Does the feature work correctly?
- Are tests included?
- Are security requirements satisfied?
- Is performance acceptable?
- Is naming consistent?
- Does the documentation require updates?

---

# Issue Management

Every feature should have a corresponding issue.

Example:

```text
#125

Create Lawyer Dashboard
```

---

# Labels

Examples:

```text
feature
bug
security
performance
documentation
backend
frontend
api
devops
```

---

# Milestones

Examples:

```text
v2.0
v2.1
AI
MVP
Production
```

---

# Release Process

```text
Feature Complete

↓

Merge develop

↓

Tests

↓

Tag

↓

Deploy to Staging

↓

Approval

↓

Merge into main

↓

Production
```

---

# Semantic Versioning

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
2.0.0
3.1.0
3.1.1
4.0.0
```

---

# Changelog

Every release must include a changelog.

Format:

```text
Added

Changed

Fixed

Removed

Deprecated

Security
```

---

# Documentation

Every significant change must include corresponding documentation updates.

---

# Architecture Changes

Every architectural change requires a new ADR.

---

# Refactoring

Refactoring must not change application behavior.

---

# Technical Debt

Technical debt should always be tracked as issues.

---

# Feature Flags

New features should be deployed behind feature flags and remain disabled until ready.

---

# Local Development Workflow

```text
Pull

↓

Install

↓

Run Tests

↓

Development

↓

Commit

↓

Push
```

---

# Git Hooks

### Pre-Commit

- ESLint
- Laravel Pint
- Type Check

### Pre-Push

- Tests
- Build

---

# Definition of Ready (DoR)

A feature is ready for development when:

- Requirements are defined.
- UI/UX is complete.
- API specifications are available.
- Acceptance criteria are documented.
- An issue has been created.

---

# Definition of Done (DoD)

A feature is complete when:

- Implementation is finished.
- Tests are included.
- CI passes successfully.
- Code review is completed.
- Documentation is updated.
- The feature is ready for deployment.

---

# Development Checklist

Before merging:

- [ ] Tests Pass
- [ ] Lint Pass
- [ ] Build Pass
- [ ] Documentation Updated
- [ ] No TODO Items
- [ ] No Debug Code
- [ ] No Console Logs
- [ ] No Commented-Out Code

---

# Prohibited Practices

- ❌ Direct pushes to `main`
- ❌ Commits without tests
- ❌ Merging without code review
- ❌ Force pushing to protected branches
- ❌ Committing `.env` files
- ❌ Pushing secrets or credentials

---

# Workflow Diagram

```text
Issue
   │
   ▼
Feature Branch
   │
   ▼
Development
   │
   ▼
Tests
   │
   ▼
Commit
   │
   ▼
Push
   │
   ▼
Pull Request
   │
   ▼
CI Pipeline
   │
   ▼
Review
   │
   ▼
Squash Merge
   │
   ▼
Deploy
```

---

# Golden Rules

- Small Branches
- Small Pull Requests
- Frequent Commits
- Test Everything
- CI Must Pass
- Review Before Merge
- Documentation Matters
- ADR for Architecture Changes
- No Direct Push to Production Branches

---

# Checklist

- [x] Git Strategy
- [x] Branch Strategy
- [x] Pull Request Rules
- [x] Code Review
- [x] Conventional Commits
- [x] Definition of Ready
- [x] Definition of Done
- [x] Feature Flags
- [x] Changelog
- [x] ADR Process

---

## ADR-017

### Decision

Adopt **Trunk-Based Development** with **GitHub Flow** and **Squash Merge**.

### Rationale

- Well suited for solo development.
- Scales effectively for larger engineering teams.
- Maintains a clean Git history.
- Reduces merge conflicts.
- Enables faster and more reliable deployments.

### Consequences

- All changes are introduced through Pull Requests.
- Code quality is enforced through CI and code review.
- Documentation and ADRs remain synchronized with architectural changes.
- The development, release, and maintenance process remains standardized and predictable.