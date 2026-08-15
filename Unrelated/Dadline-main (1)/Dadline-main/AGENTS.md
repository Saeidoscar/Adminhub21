# AGENTS.md — Dadline Monorepo

## Project overview

Dadline is an Iranian legal-services SaaS: public legal marketplace, lawyer/office and admin dashboards, and AI-assisted legal tools. It is a pnpm/Turborepo monorepo.

| Area | Location | Stack / responsibility |
| --- | --- | --- |
| Public client app | `apps/web` | Next.js 16, React 19, App Router |
| Admin dashboard | `apps/admin` | Next.js 16, React 19 |
| Lawyer/office dashboard | `apps/office` | Next.js 16, React 19 |
| Central backend | `apps/api` | Laravel 13, PHP 8.3, Sanctum, Horizon |
| Shared frontend code | `packages/{api-client,config,hooks,shared,types,ui,utils}` | Workspace packages; do not duplicate cross-app code |
| Infrastructure | `infrastructure/{traefik,postgres,redis}` and Compose files | Docker, PostgreSQL 17, Redis 8, proxy/storage configuration |
| Legacy migration | `migrationsDB` | Separate Dockerized Python MySQL → PostgreSQL migration tool |
| UI reference | `front_sample` | Read only when a dashboard UI task needs a targeted comparable pattern |

`apps/*` and `packages/*` are pnpm workspaces. Use `pnpm`, never npm or yarn. For one app use `pnpm --filter <web|admin|office> <script>`; for cross-app work use `turbo run <task>` from the repository root.

## Working efficiently

- If `.codegraph/` exists, use `codegraph explore "<symbol or question>"` before grep/find or broad file reading. If it does not exist, do not attempt to create or refresh an index.
- Scope work to the affected app first. Use `rg` and targeted file ranges; never recursively browse the whole repository.
- Read a nested `AGENTS.md` before modifying files below it. More-specific instructions take precedence.
- Preserve unrelated working-tree changes. Do not alter generated files, lockfiles, dependencies, or infrastructure unless the task requires it.
- Explanations to the user are Persian; source code, identifiers, commit messages, and technical comments are English unless the task explicitly says otherwise.

## GStack workflow skills

- gstack is installed globally for Codex under `~/.codex/skills` with the source tree at `~/.gstack/repos/gstack`.
- Invoke gstack skills with their `gstack-` names when the user explicitly asks for them or when they clearly match the task, such as `gstack-review`, `gstack-qa`, `gstack-investigate`, `gstack-spec`, or `gstack-ship`.
- Keep Dadline's repository rules in this file authoritative. Do not let a gstack workflow override pnpm-only package management, Laravel API boundaries, RTL/Persian UI requirements, or the default investigation scope.

## Change management

- Before any large refactor affecting more than 3 files:
  1. Explain the planned changes.
  2. List affected files.
  3. Wait for confirmation.

- Prefer incremental changes over large rewrites.
- Never rewrite a whole module when a targeted patch is enough.

## Architecture and API rules

- The Laravel API is the only database boundary. Next.js apps must never connect to PostgreSQL, invoke a direct ORM, or share database credentials.
- All API endpoints are versioned below `/v1/`; do not add an extra `/api/` prefix. Keep route definitions in the existing `routes/api/v1/*.php` groups.
- Frontend server components/actions use the internal Docker API URL through the existing `apiClient`; browser-side calls use the public URL. Do not mix these contexts.
- Keep request/response validation in Zod and centralize snake_case ↔ camelCase transformations. Reuse existing types and API helpers.
- Preserve the mobile-first authentication flow: check mobile → send/verify OTP → register or sign in. Keep Auth.js/Sanctum integration; do not replace it with Passport or an ad-hoc auth flow.
- Public links and externally visible identifiers must use a non-enumerable `slug`, `unique_code`, or `pin_code`, not an internal numeric key.

## Backend and database rules

- Follow the existing Laravel layering: thin `Http/Controllers` → existing-style Actions/Services → Eloquent models/query builders. Do not invent a second architecture.
- Use Eloquent/query builder in application code; raw SQL is limited to migration/reporting work that already uses it.
- Before adding a table or key, inspect comparable current migrations/schema. UUID versus BIGINT is a table-level decision; do not assume a global default.
- PostgreSQL 17 is the production datastore; `pgvector` dimensions and extensions must match existing schema conventions.
- Use soft deletes for sensitive legal entities (including contracts, service requests, offers, and results). Do not hard-delete them.
- Files belong in the existing S3-compatible storage/attachment flow, not local application storage paths.
- Use Laravel migrations for new application schema. Use `migrationsDB` only for legacy data migration; read `migrationsDB/README.md` before migration work and never edit its state/log files except to diagnose that migration.

## Frontend rules

- Next.js App Router is used in all frontend apps. Prefer server components; add `'use client'` only when browser state, effects, or event handlers require it.
- Interfaces are Persian and RTL-first. Preserve locale, accessibility, responsive behavior, dark mode, and existing Tailwind/SCSS conventions.
- Reuse `packages/*` for code used by multiple apps. Check existing `packages/ui` and app UI components before introducing a new primitive or dependency.
- For dashboard-related UI in `admin`, `office`, or dashboard sections of `web`, search `front_sample` for a comparable component first. Adapt its visual pattern; do not copy mock data or create parallel UI systems.
- Do not use mock data for production behavior when a Laravel endpoint exists. If an endpoint/schema is absent, do not invent its contract.
- Sensitive-data authorization belongs on the API; hiding a frontend control is not authorization.
- Avoid unnecessary client components.
- Do not add "use client" to parent layouts or pages unless required.
- Keep data fetching close to server components.
- Do not move server logic into browser code.

## Laravel async and background jobs

- Long-running tasks must use Laravel Jobs and Queues.
- SMS, email, notifications, imports, exports, and AI processing should not run directly inside controllers.
- When adding or changing an operational Laravel feature, explicitly evaluate its user/admin notification needs. If the workflow creates, updates, completes, fails, or requires action on a user-visible legal, financial, auth, ticket, office, marketplace, or content entity, add the necessary notification templates, dispatch points, delivery rules, dedupe behavior, and tests/checks in the same change.
- Use Horizon conventions already present in the project.
- Do not create synchronous processing where an async workflow already exists.

## Testing, quality, and dependencies

- Run the narrowest relevant check first: `pnpm --filter <app> lint` or the app's Prettier script for frontend work; `composer test` / `php artisan test` for API work. Run `turbo run build|lint|test` only for genuine cross-workspace changes.
- Format PHP with the repository's installed Laravel Pint tooling when touching PHP. Do not reformat unrelated files.
- Add or update focused tests for new backend Actions/Services and behavior changes when existing test coverage establishes a pattern.
- Do not add packages until checking workspace packages and existing dependencies. Package installation must use the Liara mirror configuration because direct registries may be unavailable in Iran.
- Make conventional English commit messages (`feat:`, `fix:`, `chore:`, …) when asked to commit.

## Default investigation scope

For backend tasks, start with:
- apps/api/app/
- apps/api/routes/
- apps/api/database/migrations/

For frontend tasks, start with:
- apps/web/src/
- apps/admin/src/
- apps/office/src/
- packages/ui/

Only expand scope when required.

## Do not index, read, or modify by default

These paths are generated, dependency-managed, secret, large, or runtime-only. Access one only when the task explicitly requires it.

```text
.git/
.codegraph/
.pnpm-store/
node_modules/
**/node_modules/
**/vendor/
**/.next/
**/.turbo/
**/dist/
**/build/
**/coverage/
**/.cache/
**/public/build/

**/.env
**/.env.*
*.log
*.tmp
*.temp

apps/api/storage/logs/
apps/api/storage/framework/cache/
apps/api/storage/framework/sessions/
apps/api/storage/framework/views/
apps/api/bootstrap/cache/

docker-data/
docker/volumes/
**/volumes/
migrationsDB/logs/

Do not read lockfiles wholesale.
Only inspect specific sections when dependency resolution requires it.
```

Do not read lockfiles wholesale; grep them only to verify an exact dependency version. Do not index `front_sample` or `docs` wholesale either—search them only when the current task needs a reference, decision record, or runbook.front_sample is a visual reference only.
Never copy business logic, API code, or mock data from it.
