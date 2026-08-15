# 06 — Authentication & Authorization
> Version: 2.0
---

# Overview

Authentication and Authorization are core security components of the Dadline platform.

The authentication system is designed to be:

- Secure
- Stateless
- Scalable
- Extensible
- Suitable for Web and Mobile
- Fully compatible with Laravel and Next.js

---

# Design Goals

- Session-Based Authentication for Web
- Token-Based Authentication for Mobile and Third-Party APIs
- Single Source of Truth
- Least Privilege Principle
- Permission-Based Authorization
- HttpOnly Cookies
- CSRF Protection
- Zero Trust Architecture

---

# Technology Stack

### Frontend

- Auth.js v5

### Backend

- Laravel Sanctum

### Session

- Redis

### Password Hashing

- Argon2id

### OTP

- SMS Provider

### Two-Factor Authentication

- TOTP (Future)

---

# Authentication Flow

```text
Browser

↓

Next.js

↓

Auth.js

↓

Laravel API

↓

Sanctum

↓

PostgreSQL
```

---

# Why Auth.js?

Benefits:

- Native Next.js integration
- Server Components support
- Middleware integration
- Session management
- OAuth ready
- Credentials provider
- Secure cookie handling

---

# Why Sanctum?

Laravel Sanctum is the recommended authentication solution for Laravel-powered SPAs.

Benefits:

- Session-based authentication
- Cookie authentication
- CSRF protection
- Personal Access Tokens
- Mobile-ready

---

# Login Flow

```text
User

↓

Login Form

↓

Next.js

↓

Laravel API

↓

Validate Credentials

↓

Create Session

↓

HttpOnly Cookie

↓

Authenticated
```

---

# Cookie Strategy

All sessions are stored in secure cookies.

Properties:

```text
HttpOnly

Secure

SameSite=Lax

Encrypted
```

---

# Never Store

The following must never be stored in browser storage:

- Access Tokens
- Refresh Tokens
- JWTs
- Sessions

---

# Password Hashing

All passwords are hashed using:

```text
Argon2id
```

SHA256 and MD5 must never be used for password storage.

---

# Login Methods

Initial release:

- Mobile + OTP
- Mobile + Password

Future releases:

- Google
- GitHub
- Apple
- Azure AD

---

# OTP Authentication

```text
User

↓

Enter Mobile Number

↓

Generate OTP

↓

Redis

↓

SMS Provider

↓

Verify OTP

↓

Create Session
```

---

# OTP Rules

Length:

```text
6 Digits
```

Expiration:

```text
2 Minutes
```

Maximum attempts:

```text
5 Attempts
```

After that:

```text
Temporary Lock
```

---

# Session Storage

Sessions are stored in Redis.

```text
Redis

↓

Session

↓

User
```

---

# Session Lifetime

Default:

```text
7 Days
```

Remember Me:

```text
30 Days
```

Admin Panel:

```text
12 Hours
```

---

# Session Invalidation

Sessions are invalidated when:

- User logs out
- Password changes
- User account is disabled
- Force logout is triggered
- A security incident occurs

---

# Device Management

Each session stores:

```text
Device

Browser

Operating System

IP Address

Country

Last Activity
```

Users can view and revoke active sessions.

---

# Authorization

Dadline uses **Role-Based** and **Permission-Based** authorization.

Roles define user groups.

Permissions determine access rights.

---

# Roles

```text
Super Admin

Admin

Lawyer

Expert

Customer

Support
```

---

# Permissions

Examples:

```text
case.create

case.view

case.update

case.close

document.upload

document.delete

invoice.create

invoice.pay

user.update

user.delete

report.view
```

---

# Permission Checks

Authorization is performed exclusively through Policies.

```php
$this->authorize('update', $case);
```

or

```php
Gate::authorize('case.update');
```

---

# Never

Avoid direct role checks.

Incorrect:

```php
if ($user->role == "admin")
```

---

# Policy Structure

```text
Policies/

CasePolicy

UserPolicy

DocumentPolicy

InvoicePolicy
```

---

# Super Admin

The Super Admin has all permissions but still passes through the authorization policy layer.

No authorization shortcuts are allowed.

---

# API Authentication

All protected endpoints use:

```text
auth:sanctum
```

Public endpoints must be explicitly defined.

---

# Public Endpoints

Examples:

```text
Login

Register

Verify OTP

Forgot Password

Reset Password
```

---

# Protected Endpoints

Examples:

```text
Create Case

Upload Document

Payments

Notifications

Profile

Dashboard
```

---

# CSRF Protection

All stateful requests require CSRF protection.

---

# Rate Limiting

Login:

```text
5 Requests / Minute
```

OTP:

```text
3 Requests / Minute
```

Registration:

```text
5 Requests / Hour
```

Password Reset:

```text
3 Requests / Hour
```

Public API:

```text
60 Requests / Minute
```

---

# Brute Force Protection

After multiple failed authentication attempts:

```text
Temporary Lock
```

is applied.

---

# Password Policy

Minimum length:

```text
12 Characters
```

Requirements:

- Uppercase letter
- Lowercase letter
- Number
- Special character

---

# Password History

Future enhancement:

The last

```text
5 Passwords
```

cannot be reused.

---

# Two-Factor Authentication

Planned for future releases.

```text
TOTP

Authenticator App

Recovery Codes
```

---

# Social Login

Planned providers:

```text
Google

GitHub

Apple

Microsoft
```

---

# Audit Events

The following security events are logged:

```text
Login

Logout

Password Change

Permission Change

OTP Verification

Failed Login

Session Revoked
```

---

# Security Headers

All responses include:

```text
HSTS

Content-Security-Policy

X-Frame-Options

X-Content-Type-Options

Referrer-Policy
```

---

# Authentication Flow Diagram

```text
Browser
     │
     ▼
 Next.js
     │
     ▼
 Auth.js
     │
     ▼
 Laravel Sanctum
     │
     ▼
 Session (Redis)
     │
     ▼
 PostgreSQL
```

---

# Authorization Flow

```text
Request

↓

Authenticate

↓

Policy

↓

Permission

↓

Action

↓

Response
```

---

# Golden Rules

- Use Auth.js for authentication
- Use Laravel Sanctum
- Store sessions in HttpOnly cookies
- Never store JWTs in browser storage
- Never perform direct role checks
- Use Policies for authorization
- Use Permissions for access control
- Store sessions in Redis
- Hash passwords with Argon2id
- Protect OTP endpoints with rate limiting

---

# Checklist

- [x] Auth.js
- [x] Laravel Sanctum
- [x] Redis Sessions
- [x] HttpOnly Cookies
- [x] CSRF Protection
- [x] OTP Authentication
- [x] Role & Permission Management
- [x] Policy-Based Authorization
- [x] Rate Limiting
- [x] Audit Logging

---

# Architecture Decision Record

## ADR-006

### Decision

Use **Auth.js** together with **Laravel Sanctum** as the standard authentication solution.

### Rationale

- Native Next.js integration
- High security
- Session-based authentication
- Mobile and API support
- No JWT storage in the browser

### Consequences

- Improved security
- Simplified session management
- Reduced token leakage risk
- Future support for OAuth and Two-Factor Authentication