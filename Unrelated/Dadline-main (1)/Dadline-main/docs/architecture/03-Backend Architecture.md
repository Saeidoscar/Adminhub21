# 03 — Backend Architecture
> Version: 2.0
---

# Overview

The Dadline backend is built with **Laravel 13**.

The backend architecture is designed to provide:

- Rapid development
- Scalability
- High readability
- Testability
- Modularity
- Minimal complexity
- Long-term maintainability

Dadline follows a **Modular Monolith** architecture.

---

# Why Modular Monolith?

For the MVP phase, adopting a microservices architecture would introduce unnecessary complexity and operational overhead.

Common challenges include:

- Multiple repositories
- Multiple CI/CD pipelines
- Multiple deployments
- Multiple databases
- Service discovery
- Distributed transactions
- Message brokers
- Complex monitoring

A Modular Monolith offers:

- Faster development
- Easier debugging
- Simple transactions
- Single deployment
- Easier maintenance

When necessary, each module can later be extracted into an independent microservice.

---

# Architectural Principles

The backend is designed around the following principles:

- Domain First
- API First
- Feature First
- Event Driven
- Queue First
- Stateless Services
- Dependency Inversion
- Single Responsibility Principle

---

# Backend Directory Structure

```text
apps/api/

app/
├── Domain/
├── Application/
├── Infrastructure/
├── Shared/
└── Support/

bootstrap/
config/
database/
routes/
storage/
tests/
```

---

# Layer Responsibilities

```text
HTTP
   │
   ▼
Application
   │
   ▼
Domain
   │
   ▼
Infrastructure
```

Each layer is responsible only for its own concerns.

---

# Domain Layer

All business rules belong to the Domain layer.

```text
Domain/

Auth/

Users/

Cases/

Lawyers/

Documents/

Billing/

Notifications/
```

Each domain remains independent of the framework.

---

# Application Layer

The Application layer orchestrates use cases.

```text
Application/

Actions/

Commands/

Queries/

DTOs/

Services/
```

Business rules must never be implemented in controllers.

---

# Infrastructure Layer

Responsible for communication with external systems.

```text
Infrastructure/

Persistence/

Storage/

Mail/

SMS/

Search/

Queue/

Logging/
```

Examples:

- PostgreSQL
- Redis
- S3 Compatible Storage
- Email Provider
- SMS Provider

---

# Shared Layer

Shared project components.

```text
Shared/

Enums/

Exceptions/

Traits/

Contracts/

Helpers/

Support/
```

---

# Feature Structure

Example feature structure:

```text
Domain/

Cases/

Application/

Actions/
DTOs/
Queries/

Infrastructure/

Repositories/
Policies/

Presentation/

Controllers/
Requests/
Resources/

Tests/
```

All files related to a feature remain inside that feature.

---

# Controller Rules

Controllers are responsible only for HTTP handling.

Allowed:

- Receiving requests
- Invoking actions
- Returning API resources

Not allowed:

- Database queries
- Business logic
- File storage
- SMS
- Email
- Notifications

---

# Action Pattern

Each use case is implemented as a single Action.

Examples:

```text
CreateCaseAction

AssignLawyerAction

UploadDocumentAction

VerifyOtpAction

RegisterUserAction
```

Actions serve as the entry point for business logic.

---

# DTO

Raw arrays must never be passed between layers.

Examples:

```text
CreateCaseData

RegisterUserData

UploadDocumentData
```

DTOs provide type safety and improve maintainability.

---

# Query Objects

Complex read operations should use Query Objects.

Examples:

```text
FindActiveCasesQuery

LawyerDashboardQuery

CaseStatisticsQuery
```

Query Objects are responsible only for reading data.

---

# Repository

Repositories should be introduced only when:

- Multiple data sources are involved
- Queries become complex
- Mocking is required during testing

Otherwise, Eloquent may be used directly inside Actions.

**The Repository Pattern is optional.**

---

# Eloquent Models

Models represent data only.

Models must not:

- Send emails
- Store files
- Contain business logic
- Send notifications

---

# Events

Every important business event should emit an Event.

Examples:

```text
UserRegistered

CaseCreated

DocumentUploaded

InvoicePaid
```

---

# Listeners

Examples:

```text
SendWelcomeEmail

SendSmsNotification

GenerateTimeline

UpdateAnalytics
```

Listeners must remain independent of one another.

---

# Queue First

All resource-intensive operations should be queued.

Examples:

- Sending emails
- Sending SMS
- PDF generation
- AI processing
- File uploads
- Thumbnail generation

---

# Notifications

Notifications are managed through a centralized service.

```text
NotificationService

├── SMS
├── Email
├── Push
└── Webhook
```

No module should communicate directly with notification providers.

---

# Storage

All files are managed through Laravel Filesystem.

```php
Storage::disk('s3')
```

Storage providers are interchangeable.

Examples:

- AWS S3
- ArvanCloud R2
- Arvan Object Storage
- Liara Object Storage
- DigitalOcean Spaces

---

# Authentication

- Auth.js v5
- Laravel Sanctum
- HttpOnly Cookies
- CSRF Protection

Access tokens must never be stored in LocalStorage.

---

# Authorization

Roles are used only for user categorization.

Permissions determine access control.

Examples:

```text
case.view

case.create

case.update

invoice.pay

user.delete
```

---

# API Design

All APIs must be versioned.

```text
/api/v1/*
```

---

# UUID

All primary keys use UUID v7.

Auto-increment IDs are prohibited.

---

# Logging

All exceptions must be logged.

Empty `catch` blocks are not allowed.

---

# Testing

Backend testing is performed with Pest.

```text
tests/

Feature/

Unit/

Architecture/
```

---

# Golden Rules

- Business logic belongs only in Actions.
- Controllers remain thin.
- Events are used for decoupling.
- Heavy operations are processed through queues.
- Repositories are created only when necessary.
- All files are stored in S3-compatible storage.
- All identifiers use UUID v7.
- Each feature is developed independently.

---

# Backend Flow

```text
HTTP Request
      │
      ▼
Controller
      │
      ▼
Form Request
      │
      ▼
Action
      │
      ├───────────────┐
      ▼               ▼
Eloquent         Query Object
      │               │
      └──────┬────────┘
             ▼
        PostgreSQL
             │
             ▼
      API Resource
             │
             ▼
      HTTP Response
```