# 14 — Testing Strategy
> Version: 2.0
> **Quality is Designed, Not Tested Later**
---

# Overview

Testing is not a secondary activity in Dadline.

It is an integral part of the development process.

No critical feature is deployed to production without automated tests.

---

# Testing Goals

- Prevent Regression
- Fast Feedback
- Reliable Releases
- Refactoring Confidence
- High Code Quality
- Architecture Validation

---

# Testing Pyramid

```text
                E2E
              ▲▲▲▲▲
           Integration
        ▲▲▲▲▲▲▲▲▲▲▲▲
             Feature
     ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
              Unit
▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
```

---

# Testing Stack

## Backend

- Pest
- PHPUnit
- Laravel Test Utilities

## Frontend

- Vitest
- React Testing Library

## End-to-End

- Playwright

## Architecture

- Pest Architecture Tests

## Static Analysis

- PHPStan
- TypeScript
- ESLint

---

# Test Types

## Unit Test

Tests the smallest unit of the system.

Examples:

```text
CaseStatus Enum

Price Calculator

Date Formatter

Validator

Policy Logic
```

---

## Feature Test

Tests a complete application feature.

Examples:

```text
Create Case

Upload Document

Login

Payment

Search Lawyer
```

---

## Integration Test

Tests the interaction between multiple components.

Examples:

```text
Laravel

↓

PostgreSQL

↓

Redis

↓

S3 Compatible Storage
```

---

## End-to-End Test

Simulates real user behavior.

Example:

```text
Login

↓

Dashboard

↓

Create Case

↓

Upload File

↓

Payment
```

---

## Architecture Test

Validates architectural rules.

Example:

```text
A Feature

must not

import another Feature.
```

---

# Folder Structure

## Backend

```text
tests/

Unit/

Feature/

Integration/

Architecture/

Performance/
```

## Frontend

```text
src/

__tests__/

components/

features/

hooks/

utils/
```

## Playwright

```text
e2e/

fixtures/

pages/

helpers/
```

---

# Unit Testing Rules

Each Unit Test should verify only one behavior.

Avoid:

```text
Login

+

Register

+

Reset Password
```

in a single test.

Prefer:

```text
Login Success

Login Failure

Login Locked
```

---

# Naming Convention

## Backend

```php
it('creates a case successfully');
```

## Frontend

```ts
it('renders dashboard');
```

---

# Arrange – Act – Assert

Always follow:

```text
Arrange

↓

Act

↓

Assert
```

---

# Test Database

Use a dedicated testing database.

```text
dadline_test
```

---

# Refresh Database

Every Feature Test resets the database before execution.

---

# Fake Services

Use fake implementations for external services.

Examples:

```text
SMS

Email

Payment

Storage

Notification
```

Never interact with real external services during tests.

---

# Storage Testing

```php
Storage::fake();
```

---

# Queue Testing

```php
Queue::fake();
```

---

# Event Testing

```php
Event::fake();
```

---

# Mail Testing

```php
Mail::fake();
```

---

# Notification Testing

```php
Notification::fake();
```

---

# HTTP Testing

Laravel HTTP Test helpers:

```php
get()

post()

patch()

delete()
```

---

# API Testing

Every API endpoint must have at least one Feature Test.

---

# Validation Testing

Every request should be tested for:

```text
Required

Invalid

Unauthorized

Success
```

---

# Authorization Testing

Every Policy must have dedicated tests.

Examples:

```text
Admin

Lawyer

Customer
```

---

# Exception Testing

Example:

```text
Case Closed

↓

Throws Exception
```

---

# Performance Testing

Critical operations should be performance tested.

Examples:

```text
Search

Dashboard

Reports
```

---

# Frontend Testing

All reusable components should have tests.

Examples:

```text
Button

Modal

Pagination

Table

Form
```

---

# Hook Testing

Examples:

```text
useAuth()

usePagination()

useSearch()
```

---

# Playwright

Core user scenarios:

```text
Register

Login

Create Case

Upload Document

Logout
```

---

# Browser Support

Playwright runs on:

```text
Chrome

Firefox

WebKit
```

---

# Snapshot Testing

Use snapshot tests only for stable UI components.

---

# Coverage Targets

## Backend

```text
90%
```

## Frontend

```text
80%
```

## Architecture

```text
100%
```

---

# CI Rules

Every Pull Request must pass all automated tests.

---

# Parallel Testing

Laravel:

```bash
php artisan test --parallel
```

Vitest:

```text
Parallel
```

Playwright:

```text
Parallel
```

---

# Mutation Testing

Planned for future releases:

```text
Infection PHP
```

---

# Test Data

Use factories.

Avoid:

```php
new User(...)
```

Prefer:

```php
User::factory()
```

---

# Seeders

Tests must not depend on seeders.

---

# Golden Rules

- Test First Mindset
- Small Tests
- Fast Tests
- Independent Tests
- Deterministic Tests
- Fake External Services
- No Shared State
- Architecture Tests Required

---

# Test Flow

```text
Developer

↓

Write Code

↓

Write Tests

↓

Run Tests

↓

Commit

↓

CI

↓

Deploy
```

---

# Testing Matrix

| Layer | Tool |
|--------|------|
| Unit | Pest |
| Feature | Pest |
| Integration | Pest |
| Architecture | Pest |
| Frontend | Vitest |
| Components | React Testing Library |
| E2E | Playwright |
| Static Analysis | PHPStan / ESLint |

---

# Checklist

- [x] Unit Tests
- [x] Feature Tests
- [x] Integration Tests
- [x] Architecture Tests
- [x] E2E Tests
- [x] Parallel Testing
- [x] Fake Services
- [x] Test Database
- [x] Coverage Targets
- [x] CI Integration

---

# Architecture Decision Record

## ADR-014

### Decision

Adopt a multi-layer testing strategy consisting of **Unit, Feature, Integration, Architecture, and End-to-End Testing**.

### Rationale

- Prevent regressions
- Increase confidence during refactoring
- Ensure release quality
- Preserve the project's architecture over time

### Consequences

- Every feature is validated before release.
- Architectural rules are automatically enforced in CI.
- Production defects are minimized.
- Development becomes faster and more reliable.