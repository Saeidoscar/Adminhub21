# 04 — Domain-Driven Design (Pragmatic DDD)
> Version: 2.0
---

# Overview

Dadline follows a **Pragmatic Domain-Driven Design (DDD)** approach rather than implementing the full DDD methodology.

The goal is to build a maintainable production system while avoiding unnecessary architectural complexity.

---

# Why Pragmatic DDD?

A full DDD implementation typically includes concepts such as:

- Aggregate
- Aggregate Root
- Value Object
- Repository Interface
- Domain Service
- Application Service
- Factory
- Specification
- Domain Event
- CQRS
- Event Sourcing

While these patterns are valuable for large and complex systems, they introduce additional complexity that is not justified for this project.

Our approach is to adopt only the patterns that provide clear practical value.

---

# Design Philosophy

> **Every pattern must solve a real problem.**

Patterns that only increase boilerplate or the number of files should not be introduced.

---

# Bounded Contexts

Each major business area is implemented as an independent domain.

```text
Auth

Users

Lawyers

Cases

Documents

Billing

Notifications

Search

AI

Settings

Reports
```

Each domain owns its own business rules.

---

# Communication Between Domains

Domains should never communicate directly through internal models.

Incorrect:

```text
CaseController

↓

UserModel

↓

InvoiceModel

↓

DocumentModel
```

Correct:

```text
Case Domain

↓

Application Layer

↓

Billing Domain
```

Domains interact only through public Actions or internal APIs.

---

# Domain Structure

Each domain follows a consistent structure.

```text
Domain/

Cases/

Application/

Actions/

DTOs/

Queries/

Domain/

Models/

Enums/

Policies/

Presentation/

Controllers/

Requests/

Resources/

Tests/
```

---

# Entities

Entities represent the core business objects.

Examples:

```text
User

Lawyer

Case

Invoice

Document
```

Entities are implemented using Eloquent models.

---

# Value Objects

Value Objects should be introduced only when they represent meaningful business concepts.

Good examples:

```text
Money

NationalCode

PhoneNumber

EmailAddress
```

Avoid creating Value Objects for simple primitive values.

---

# Enums

All constant values should be represented as Enums.

Example:

```php
CaseStatus

Draft

Open

Pending

Closed

Archived
```

Or:

```php
PaymentStatus

Pending

Paid

Failed

Refunded
```

Avoid hard-coded string literals throughout the codebase.

---

# Actions

Each business operation is implemented as a dedicated Action.

Examples:

```text
CreateCaseAction

AssignLawyerAction

CloseCaseAction

GenerateInvoiceAction

UploadDocumentAction
```

Actions are independent, reusable, and testable.

---

# Queries

Complex read operations should be implemented as Query Objects.

Examples:

```text
ActiveCasesQuery

LawyerDashboardQuery

UserStatisticsQuery

InvoiceSummaryQuery
```

Query Objects are responsible only for reading data.

---

# Commands

Dadline does not implement full CQRS.

Actions act as commands.

A dedicated `Commands` directory should be introduced only when necessary.

---

# Services

Services should be created only when logic is shared across multiple Actions.

Examples:

```text
OtpService

PdfService

StorageService

SearchService

SmsService
```

Avoid creating service classes for simple operations.

---

# Repositories

Repositories are optional.

Introduce a Repository only when:

- Multiple data sources are involved
- Queries become complex
- Internal caching is required
- Mocking is needed during testing

Otherwise, Actions may use Eloquent directly.

---

# Domain Events

Significant business events should emit Domain Events.

Examples:

```text
CaseCreated

CaseAssigned

InvoicePaid

DocumentUploaded

UserRegistered
```

Events reduce coupling between domains.

---

# Event Flow

```text
CaseCreated

↓

GenerateTimeline

↓

NotifyLawyer

↓

UpdateStatistics

↓

SendWebhook
```

The Action remains unaware of downstream processing.

---

# Policies

Each domain defines its own authorization policies.

Examples:

```text
CasePolicy

DocumentPolicy

InvoicePolicy
```

Authorization checks must be handled exclusively through Policies.

---

# Requests

Validation belongs in Form Request classes.

Examples:

```text
CreateCaseRequest

UpdateProfileRequest

UploadDocumentRequest
```

Actions always receive validated data.

---

# Resources

All API responses should use API Resources.

Examples:

```text
CaseResource

UserResource

DocumentResource
```

Models should never be returned directly to clients.

---

# Cross-Domain Rules

A domain must never:

- Modify another domain's models
- Execute another domain's queries
- Access another domain's database tables directly

Communication must occur through Actions or Events.

---

# Dependency Direction

```text
Presentation

↓

Application

↓

Domain

↓

Infrastructure
```

Reverse dependencies are not allowed.

---

# Pragmatic Rules

Avoid introducing the following patterns unless they solve a real problem:

- Factory
- Specification
- Aggregate
- Aggregate Root
- Repository Interface
- Command Bus
- Query Bus
- Mediator

Simplicity always takes priority.

---

# Anti-Pattern

Avoid:

```php
Case::create(...);

Mail::to(...);

Storage::put(...);

Notification::send(...);
```

All inside a single controller.

Preferred:

```text
Controller

↓

Action

↓

Event

↓

Listener

↓

Queue
```

---

# Golden Rules

- Each domain is independent.
- Every Action has a single responsibility.
- Repositories are optional.
- Services are used only for shared logic.
- Events are used for decoupling.
- Value Objects are introduced only when they represent real business concepts.
- Simplicity is more important than architectural patterns.

---

# Domain Map

```text
                    Dadline

                       │

      ┌────────────────────────────────────┐

      │

   Auth

   Users

   Lawyers

   Cases

   Documents

   Billing

   Notifications

   Search

   AI

   Reports

      │

      └────────────────────────────────────┘

              Shared Infrastructure
```

---

# Checklist

- [x] Pragmatic DDD
- [x] Modular Monolith
- [x] Vertical Slice
- [x] Thin Controllers
- [x] Action Pattern
- [x] Optional Repository
- [x] Event Driven
- [x] Queue First
- [x] Policy-Based Authorization
- [x] Resource-Based API

---

# Architecture Decision Record

## ADR-004

### Decision

Dadline adopts **Pragmatic Domain-Driven Design (DDD)**.

### Rationale

A full DDD implementation introduces unnecessary complexity for a small development team without providing proportional value.

### Consequences

- Faster development
- Clearer architecture
- Easier maintenance
- Gradual migration to full DDD if future requirements justify it