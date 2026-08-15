# 07 — Frontend Architecture
> Version: 2.0
---

# Overview

The Dadline frontend is built with **Next.js 16 (App Router)**.

The architecture is designed to provide:

- High performance
- SEO optimization
- Scalability
- Maintainability
- Testability
- React Server Components compatibility
- Minimal client-side JavaScript

Dadline is **not** a traditional SPA.

It is a **Hybrid Web Application** that combines SSR, React Server Components, Streaming, and Client Components where appropriate.

---

# Design Goals

- Server First
- API First
- SEO First
- Performance First
- Accessibility First
- Feature-Based Architecture
- Type Safe
- Reusable UI
- Low Bundle Size

---

# Technology Stack

## Core

- Next.js 16
- React 19
- TypeScript 5

## UI

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide Icons

## Forms

- React Hook Form
- Zod

## Data Fetching

- TanStack Query
- React Server Components
- Server Actions (when appropriate)

## Validation

- Zod

## Testing

- Vitest
- Playwright

---

# Rendering Strategy

Each page should explicitly define its rendering strategy.

## Static Rendering

Suitable for mostly static pages.

Examples:

```text
Home

About

Pricing

FAQ
```

---

## Dynamic Rendering

Suitable for user-specific pages.

Examples:

```text
Dashboard

Notifications

Profile

Cases
```

---

## Streaming

Suitable for data-intensive pages.

Examples:

```text
Lawyer Search

Search Results

Reports
```

---

## Client Rendering

Reserved for interactive UI.

Examples:

```text
Rich Text Editor

Charts

Maps

Drag & Drop
```

---

# Golden Rule

Server Components are the default.

Use:

```tsx
"use client"
```

only when client-side interactivity is required.

---

# Directory Structure

```text
apps/web/

src/

app/

features/

entities/

shared/

widgets/

processes/

styles/

lib/

hooks/

providers/

middleware.ts
```

---

# Why Feature-Based Architecture?

Traditional structures such as:

```text
components/

pages/

hooks/

utils/
```

tend to become difficult to maintain as projects grow.

Dadline organizes frontend code around independent features.

---

# Layer Structure

```text
app/

↓

widgets/

↓

features/

↓

entities/

↓

shared/
```

---

# app/

Responsible only for routing.

```text
app/

(page)

(layout)

(error)

(loading)

(not-found)

(route)

(metadata)
```

Business logic must never be implemented here.

---

# features/

Each feature is self-contained.

Examples:

```text
login

register

search-lawyer

create-case

upload-document

payment

notifications
```

Each feature contains:

```text
ui/

api/

hooks/

schemas/

types/

actions/
```

---

# entities/

Represents the core business entities.

```text
user

lawyer

case

invoice

document

notification
```

Each entity may include:

```text
components/

types/

utils/
```

---

# widgets/

Widgets compose multiple features into reusable UI sections.

Examples:

```text
Header

Sidebar

Footer

Dashboard

Hero

SearchPanel
```

---

# shared/

Contains shared application code.

```text
shared/

ui/

lib/

hooks/

config/

constants/

utils/

types/
```

---

# UI Components

Reusable UI components belong exclusively in:

```text
packages/ui
```

Examples:

```text
Button

Input

Modal

Badge

Avatar

Table

Tabs

Pagination
```

---

# Feature Communication

Features must remain independent.

Avoid:

```text
Login Feature

↓

Search Feature
```

Use:

```text
Shared Layer
```

or

```text
API
```

---

# Data Fetching Strategy

Prefer:

```text
React Server Components
```

For client-side state and interactions, use:

```text
TanStack Query
```

---

# API Client

Components must never call:

```ts
fetch()

axios()
```

directly.

Always use:

```text
@dadline/api-client
```

---

# Form Strategy

All forms use:

```text
React Hook Form
```

Validation is handled with:

```text
Zod
```

---

# Validation Flow

```text
Form

↓

React Hook Form

↓

Zod

↓

API

↓

Laravel Validation
```

Validation is performed on both the frontend and backend.

---

# Error Handling

Errors follow a consistent flow.

```text
API Error

↓

Toast

↓

Form Error

↓

Global Error Boundary
```

---

# State Management

Default state management:

```text
React State
```

When shared state is required:

```text
React Context
```

Global state libraries such as Redux or Zustand should only be introduced when justified by an ADR.

---

# Caching

Caching is managed by:

```text
TanStack Query
```

Each query should define an appropriate caching strategy.

---

# Authentication

Users never have direct access to authentication tokens.

Sessions are stored in:

```text
HttpOnly Cookies
```

The frontend only receives the authentication state.

---

# Route Groups

```text
app/

(public)

(auth)

(dashboard)

(admin)

(office)
```

Each route group has its own layout.

---

# Loading UI

Every route should provide:

```text
loading.tsx
```

Skeleton loaders are preferred.

Spinners should only be used for short operations.

---

# Error UI

Every route should provide:

```text
error.tsx
```

Raw application errors must never be exposed to users.

---

# Metadata

Every page should implement:

```ts
generateMetadata()
```

Including:

- Title
- Description
- Canonical URL
- Open Graph
- Twitter Card
- Robots

---

# SEO Rules

All public pages should include:

- Metadata
- JSON-LD
- Canonical URLs
- Sitemap
- Robots directives

---

# Image Strategy

All images should use:

```text
next/image
```

Image optimization is mandatory.

---

# Font Strategy

Fonts should be loaded with:

```text
next/font
```

External font loading is not allowed.

---

# Styling Rules

Use only:

```text
Tailwind CSS v4
```

Custom CSS should be introduced only when necessary.

---

# Accessibility

Every page should be:

- Keyboard Accessible
- Screen Reader Friendly
- WCAG Compliant

---

# Performance Goals

Target Lighthouse scores:

```text
Performance ≥ 95

Accessibility ≥ 95

SEO ≥ 100

Best Practices ≥ 95
```

---

# Import Rules

Allowed:

```text
features

↓

entities

↓

shared
```

Not allowed:

```text
shared

↓

features
```

---

# Testing

Critical features should include:

- Unit tests with Vitest
- End-to-end tests with Playwright

---

# Feature Example

```text
features/

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

# Frontend Flow

```text
Browser

↓

Next.js

↓

Server Component

↓

API Client

↓

Laravel API

↓

JSON

↓

UI
```

---

# Golden Rules

- Server Components by default
- Client Components only when required
- Feature-Based Architecture
- API First
- React Hook Form + Zod
- TanStack Query for client-side data
- Shared UI belongs in `packages/ui`
- No Redux without an ADR
- No direct Axios or Fetch calls
- No business logic inside components

---

# Checklist

- [x] Next.js 16
- [x] React 19
- [x] App Router
- [x] React Server Components
- [x] Feature-Based Architecture
- [x] Tailwind CSS v4
- [x] shadcn/ui
- [x] TanStack Query
- [x] React Hook Form
- [x] Zod
- [x] Metadata API
- [x] SEO First
- [x] Accessibility

---

# Architecture Decision Record

## ADR-007

### Decision

Adopt a **Feature-Based Architecture** built around **React Server Components**.

### Rationale

- Reduced coupling between features
- Better utilization of Next.js capabilities
- Smaller client-side JavaScript bundles
- Improved maintainability
- Scalable architecture for future growth

### Consequences

- Smaller bundle size
- Better SEO
- Improved performance
- Consistent architecture across all frontend applications