# 12 — Project Structure & Folder Standards
> Version: 2.0
> **Feature Driven · Domain Oriented · Clean Structure**
---

# Overview

A well-defined project structure is one of the most important factors for the long-term success of Dadline.

Its primary objectives are:

- Fast development
- Easy file discovery
- Reduced unnecessary dependencies
- Feature-driven development
- Easy refactoring
- Scalability

---

# Core Principles

The project structure should be:

- Feature First
- Domain Oriented
- Predictable
- Consistent
- Discoverable

---

# Monorepo Structure

```text
dadline/

apps/
packages/
infrastructure/
docs/
scripts/
tooling/
.github/

README.md
pnpm-workspace.yaml
turbo.json
docker-compose.yml
```

---

# apps/

All executable applications.

```text
apps/

web/
admin/
office/
api/
```

---

# packages/

Shared code.

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

# Infrastructure

```text
infrastructure/

docker/

traefik/

postgres/

redis/

backup/

monitoring/
```

---

# Laravel Structure

```text
apps/api/

app/

Domain/

Shared/

Support/

bootstrap/

config/

database/

routes/

tests/

storage/
```

---

# Domain Structure

Each domain is self-contained.

Example:

```text
Cases/

Application/

Domain/

Infrastructure/

Presentation/

Tests/
```

---

## Application

```text
Application/

Actions/

DTOs/

Queries/

Services/
```

---

## Domain

```text
Domain/

Models/

Enums/

Events/

Policies/
```

---

## Infrastructure

```text
Infrastructure/

Repositories/

Storage/

Mail/

SMS/
```

---

## Presentation

```text
Presentation/

Controllers/

Requests/

Resources/
```

---

## Tests

```text
Tests/

Feature/

Unit/
```

---

# Example

```text
Cases/

Application/

CreateCaseAction.php

UpdateCaseAction.php

CloseCaseAction.php

CreateCaseData.php

ActiveCasesQuery.php

Domain/

Case.php

CaseStatus.php

CaseCreated.php

CasePolicy.php

Infrastructure/

CaseRepository.php

Presentation/

CaseController.php

CreateCaseRequest.php

CaseResource.php

Tests/
```

---

# Next.js Structure

```text
apps/web/

src/

app/

features/

entities/

widgets/

shared/

styles/

providers/

middleware.ts
```

---

# app/

Responsible only for routing.

```text
app/

(public)

(auth)

(dashboard)

api/

layout.tsx

page.tsx

loading.tsx

error.tsx

not-found.tsx
```

---

# Feature Structure

Example:

```text
create-case/

api/

components/

hooks/

schemas/

types/

actions/

index.ts
```

---

# Shared Layer

```text
shared/

ui/

hooks/

lib/

config/

constants/

utils/

types/
```

---

# UI Package

```text
packages/ui/

components/

forms/

feedback/

navigation/

layout/

icons/

providers/

hooks/

styles/

index.ts
```

---

# API Client Package

```text
packages/api-client/

client/

repositories/

interceptors/

types/

errors/

index.ts
```

---

# Types Package

```text
packages/types/

api/

entities/

common/

auth/

index.ts
```

---

# Utils Package

```text
packages/utils/

date/

currency/

string/

validation/

number/

download/

clipboard/
```

---

# Config Package

```text
packages/config/

tailwind/

eslint/

prettier/

tsconfig/
```

---

# Assets

```text
public/

images/

icons/

fonts/
```

---

# Naming Rules

## Laravel

Folders use:

```text
PascalCase
```

Examples:

```text
Application

Infrastructure

Presentation
```

---

## Next.js

Folders use:

```text
kebab-case
```

Examples:

```text
create-case

search-lawyer

payment-history
```

---

# Barrel Exports

Every feature should expose an:

```text
index.ts
```

Example:

```ts
export * from "./components";
export * from "./hooks";
export * from "./api";
```

---

# Import Rules

Correct:

```ts
@dadline/ui

@dadline/types

@dadline/utils
```

Incorrect:

```ts
../../../Button

../../../../hooks
```

---

# Absolute Imports

Always use:

```text
@
```

or

```text
@dadline/*
```

---

# Maximum Folder Depth

Maximum:

```text
4 Levels
```

Deeper structures should be refactored.

---

# File Size

Maximum:

```text
300 Lines
```

---

# Component Size

Maximum:

```text
200 Lines
```

---

# Action Size

Maximum:

```text
100 Lines
```

---

# Function Size

Maximum:

```text
30 Lines
```

---

# Class Size

Preferred maximum:

```text
300 Lines
```

---

# Feature Independence

Each feature should be developed independently without requiring modifications to other features.

---

# Shared Code Rule

If the same code appears in two or more features, it should be moved to:

```text
Shared
```

or

```text
Packages
```

---

# Never

Avoid generic folders such as:

```text
Utils/

Helpers/

Common/

Misc/
```

Every file should have a clear and specific location.

---

# Test Structure

Laravel

```text
tests/

Feature/

Unit/

Architecture/
```

Next.js

```text
__tests__/

components/

hooks/

features/
```

---

# Configuration Files

Project root:

```text
package.json

composer.json

turbo.json

pnpm-workspace.yaml

docker-compose.yml
```

---

# Scripts

```text
scripts/

setup.sh

deploy.sh

backup.sh

restore.sh

reset.sh
```

---

# Documentation

```text
docs/

architecture/

backend/

frontend/

deployment/

adr/

api/
```

---

# Architecture Rules

Features must never import other features.

Correct:

```text
Feature

↓

Shared

↓

Package
```

Incorrect:

```text
Feature A

↓

Feature B
```

---

# Circular Dependencies

Circular dependencies are strictly prohibited.

---

# Dependency Graph

```text
apps

↓

packages

↓

shared

↓

framework
```

---

# Golden Rules

- Feature First
- Domain First
- Shared Last
- Absolute Imports
- Barrel Exports
- No Circular Dependencies
- No Deep Nesting
- Small Files
- Small Components
- Small Actions

---

# Checklist

- [x] Monorepo
- [x] Domain Structure
- [x] Feature Structure
- [x] Shared Packages
- [x] Barrel Exports
- [x] Absolute Imports
- [x] Naming Convention
- [x] Folder Convention
- [x] Test Structure
- [x] Documentation Structure

---

# Architecture Decision Record

## ADR-012

### Decision

Adopt a **Feature-First, Domain-Oriented Monorepo** project structure.

### Rationale

- Reduce coupling
- Improve readability
- Enable scalability
- Allow independent feature development
- Suitable for both solo developers and large teams

### Consequences

- The project structure remains predictable.
- Files are easier to locate.
- New features can be developed without introducing architectural clutter.
- Shared code is centralized in packages, eliminating duplication.