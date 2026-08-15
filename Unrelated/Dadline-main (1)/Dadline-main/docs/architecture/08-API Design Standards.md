# 08 — API Design Standards
> Version: 2.0
> **API First Architecture**
---

# Overview

The API is the primary contract between all Dadline services.

All clients communicate with the backend exclusively through the API.

```text
Web

↓

API

↓

Laravel

↓

PostgreSQL
```

Future clients will also consume the same API:

- Mobile
- Desktop
- AI Agents
- Third-Party Integrations
- Public API

The API must therefore be designed with long-term consistency and stability.

---

# API Principles

Dadline APIs follow these principles:

- API First
- RESTful
- Predictable
- Versioned
- Stateless
- Secure
- Cache Friendly
- Idempotent
- Consistent

---

# Base URL

## Production

```text
https://api.dadline.net/api/v1
```

## Development

```text
http://localhost:8000/api/v1
```

Every endpoint must be versioned.

---

# Versioning Strategy

API versions are included in the URL.

Correct:

```text
/api/v1
```

Future versions:

```text
/api/v2
```

Avoid:

```text
/api/users

/api/latest

/api/current
```

---

# Resource Naming

Always use plural resource names.

Correct:

```text
users

cases

documents

notifications

payments
```

Incorrect:

```text
user

getUsers

caseList

createCase
```

---

# HTTP Methods

| Method | Purpose |
|----------|---------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace resources |
| PATCH | Partially update resources |
| DELETE | Delete resources |

---

# Standard Routes

List resources:

```text
GET /users
```

Retrieve a single resource:

```text
GET /users/{id}
```

Create a resource:

```text
POST /users
```

Update a resource:

```text
PATCH /users/{id}
```

Delete a resource:

```text
DELETE /users/{id}
```

---

# Nested Resources

Use nested routes when appropriate.

Examples:

```text
/cases/{case}/documents

/users/{user}/notifications
```

---

# Avoid

Never use action-based endpoints such as:

```text
/getUsers

/deleteUser

/updateCase

/saveDocument
```

---

# JSON Responses

All APIs return:

```text
application/json
```

---

# Success Response

```json
{
  "data": {
    "id": "0199...",
    "name": "Ali"
  }
}
```

---

# Collection Response

```json
{
  "data": [],
  "meta": {},
  "links": {}
}
```

---

# Error Response

```json
{
  "message": "Validation failed.",
  "errors": {
    "mobile": [
      "The mobile field is required."
    ]
  }
}
```

---

# Response Format

Avoid adding unnecessary wrapper fields such as:

```text
status

success

result

code
```

Use Laravel API Resources as the default response format.

---

# HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# Pagination

All collection endpoints must support pagination.

```text
?page=1

&per_page=20
```

Maximum page size:

```text
100
```

---

# Cursor Pagination

Use cursor pagination for large datasets.

```text
?cursor=xxxx
```

Examples:

- Notifications
- Logs
- Timeline

---

# Sorting

Ascending:

```text
?sort=name
```

Descending:

```text
?sort=-created_at
```

Multiple fields:

```text
?sort=name,-created_at
```

---

# Filtering

Example:

```text
?status=open
```

Multiple filters:

```text
?status=open

&type=family
```

---

# Search

```text
?q=divorce
```

---

# Include Relationships

Prevent N+1 queries with:

```text
?include=user
```

or

```text
?include=user,lawyer
```

---

# Sparse Fieldsets

```text
?fields=id,name
```

---

# Date Filtering

```text
?from=2026-01-01

&to=2026-01-31
```

---

# UUID

All resource identifiers use UUID v7.

---

# Validation

The backend is the source of truth for validation.

Frontend validation exists only to improve user experience.

---

# File Upload

Use:

```text
multipart/form-data
```

Example response:

```json
{
  "data": {
    "id": "...",
    "url": "...",
    "size": 102400
  }
}
```

---

# File Download

```text
GET /documents/{id}/download
```

---

# Authentication

All protected endpoints use:

```text
auth:sanctum
```

---

# Authorization

Every protected operation must be enforced through Policies.

---

# Idempotency

Critical POST operations must support:

```text
Idempotency-Key
```

Examples:

- Payments
- Invoices
- Subscriptions

---

# Request ID

Every request should include:

```text
X-Request-ID
```

for request tracing and debugging.

---

# Correlation ID

Future distributed services may use:

```text
X-Correlation-ID
```

---

# Rate Limiting

| Endpoint | Limit |
|-----------|-------|
| Public API | 60/min |
| Login | 5/min |
| OTP | 3/min |
| Upload | 20/min |
| Search | 30/min |

---

# ETag

Enable ETag support for public endpoints.

---

# Cache Control

Public APIs should include:

```text
Cache-Control
```

Private APIs should disable caching.

---

# Localization

Use:

```text
Accept-Language
```

Examples:

```text
fa

en
```

---

# Time Handling

All timestamps are stored in UTC.

APIs return ISO-8601 formatted dates.

Example:

```text
2026-07-21T10:15:22Z
```

---

# API Documentation

All APIs must be documented using:

```text
OpenAPI 3.1
```

Swagger is enabled only in development environments.

---

# Deprecation Policy

A new API version must support the previous version for at least:

```text
6 Months
```

---

# Route Registration

```text
routes/

api.php
```

Each feature registers its own routes.

---

# API Flow

```text
Client

↓

Middleware

↓

Controller

↓

Request

↓

Action

↓

Resource

↓

JSON
```

---

# Golden Rules

- Version every endpoint
- Follow REST principles
- Paginate all collection endpoints
- Authorize every protected operation with Policies
- Return API Resources
- Use UUID v7
- Return ISO-8601 timestamps
- Return JSON only
- Use standard HTTP status codes
- Keep controllers free of business logic

---

# Checklist

- [x] RESTful API
- [x] API Versioning
- [x] UUID v7
- [x] JSON Responses
- [x] Pagination
- [x] Filtering
- [x] Sorting
- [x] Include Relationships
- [x] Sparse Fieldsets
- [x] Idempotency
- [x] OpenAPI 3.1
- [x] Rate Limiting

---

# Architecture Decision Record

## ADR-008

### Decision

Adopt a **RESTful API** based on **API First** principles with **OpenAPI 3.1**.

### Rationale

- Compatible with Web, Mobile, and AI clients
- Self-documenting API contracts
- Independent frontend and backend development
- Reduced coupling between teams
- Supports future public APIs

### Consequences

- Stable client-server contracts
- Faster development
- Improved testability
- Backward-compatible API versioning
