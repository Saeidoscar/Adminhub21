# 05 — Database Architecture
> Version: 2.0
---

# Overview

The database is the core of the Dadline platform.

All users, cases, documents, payments, notifications, and system logs are stored in PostgreSQL.

Dadline uses a single database engine:

```text
PostgreSQL 17
```

Additional database engines should not be introduced unless there is a clear technical requirement.

---

# Design Goals

The database architecture is designed to provide:

- High Performance
- ACID Compliance
- Data Integrity
- Scalability
- Easy Maintenance
- Easy Backup
- Auditability
- Future Proof

---

# Why PostgreSQL?

PostgreSQL was selected because it provides:

- Full ACID compliance
- JSONB
- Full-Text Search
- Materialized Views
- Generated Columns
- Window Functions
- Partial Indexes
- Expression Indexes
- Native UUID support
- Row-Level Locking
- Partitioning
- Logical Replication

PostgreSQL is the only database used in the project.

---

# One Database Policy

Supported:

```text
✔ PostgreSQL
```

Not supported:

```text
✖ PostgreSQL + MySQL
```

```text
✖ PostgreSQL + MongoDB
```

Multiple database engines should only be introduced when technically justified.

---

# Database Structure

```text
dadline

├── users
├── lawyers
├── cases
├── case_messages
├── case_events
├── documents
├── invoices
├── payments
├── notifications
├── roles
├── permissions
├── audit_logs
└── jobs
```

---

# Naming Convention

Table names must be:

- lowercase
- plural
- snake_case

Correct:

```text
users

case_messages

audit_logs

payment_transactions
```

Incorrect:

```text
User

CaseMessage

tbl_users

USERS
```

---

# Primary Key Strategy

important table uses UUID v7 as its primary key.

Example:

```sql
id UUID PRIMARY KEY
```

Auto-increment IDs are prohibited.

---

# Timestamp Rules

Every table includes:

```sql
created_at

updated_at
```

When required:

```sql
deleted_at
```

---

# Soft Delete Policy

Soft deletes are used only for business data.

Examples:

```text
users

cases

documents

lawyers
```

They should not be used for log tables.

---

# Foreign Keys

All relationships must be enforced with foreign keys.

Example:

```text
cases.user_id

↓

users.id
```

Foreign keys should not be removed without documented justification.

---

# Cascade Rules

Default behavior:

```text
RESTRICT
```

Not:

```text
CASCADE
```

Cascade deletes should be used only when explicitly required.

---

# Index Strategy

Every index must have a clear purpose.

Examples:

```text
users.email

users.mobile

cases.status

documents.case_id

payments.invoice_id
```

---

# Composite Indexes

Example:

```sql
(status, created_at)
```

Useful for dashboard queries.

---

# Partial Indexes

Example:

```sql
WHERE deleted_at IS NULL
```

Used to improve query performance.

---

# JSON Usage

Use JSONB only for dynamic data.

Appropriate examples:

```text
settings

preferences

metadata
```

Avoid storing core business data in JSON.

Examples:

```text
first_name

last_name

mobile
```

Core data should always have dedicated columns.

---

# Audit Log

All significant operations should be recorded.

Examples:

```text
User Login

Case Created

Invoice Paid

Document Deleted

Permission Changed
```

---

# Audit Structure

```text
audit_logs

id

user_id

action

entity

entity_id

ip

user_agent

payload

created_at
```

---

# Transactions

Multi-step operations must always execute inside a database transaction.

Example:

```text
Create Invoice

↓

Create Payment

↓

Create Timeline

↓

Commit
```

On failure:

```text
Rollback
```

---

# Migration Rules

Each migration should perform only one schema change.

Correct:

```text
create_users_table
```

Incorrect:

```text
update_everything_table
```

---

# Seeder Strategy

Three types of seeders are used.

```text
CoreSeeder

DevelopmentSeeder

DemoSeeder
```

Production environments execute only `CoreSeeder`.

---

# Enum Strategy

Fixed values should be represented using Enums.

Examples:

```text
CaseStatus

InvoiceStatus

PaymentStatus
```

Avoid hard-coded string values.

---

# Search Strategy

The initial implementation uses:

```text
PostgreSQL Full-Text Search
```

Future versions may introduce:

```text
Typesense
```

without changing the business logic.

---

# File Storage

The database stores only file metadata.

```text
documents

id

case_id

disk

bucket

path

mime_type

size

checksum
```

Actual file content is never stored in the database.

---

# Large File Rule

Do not use:

```text
BYTEA
```

for large files.

Always use:

```text
S3 Compatible Storage
```

---

# UUID Relations

All important relationships use UUIDs.

Examples:

```text
case_id

user_id

invoice_id
```

---

# Performance Rules

Avoid N+1 queries.

Incorrect:

```php
foreach (...)

↓

query
```

Always use eager loading.

```php
with()

load()

loadMissing()
```

---

# Query Rules

Avoid:

```sql
SELECT *
```

Always select only the required columns.

---

# Pagination

Every list endpoint must support pagination.

Default page size:

```text
20
```

Maximum page size:

```text
100
```

---

# Backup Strategy

Daily:

```text
pg_dump
```

Weekly:

```text
Snapshot
```

Monthly:

```text
Archive
```

All backups are stored in S3-compatible storage.

---

# Restore Testing

Backup restoration should be tested at least once per month.

A backup that has never been restored cannot be considered reliable.

---

# Database Diagram

```text
Users
 │
 ├────────────┐
 │            │
 ▼            ▼
Cases     Documents
 │            │
 │            ▼
 │       File Metadata
 │
 ▼
Invoices
 │
 ▼
Payments

Users
 │
 ▼
Notifications

Users
 │
 ▼
Audit Logs
```

---

# Golden Rules

- PostgreSQL only
- UUID v7 for important primary keys
- Foreign keys are mandatory
- Soft deletes only when necessary
- JSONB only for dynamic data
- Files are never stored in the database
- Always use transactions
- Always paginate list endpoints
- Create indexes with a clear purpose
- Maintain regular backups

---

# Checklist

- [x] PostgreSQL 17
- [x] UUID v7
- [x] Foreign Keys
- [x] Transactions
- [x] Full-Text Search
- [x] JSONB
- [x] Audit Log
- [x] Backup Strategy
- [x] S3 Compatible Storage
- [x] Performance Rules

---

# Architecture Decision Record

## ADR-005

### Decision

Use PostgreSQL as the project's only database.

### Rationale

A single database engine reduces operational complexity, preserves data integrity, leverages PostgreSQL's advanced capabilities, and eliminates the overhead of maintaining multiple databases.

### Consequences

- Simpler operations
- Easier maintenance
- Excellent performance for current and future requirements
- Scalable architecture without database changes