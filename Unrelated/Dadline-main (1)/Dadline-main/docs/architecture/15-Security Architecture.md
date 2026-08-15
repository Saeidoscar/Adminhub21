# 15 — Security Architecture
> Version: 2.0
> **Security by Design**
---

# Overview

Security in Dadline is not a feature.

It is a core part of the system architecture.

Every feature must be designed with security in mind from the very beginning rather than being secured after implementation.

---

# Security Principles

Dadline's security architecture is based on the following principles:

- Zero Trust
- Least Privilege
- Defense in Depth
- Secure by Default
- Fail Secure
- Privacy by Design
- OWASP Top 10 Compliance

---

# Security Layers

```text
Internet

↓

ArvanCloud

↓

Traefik

↓

Rate Limiter

↓

Laravel Middleware

↓

Authentication

↓

Authorization

↓

Business Rules

↓

Database
```

---

# Security Goals

- Prevent unauthorized access
- Prevent data leakage
- Protect against common web attacks
- Protect user data
- Maintain comprehensive security logs
- Support full auditability

---

# Authentication

Authentication is implemented using:

```text
Auth.js

+

Laravel Sanctum
```

---

# Authorization

All authorization is policy-based.

Direct role checks are not permitted.

---

# Password Security

Passwords are hashed using:

```text
Argon2id
```

Minimum password length:

```text
12 Characters
```

Password requirements:

- Uppercase letter
- Lowercase letter
- Number
- Special character

---

# Password Reset

Passwords are never sent via email or SMS.

Password recovery is available only through:

- Reset Link
- OTP

---

# Session Security

Sessions use:

```text
HttpOnly

Secure

SameSite=Lax
```

Sessions are never stored in:

```text
LocalStorage

SessionStorage
```

---

# Cookie Security

All cookies are encrypted.

---

# CSRF Protection

All stateful requests require CSRF protection.

---

# XSS Protection

- All inputs are validated.
- All outputs are escaped.

`dangerouslySetInnerHTML` must never be used without proper sanitization.

---

# HTML Sanitization

When HTML sanitization is required, `DOMPurify` is used.

---

# SQL Injection

All database queries must use:

- Eloquent
- Query Builder

Forbidden:

```php
DB::select("SELECT * FROM users WHERE id=$id");
```

---

# Mass Assignment

All models must define either:

- `fillable`
- `guarded`

---

# File Upload Security

Every uploaded file is validated before storage.

Validation includes:

- MIME type
- File extension
- File size
- Virus scanning (planned)

---

# Allowed File Types

Initial supported file types:

```text
pdf
jpg
jpeg
png
docx
```

---

# Forbidden File Types

```text
exe
dll
bat
cmd
ps1
php
js
sh
```

---

# File Size

Default maximum upload size:

```text
20 MB
```

---

# Object Storage

All uploaded files are stored in:

```text
S3 Compatible Storage
```

Uploaded files are never stored inside the public directory.

---

# Signed URLs

Files are downloaded exclusively through signed URLs.

---

# Input Validation

All input validation is performed on the backend.

Frontend validation exists only to improve user experience.

---

# Output Encoding

All outputs are properly encoded.

---

# Rate Limiting

Login

```text
5/min
```

OTP

```text
3/min
```

Search

```text
30/min
```

API

```text
60/min
```

---

# Brute Force Protection

Accounts are temporarily locked after multiple failed authentication attempts.

---

# Enumeration Protection

Authentication always returns a generic error message.

Incorrect:

```text
User Not Found
```

Correct:

```text
Invalid Credentials
```

---

# HTTPS

Production environments support HTTPS only.

All HTTP requests are redirected.

---

# TLS

Minimum supported version:

```text
TLS 1.3
```

---

# Security Headers

Every response includes:

```text
HSTS

Content-Security-Policy

X-Frame-Options

X-Content-Type-Options

Referrer-Policy

Permissions-Policy
```

---

# Content Security Policy

A strict Content Security Policy (CSP) is enforced.

---

# Clickjacking Protection

```text
X-Frame-Options

DENY
```

---

# Referrer Policy

```text
strict-origin-when-cross-origin
```

---

# CORS

Only approved domains are allowed.

```text
dadline.net

admin.dadline.net

office.dadline.net
```

Wildcard origins are not permitted.

---

# API Security

All APIs require authentication unless explicitly designated as public.

---

# Secret Management

All secrets are stored in environment variables.

Secrets must never be committed to the repository.

---

# Encryption

Sensitive data is encrypted before being stored in the database.

Examples include:

- National ID
- Bank Account
- API Credentials

---

# Logging Rules

The following information must never be logged:

```text
Password

OTP

Token

Cookie

Secret

Credit Card
```

---

# Audit Trail

The following events are audited:

- Login
- Logout
- Permission Changes
- Password Changes
- Payments
- File Downloads
- File Deletions

---

# Dependency Security

Every pull request includes dependency security scanning.

Tools:

```text
Dependabot

npm audit

composer audit
```

---

# Static Analysis

Backend

```text
PHPStan
```

Frontend

```text
ESLint

TypeScript
```

---

# Vulnerability Scanning

Container images are scanned before deployment.

Planned tool:

```text
Trivy
```

---

# Backup Encryption

All backups are encrypted.

---

# Disaster Recovery

Recovery objectives:

```text
RPO

15 Minutes
```

```text
RTO

30 Minutes
```

---

# Security Monitoring

The following events are continuously monitored:

- Failed Login Attempts
- Suspicious Activities
- Permission Escalation
- Rate Limit Violations
- API Abuse

---

# Incident Response

```text
Detect

↓

Log

↓

Alert

↓

Investigate

↓

Mitigate

↓

Recover

↓

Postmortem
```

---

# Future Security Roadmap

Planned security enhancements:

- Two-Factor Authentication
- WebAuthn / Passkeys
- Device Trust
- IP Reputation
- Geo Blocking
- Virus Scanning
- Data Loss Prevention (DLP)
- SIEM Integration

---

# OWASP Compliance

The architecture is designed to address:

- Broken Access Control
- Cryptographic Failures
- Injection
- Insecure Design
- Security Misconfiguration
- Vulnerable Components
- Authentication Failures
- Software and Data Integrity Failures
- Security Logging and Monitoring Failures
- Server-Side Request Forgery (SSRF)

---

# Security Checklist

- [x] HTTPS Only
- [x] Content Security Policy (CSP)
- [x] HSTS
- [x] Argon2id Password Hashing
- [x] HttpOnly Cookies
- [x] CSRF Protection
- [x] Rate Limiting
- [x] Policy-Based Authorization
- [x] Secure File Upload
- [x] S3 Compatible Storage
- [x] Audit Logging
- [x] Dependency Scanning
- [x] Encrypted Backups

---

# Golden Rules

- Zero Trust
- Never Trust User Input
- Validate Everything
- Escape Everything
- Encrypt Sensitive Data
- Least Privilege
- HTTPS Only
- Log Security Events
- Secure by Default
- Privacy by Design

---

## ADR-015

### Decision

Adopt a **Security by Design** approach while ensuring compliance with the **OWASP Top 10**.

### Rationale

- Protect user data
- Reduce the attack surface
- Improve auditability
- Mitigate common web security threats
- Prepare the platform for financial and legal services

### Consequences

- Every new feature must undergo a security review before implementation.
- No feature may be released without proper authentication and authorization.
- Security is an integral part of development, testing, and deployment—not a separate phase.