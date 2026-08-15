# 16 — Performance & Scalability
> Version: 2.0
> **Performance First · Scale Without Rewriting**
---

# Overview

Performance is one of the most critical quality attributes of Dadline.

The architecture is designed to remain scalable as the number of users, cases, and requests grows, without requiring fundamental redesign or rewrites.

This document defines the project's performance, capacity, and scalability standards.

---

# Performance Principles

- Performance by Design
- Measure Everything
- Cache Strategically
- Optimize Before Scaling
- Horizontal Scaling Ready
- Stateless Applications
- Database Efficient
- Async Wherever Possible

---

# Performance Goals (KPI)

| Metric | Target |
|---------|--------|
| API Response (P95) | < 250 ms |
| API Response (P99) | < 500 ms |
| First Contentful Paint | < 1.5 s |
| Largest Contentful Paint | < 2.5 s |
| Time to Interactive | < 3 s |
| Lighthouse Performance | ≥ 95 |
| Error Rate | < 0.1% |
| Availability | 99.9% |

---

# Scalability Strategy

Dadline is designed for **Horizontal Scaling** from day one.

Core principles:

- Stateless Applications
- Shared Storage
- Shared Database
- Shared Cache
- Immutable Containers

---

# Scalability Architecture

```text
                ArvanCloud
                     │
                     ▼
                 Traefik
         ┌───────────┼───────────┐
         ▼           ▼           ▼
      Web #1      Web #2      Web #3
         │           │           │
         └───────────┼───────────┘
                     ▼
                Laravel API
         ┌───────────┼───────────┐
         ▼           ▼           ▼
      API #1      API #2      API #3
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   PostgreSQL      Redis      S3 Compatible
                                 Storage
```

---

# Stateless Applications

No session data is stored inside application containers.

Sessions

```text
Redis
```

Files

```text
S3 Compatible Storage
```

Database

```text
PostgreSQL
```

---

# Frontend Performance

Priority areas:

- Server Components
- Streaming
- Partial Rendering
- Image Optimization
- Font Optimization

---

# JavaScript Budget

Target:

```text
< 200 KB
```

per public page.

---

# Rendering Strategy

| Type | Usage |
|------|-------|
| Static | Landing Pages |
| Dynamic | Dashboard |
| Streaming | Search |
| Client | Interactive UI |

---

# Code Splitting

All features must be loaded lazily.

---

# Dynamic Imports

Heavy components should use:

```tsx
dynamic(...)
```

---

# Image Optimization

All images use:

```text
next/image
```

Preferred formats:

```text
AVIF

WebP
```

---

# Font Optimization

All fonts use:

```text
next/font
```

---

# Bundle Analysis

Before every release:

```text
@next/bundle-analyzer
```

---

# Database Performance

Guidelines:

- Proper Indexes
- Explain Analyze
- No N+1 Queries
- Query Optimization
- Connection Pooling

---

# N+1 Prevention

Always use:

```php
with()

load()

loadMissing()
```

---

# Query Budget

Maximum per request:

```text
20 SQL Queries
```

---

# Slow Query Threshold

```text
100 ms
```

---

# Index Review

Every migration should evaluate:

- Indexes
- Composite Indexes
- Partial Indexes

---

# Pagination

All collections must support pagination.

---

# Cursor Pagination

Use cursor pagination for large datasets such as:

- Notifications
- Audit Logs
- Timeline

---

# Caching Strategy

Three-layer caching architecture:

```text
Browser

↓

ArvanCloud

↓

Application (Redis)
```

---

# Browser Cache

Static assets:

```text
1 Year
```

---

# CDN Cache

Public pages are cached through ArvanCloud.

---

# Application Cache

Redis is used for:

- Settings
- Permissions
- Configuration
- Statistics

---

# Cache Invalidation

Caching follows the:

```text
Cache Aside
```

pattern.

---

# Queue Strategy

Long-running tasks are processed asynchronously.

Examples:

- Email
- SMS
- Notifications
- Thumbnail Generation
- PDF Generation
- AI Processing

---

# Queue Management

Queues are managed using:

```text
Laravel Horizon
```

---

# Worker Scaling

Queue workers scale independently from the API layer.

---

# File Storage

All files are stored outside the application.

```text
S3 Compatible Storage
```

---

# Compression

Production uses:

```text
Brotli

Gzip
```

---

# HTTP/3

Enabled through ArvanCloud.

---

# Keep-Alive

Connection reuse is enabled.

---

# API Optimization

Guidelines:

- Pagination
- Filtering
- Sparse Fields
- Compression
- Caching

---

# Background Processing

The following tasks are asynchronous:

- Email
- SMS
- Report Generation
- AI Analysis
- File Processing

---

# Database Scaling

Initial deployment:

```text
Primary
```

Future architecture:

```text
Primary

↓

Read Replica
```

---

# Redis Scaling

Initial deployment:

```text
Single Node
```

Future architecture:

```text
Cluster
```

---

# Storage Scaling

Storage scalability relies on:

```text
S3 Compatible Storage
```

---

# Monitoring Metrics

Continuously monitored metrics:

- Response Time
- Throughput
- Error Rate
- Queue Size
- Database Connections
- Cache Hit Rate
- CPU Usage
- Memory Usage

---

# Performance Budget

## Backend

P95

```text
250 ms
```

P99

```text
500 ms
```

---

## Frontend

LCP

```text
< 2.5 s
```

CLS

```text
< 0.1
```

INP

```text
< 200 ms
```

---

# Load Testing

Major releases require load testing using:

```text
k6
```

---

# Stress Testing

Long-term target:

```text
10,000 Concurrent Users
```

---

# Capacity Planning

Reviewed quarterly:

- CPU Usage
- Memory Usage
- Storage Growth
- Database Size
- Queue Growth

---

# Performance Checklist

Before every merge:

- No N+1 Queries
- Query Count Review
- Bundle Size Review
- Lighthouse Score
- Automated Tests
- Cache Review

---

# Scalability Checklist

- Stateless Applications
- Redis Sessions
- S3 Storage
- Queue Processing
- Docker
- Traefik
- CDN
- Health Checks

---

# Golden Rules

- Measure Before Optimize
- Avoid Premature Optimization
- Cache Strategically
- Process Heavy Tasks Asynchronously
- Build Stateless Applications
- Optimize the Database First
- Scale Horizontally
- Monitor Continuously

---

# Acceptance Criteria

| Area | Requirement |
|------|-------------|
| API | P95 < 250 ms |
| Frontend | Lighthouse ≥ 95 |
| Database | No N+1 Queries |
| Queue | Wait Time < 5 seconds |
| Cache | Hit Rate > 85% |
| Availability | 99.9% |
| Error Rate | < 0.1% |

---

# Checklist

- [x] Performance Budget
- [x] Scalability Plan
- [x] Redis Cache
- [x] Queue Strategy
- [x] CDN
- [x] Compression
- [x] Load Testing
- [x] Monitoring
- [x] KPI Targets
- [x] Acceptance Criteria

---

## ADR-016

### Decision

Adopt an architecture based on **Stateless Applications** and **Horizontal Scalability**.

### Rationale

- Enable seamless growth without architectural redesign.
- Maximize the benefits of Docker and Traefik.
- Eliminate dependency on a single server.
- Ensure compatibility with cloud infrastructure.

### Consequences

- All services are independently scalable.
- Sessions and files are stored outside application containers.
- New instances can be added without code changes.
- Performance KPIs are continuously monitored and evaluated.

