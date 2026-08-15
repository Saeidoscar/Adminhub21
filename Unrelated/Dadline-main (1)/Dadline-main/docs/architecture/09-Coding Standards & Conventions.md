# 09 — Coding Standards & Conventions
> Version: 2.0
---

# Overview

This document defines a unified coding standard for the Dadline project.

In large-scale projects, long-term maintainability depends more on **consistent code** than on sophisticated algorithms.

> **Code is read far more often than it is written.**

---

# General Principles

Code should be:

- Readable
- Testable
- Extensible
- Easy to remove
- Easy to refactor

Code should not be:

- Clever
- Overly complex
- Ambiguous
- Framework-dependent (except in the Infrastructure layer)

---

# Clean Code Rules

Each function should have a single responsibility.

Recommended maximum length:

```text
30 Lines
```

---

Each class should have a single responsibility.

If a class has multiple reasons to change, split it into smaller classes.

---

Prefer descriptive names over comments.

Avoid:

```php
$a

$b

$tmp
```

Prefer:

```php
$user

$invoice

$document
```

---

# File Naming

Use:

```text
PascalCase
```

Examples:

```text
CreateCaseAction.php

CasePolicy.php

UserResource.php

UploadDocumentRequest.php
```

---

# Folder Naming

Use:

```text
PascalCase
```

Examples:

```text
Application

Infrastructure

Presentation

Policies

Requests
```

---

# Database Naming

Tables must use:

```text
snake_case

plural
```

Examples:

```text
case_documents

audit_logs

payment_transactions
```

---

# Column Naming

Use:

```text
snake_case
```

Examples:

```text
created_at

updated_at

deleted_at

user_id
```

---

# Route Naming

Use:

```text
kebab-case
```

Examples:

```text
create-case

user-profile

payment-history
```

---

# URL Rules

Correct:

```text
/cases

/cases/{id}

/user/profile
```

Avoid:

```text
/GetCases

/CreateCase

/update_case
```

---

# Variable Naming

Use descriptive names.

Prefer:

```php
$currentUser

$assignedLawyer

$uploadedDocument
```

Avoid:

```php
$u

$d

$tmp
```

---

# Boolean Naming

Use one of the following prefixes:

```text
is

has

can

should
```

Examples:

```php
$isActive

$hasPermission

$canDelete

$shouldNotify
```

---

# Method Naming

Methods should use verbs.

Examples:

```php
create()

update()

delete()

upload()

assign()

verify()

generate()
```

---

# Event Naming

Use past tense.

Examples:

```text
CaseCreated

InvoicePaid

UserRegistered

OtpVerified
```

---

# Listener Naming

Use verbs.

Examples:

```text
SendInvoiceEmail

GenerateTimeline

NotifyLawyer

UpdateStatistics
```

---

# Action Naming

```text
CreateCaseAction

AssignLawyerAction

VerifyOtpAction

UploadDocumentAction
```

---

# DTO Naming

```text
CreateCaseData

UpdateProfileData

LoginData
```

---

# Query Naming

```text
FindUserQuery

CaseDashboardQuery

ActiveInvoicesQuery
```

---

# Enum Naming

```text
CaseStatus

InvoiceStatus

PaymentStatus
```

---

# Policy Naming

```text
CasePolicy

UserPolicy

DocumentPolicy
```

---

# Resource Naming

```text
UserResource

InvoiceResource

DocumentResource
```

---

# Request Naming

```text
CreateInvoiceRequest

UpdateProfileRequest

LoginRequest
```

---

# Service Naming

Create services only for shared infrastructure or cross-cutting concerns.

Examples:

```text
PdfService

SmsService

StorageService

OtpService
```

---

# Interface Naming

Do not use the `Interface` suffix.

Preferred:

```text
Storage

Notifier

PaymentGateway
```

Avoid:

```text
StorageInterface
```

---

# Constants

Prefer:

```text
Enum

Config

Value Object
```

over constants whenever appropriate.

---

# Magic Numbers

Avoid:

```php
if ($attempt > 5)
```

Prefer:

```php
Otp::MAX_ATTEMPTS
```

or

```php
config('otp.max_attempts')
```

---

# Comments

Comments should explain **why**, not **what**.

Avoid:

```php
// create user

$user = User::create();
```

Prefer:

```php
// Prevent duplicate user creation when the request is retried.
```

---

# TODO Format

```text
TODO(username):

FIXME(username):

HACK(username):
```

---

# PHP Style

- PSR-12 is mandatory.
- Laravel Pint must run before every commit.

---

# Strict Types

Always declare:

```php
declare(strict_types=1);
```

---

# Type Declarations

All methods must define parameter types.

Avoid:

```php
public function store($data)
```

Prefer:

```php
public function store(CreateCaseData $data): Case
```

---

# Return Types

Always specify return types.

Avoid:

```php
public function create()
```

Prefer:

```php
public function create(): User
```

---

# Nullable Types

Prefer:

```php
?User
```

instead of:

```php
User|null
```

---

# Early Return

Prefer early returns.

Avoid:

```php
if (...) {

}
else {

}
```

Prefer:

```php
if (...) {
    return;
}

...
```

---

# Dependency Injection

Always use constructor injection.

Avoid service resolution inside business logic:

```php
app(...)
```

---

# Facades

Facades are allowed only in the Infrastructure layer.

The Application layer should prefer dependency injection.

---

# Configuration

Avoid hard-coded values.

Avoid:

```php
3600
```

Prefer:

```php
config('cache.ttl')
```

---

# Environment Variables

Never call:

```php
env()
```

outside configuration files.

---

# Exceptions

Use meaningful exception names.

Examples:

```text
CaseNotFoundException

OtpExpiredException

PaymentFailedException
```

---

# Logging

Exceptions must never be silently ignored.

Avoid:

```php
catch (Exception $e) {

}
```

---

# Imports

Always import classes.

Avoid:

```php
\App\Models\User
```

Prefer:

```php
use App\Models\User;
```

---

# Frontend Naming

React Components:

```text
PascalCase
```

Hooks:

```text
useSomething
```

Examples:

```text
useAuth

usePagination

useCase
```

---

# CSS Rules

- Use Tailwind CSS by default.
- Use CSS Modules only when justified.
- Avoid inline styles.

---

# React Rules

Components should not contain business logic.

Avoid complex logic inside event handlers.

Move reusable or complex logic to Hooks or Actions.

---

# Git Commit Convention

```text
feat:

fix:

refactor:

docs:

test:

ci:

perf:

build:

style:

chore:
```

Examples:

```text
feat(case): add document upload

fix(auth): resolve OTP expiration

docs(api): update pagination
```

---

# Branch Naming

```text
feature/

bugfix/

hotfix/

release/

refactor/
```

Examples:

```text
feature/document-upload

bugfix/login-timeout

hotfix/payment
```

---

# Pull Request Rules

Every pull request must:

- Pass the build
- Pass linting
- Pass all tests
- Be reviewed before merging

---

# Code Review Checklist

- Readability
- Test coverage
- Security
- Performance
- Naming
- Architecture
- Duplication
- Convention compliance

---

# Avoid

- God Classes
- God Controllers
- Large static helper classes
- Unnecessary repositories
- Unnecessary services
- Business logic inside views
- Database queries inside Blade templates
- Database queries inside React components
- Duplicate code
- Copy-and-paste programming

---

# Golden Rules

- Readability First
- Simplicity First
- Consistency First
- Type Safety
- Feature First
- Convention over Configuration
- Explicit over Implicit
- Refactor Frequently

---

# Checklist

- [x] PSR-12
- [x] Laravel Pint
- [x] Strict Types
- [x] Type Hints
- [x] Return Types
- [x] Constructor Injection
- [x] Enum First
- [x] Feature-Based Naming
- [x] Conventional Commits
- [x] Code Review Standards

---

# Architecture Decision Record

## ADR-009

### Decision

Adopt a unified coding standard for naming, project structure, and code style across the entire project.

### Rationale

- Reduce inconsistencies between developers
- Simplify code reviews
- Improve readability
- Shorten onboarding time
- Enable more effective use of AI-assisted development tools

### Consequences

- Consistent codebase
- Easier maintenance
- Lower-cost refactoring
- Fewer human errors