# AdminHub21

A bilingual (English / Persian) freelance marketplace connecting employers with verified social media and e-commerce professionals. The platform supports the full hiring lifecycle: discovery, comparison, contracting, and ongoing management.

## What it does

Employers find specialists across Instagram, Telegram, WhatsApp, Torob, Digikala, and LinkedIn. Admins publish packages, receive custom offers, and manage contracts. The platform also includes an MCP-powered AI assistant for hiring intelligence, a contract generator with legally styled clauses, and a full admin panel for user, content, ticket, and workspace management.

The product ships as a responsive web app and an Android build via Capacitor.

## Architecture

The repository is a monorepo:

- **Frontend** — `src/` is a React 19 single-page application built with Vite 8, React Router 7, and Tailwind CSS v4. It uses React Context for auth and package state, and a custom design system for theming, typography, and icons.
- **Backend** — `apps/api/` is the Laravel API (`adminhub/api`) that every Docker stack builds. Domain logic lives in invokable actions under `app/Actions/<Domain>/`, with authorization in `app/Policies/`, validation in `app/Http/Requests/`, and queued work in `app/Jobs/`. Routes are split per domain under `routes/api/v1/`.
- **Shared types** — `packages/shared/` holds the TypeScript contracts imported as `@adminhub/shared`.

The frontend talks to the backend through a typed `apiFetch` wrapper in `src/lib/api/`.

### Legacy backends

Two earlier backends remain in the tree for reference and are no longer built by any Docker stack:

- `apps/server/` — the archived Hono + Drizzle service (its compose service is commented out).
- `apps/laravel/` — an early, partial Laravel port that `apps/api/` supersedes.

Prefer `apps/api/` for all new backend work.

### Data flow

1. `AuthContext` manages session state, token storage, and OTP/password login flows.
2. Pages consume translation objects from `src/i18n/` and switch direction (`ltr`/`rtl`) based on the selected language.
3. Protected routes enforce role-based access (`employer`, `admin`, `super_admin`); the API enforces the same rules again through policies.
4. The API returns normalized payloads; the frontend unwraps lists and items before rendering.

## Two surfaces

The repository ships two frontends that share one design-token package:

| Surface | App | Rendering | Purpose |
| ------- | --- | --------- | ------- |
| Public site + workspace | `apps/web` (Next.js 16, App Router) | server-rendered public pages, server-rendered authenticated `/app/*` | home, marketplace catalogue, package pages, pricing, changelog, contracts, wallet, tickets |
| Admin SPA | root `src/` (Vite + React Router) | client-side, authenticated | admin panel, workspace cases, portfolio and content moderation |

Contracts, wallet and tickets no longer have a Vite implementation: the legacy
`/contracts` and `/tickets` URLs forward to `/app/*` on the Next.js surface, so
there is exactly one authenticated prefix to maintain.

Both import `@adminhub/design-tokens/theme.css`, so colour and typography tokens cannot drift between them. The public site is Persian-first (`lang="fa" dir="rtl"`), ships `sitemap.xml` and `robots.txt`, and treats `/app/*` as a private surface that redirects anonymous visitors through `/sign-in?redirectUrl=…`.

Run them with:

```bash
pnpm dev        # workspace on :8443
pnpm dev:web    # public site on :3000
```

The workspace modules are being moved into the Next shell progressively; until then `/app` presents the authenticated shell and the migrated modules, and every other `/app/*` path returns the visitor to sign-in and back.

## Tech stack

| Layer      | Technology                                                          |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 19, React Router 7, TypeScript 5.7                            |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)                               |
| Backend    | Laravel 13, PHP 8.4, Sanctum, Actions + Policies                    |
| Database   | PostgreSQL 16 (47 migrations)                                       |
| Queue      | Redis + Laravel Horizon (`ai-*`, `pdf-*`, `notifications-*` queues) |
| PDF        | `barryvdh/laravel-dompdf` (contract generation)                     |
| AI         | OpenRouter / OpenAI / Anthropic providers                           |
| Payments   | Zibal, SEP, crypto callbacks with signature + replay protection     |
| Mobile     | Capacitor (Android)                                                 |
| Testing    | PHPUnit (API), Playwright (E2E)                                     |
| Formatting | `oxfmt`                                                             |

## User roles

**Employer** — browses the marketplace, compares packages, sends custom offers, generates and signs contracts, manages favorites, reviews, and support tickets.

**Admin / Specialist** — publishes packages, manages profile and portfolio, responds to offers, views contracts and payouts, and uses the workspace for cases, tasks, events, and time logs.

**Super Admin** — accesses the admin panel to manage users, moderate content, handle support tickets, and oversee platform health.

## Key features

### Marketplace

Browse verified professionals by platform, rating, and price. Each admin profile exposes skills, pricing packages, verification status, and insurance eligibility. Employers can save favorites and request custom offers.

### Packages & comparison

Admins create platform-specific or multi-platform bundles. Employers can select up to three packages and compare them side-by-side on features, billing cycle, and price.

### Contract generator

A five-step wizard (Parties → Scope → Payment → Terms → Review) produces a styled service agreement. It supports termination clauses, substitution and insurance terms, payment schedules, and PDF generation on a dedicated queue.

### AI assistant

An MCP-connected chat interface provides hiring intelligence for employers and career guidance for admins. It supports multiple model providers and conversation management; completions run through `ProcessAiRequest` on the AI queues.

### Admin panel

Super admins manage users, moderate stories/blogs/comments, triage support tickets, and oversee workspace cases, tasks, events, and time logs. Admins manage their own portfolios and packages.

### Mobile

The web shell is wrapped with Capacitor for Android. The UI is responsive by default, with a dedicated mobile topbar and collapsible sidebar.

## Prerequisites

- Node.js 22 and pnpm
- Docker (for the full stack), or PHP 8.4+, Composer, PostgreSQL 16 and Redis for a local backend
- Optional: Android SDK (for mobile builds)

## Setup

### Frontend only, with the built-in demo API

The fastest way to see the product. `--mode demo` boots an in-memory API that answers `/api/*` and `/ai/*` from a seeded dataset, so no database or backend is needed.

```bash
pnpm install
pnpm dev:demo        # http://localhost:8443
```

You are signed in automatically as an employer; the floating role switcher in the bottom-left corner toggles between the employer and admin views. Seed data lives in `dev/demo-data.ts`.

### Frontend + real Laravel backend

```bash
pnpm install

# PostgreSQL, Redis, API, nginx (:8080) and Horizon
pnpm dev:api

# Frontend pointed at the API
VITE_API_BASE_URL=http://localhost:8080 pnpm dev
```

Then create the schema and an admin user:

```bash
docker compose exec api php artisan migrate --seed
```

### Full Docker stack (one command)

```bash
docker compose up --build
```

That command is the whole setup story. On first boot the API container waits for
PostgreSQL, applies the migrations, seeds the demo dataset, links the media
directory, and only then starts php-fpm. No manual `migrate`, `seed` or
`key:generate` step is required — the local stack ships a throwaway `APP_KEY`,
and the public site, workspace, admin SPA, API and Mailpit all come up together.

| Service                                        | URL                   |
| ---------------------------------------------- | --------------------- |
| Public site + workspace (Next.js 16)           | http://localhost:3000 |
| API through nginx                              | http://localhost:8080 |
| Admin SPA, production build (`docker-compose.yml`) | http://localhost:8443 |
| Frontend, demo stack (`docker-compose.demo.yml`)   | http://localhost:8444 |
| Mailpit                                        | http://localhost:8025 |

The seeded accounts are:

| Role        | Email                   | Password   |
| ----------- | ----------------------- | ---------- |
| Employer    | `demo@adminhub21.test`  | `password` |
| Specialist  | `expert@adminhub21.test`| `password` |
| Super admin | `admin@adminhub21.com`  | `password` |

The employer arrives with a funded wallet, two contracts and a support thread,
so every screen has something to show. The seeders are idempotent: restarting
the stack does not duplicate rows.

`docker compose exec api php artisan migrate --seed` remains available if you
want to reseed by hand.

`pnpm dev` and the Docker `web` service both bind port 8443, so run one or the other (or change the published port in the compose file).

### Environment variables

Frontend — create `.env` in the project root:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_WORKSPACE_URL=http://localhost:3000   # where /contracts and /tickets forward
VITE_AUTH_TOKEN=  # optional; used for demo / CI login
```

Next.js workspace — `apps/web` reads `NEXT_PUBLIC_API_BASE_URL` (default
`http://localhost:8000`). Every call happens in a server component or a server
action, so the browser never receives the API origin or the session token.

Backend — copy `apps/api/.env.example` to `apps/api/.env` and run `php artisan key:generate`. The template documents every variable the files in `apps/api/config/` read, including Redis, Sanctum, hashing, mail, AI providers, and payment callbacks.

> **Security note:** the example file ships with empty secrets. Set real values for `APP_KEY` and every `*_CALLBACK_SECRET` before deploying, and keep `APP_DEBUG=false` outside local development.

## Development workflow

- Run `pnpm dev:demo` (no backend) or `pnpm dev` + `pnpm dev:api` (real backend).
- The frontend reloads on file changes via Vite HMR.
- Use `pnpm format` to format code with `oxfmt`.
- Routes are declared in `src/App.tsx`. Add new pages under `src/pages/` and register them there.
- Backend: put domain logic in `app/Actions/<Domain>/`, authorize with a policy in `app/Policies/`, validate in `app/Http/Requests/`, and register endpoints in the matching file under `routes/api/v1/`.
- All user-facing strings belong in `src/i18n/`; add the key to both `en.ts` and `fa.ts`.

## Testing

```bash
# API feature and unit tests
cd apps/api && php artisan test

# End-to-end browser tests
pnpm test:e2e
pnpm test:e2e:ui
```

The API suite covers authentication, catalog, payment callbacks, review authorization, and security regressions (`tests/Feature/`), plus hashing configuration (`tests/Unit/HashingConfigTest.php`). Playwright specs live in `e2e/`.

Locally, `phpunit.xml` runs the suite against in-memory SQLite so no database server is needed. CI overrides `DB_CONNECTION` with real environment variables (which take precedence over the `<env>` block) and runs the same suite on PostgreSQL 16.

### Continuous integration

| Job               | What it runs                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `frontend-format` | `pnpm format --check` (oxfmt)                                        |
| `frontend-build`  | `pnpm build` (workspace) and `pnpm build:web` (public site)          |
| `api-tests`       | `php artisan test` on PHP 8.4 with a PostgreSQL 16 service container |

`api-tests` caches Composer downloads via `ramsey/composer-install`, copies `apps/api/.env.example` to `.env`, generates a key, and then runs the suite. Any change to the API requires a green run here.

`api-tests` also publishes one check annotation per failing test (from its JUnit report), so a red run is diagnosable without downloading the job log.

`apps/api/phpstan.neon.dist` is currently not wired into CI: it includes `larastan/larastan`, which is not in `composer.json`, and it targets level 8, so it cannot run until that dependency is added and the baseline is cleared.

## Security notes

- Passwords default to **argon2id** (`HASH_DRIVER`); legacy bcrypt hashes remain verifiable and are rehashed on next login.
- Payment gateway callbacks are validated against an HMAC secret, an IP allowlist, a timestamp tolerance window, and a replay cache — see `config/payment.php`.
- Authorization is enforced by policies, not only by route middleware.

## Deployment notes

- Build the frontend with `pnpm build`; output goes to `dist/`.
- The backend runs as PHP-FPM behind nginx with Horizon as a separate container (`docker-compose.prod.yml`).
- Set `APP_ENV=production`, `APP_DEBUG=false`, a strong `APP_KEY`, real payment secrets, and `CORS_ALLOWED_ORIGINS` restricted to your frontend domain.
- Run `php artisan migrate --force` and `php artisan horizon:terminate` as part of each release.
- For mobile, run `pnpm build` then `npx cap sync android` before building the APK.

## Project structure

```
src/
  components/
    ai/             — Chat UI, model selector, conversation sidebar
    auth/           — ProtectedRoute
    dashboard/      — EmployerDashboard, AdminDashboard
    demo/           — Role switcher used by demo mode
    layout/         — Sidebar, Topbar, Icon
    platform/       — Stars, MCPConnectorStatus
    ui/             — Badge, Button, Card, Input, Tabs, CommandPalette, ErrorBoundary
  contexts/         — AuthContext, PackageContext, AiContext
  design-system/    — ThemeProvider, tokens
  lib/
    api/            — typed API client (apiFetch, per-domain modules)
    photo.ts        — avatar URL resolution (absolute vs. Unsplash id)
  pages/            — Marketplace, Contracts, Tickets, AI, Admin pages, etc.
  i18n/             — English and Persian translations
  App.tsx           — Routes, layout shell, role-based nav
  main.tsx          — React entrypoint

dev/
  demo-data.ts      — seeded in-memory dataset
  demo-api-handler.ts — request handlers for the demo API
  demo-api-plugin.ts  — Vite middleware mounting /api and /ai in demo mode

apps/api/
  app/
    Actions/        — invokable domain actions (AdminProfile, Ai, Contracts, …)
    Console/        — Artisan commands
    Enums/          — shared enums
    Hashing/        — Argon2IdHasher with bcrypt verification fallback
    Http/           — Controllers, Middleware, Requests, Resources
    Jobs/           — GenerateContractPdf, ProcessAiRequest, SendNotification
    Models/         — Eloquent models
    Policies/       — authorization for blog, comment, contract, offer, review, ticket, user…
  config/           — app, cache, cors, database, hashing, horizon, payment, queue, sanctum…
  database/
    migrations/     — 47 migrations
    seeders/
  routes/
    api.php
    api/v1/         — admin, affiliate, ai, auth, cases, catalog, content, contracts,
                      favorites, offers, packages, payments, portfolio, profiles,
                      public, reviews, schedule, tickets, wallets
  tests/
    Feature/        — Auth, Catalog, PaymentCallback, ReviewAuthorization, Security
    Unit/           — HashingConfig

packages/shared/    — TypeScript types shared by the frontend
apps/server/        — archived Hono backend
apps/laravel/       — superseded partial Laravel port
```

## Contributing

1. Keep modules small and domain-focused.
2. Validate every new input with a form request (API) or Zod schema (frontend demo tooling).
3. Use `src/i18n/` for all user-facing strings; do not hardcode English or Persian text in components.
4. Add or extend a feature test for backend behavior changes.
5. Run `pnpm format` and `pnpm build` before opening a pull request.

## License

AdminHub21
