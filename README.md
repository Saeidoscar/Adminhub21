# AdminHub21

Multi-role admin and employer platform for a digital-services marketplace: curated packages and
custom offers, a contract workflow, tickets, wallet/payouts, reviews, catalogue and content
moderation, plus AI helpers. English and Persian (RTL) UI.

Built from a Figma Make export (`figma-site-import-4cacb345`, project `1551273418911820825`) and
restructured into a real app with its own API and database layer.

## Repository layout

```
.
├── src/                     React SPA (Vite, react-router 7, Tailwind v4)
│   ├── App.tsx              one <Page> union + route table; all routing lives here
│   ├── pages/               28 route components (admin, employer, public)
│   ├── components/          ai · auth · contracts · dashboard · layout · packages · platform · ui
│   ├── lib/api/             typed fetch client, one file per domain (+ admin/ clients)
│   ├── lib/                 validation.ts, media.ts, constants.ts, mcp-client.ts
│   ├── domain/              contract/ package/ profile/ ticket/ business rules
│   ├── services/            contractService · marketplaceService · packageService
│   ├── hooks/               useTickets · useReviews · useMarketplace · usePackageForm · ...
│   ├── design-system/       ThemeProvider + tokens (the only place theme is defined)
│   ├── contexts/            PackageContext (package + offer state shared across pages)
│   └── i18n/                en.ts, fa.ts, types.ts (`Tr`)
├── packages/shared/         `@adminhub/shared` — domain types, pricing utils, shared by SPA and API
├── apps/server/             Node/Hono API — the backend the SPA actually talks to
│   ├── src/index.ts         route mounting
│   ├── src/modules/         one folder per feature (auth, packages, contracts, tickets, ...)
│   ├── src/middleware/      JWT auth, role checks, error handler
│   ├── src/db/              schema.ts (drizzle-orm) + seed.ts
│   ├── drizzle/             SQL migrations + snapshots
│   └── tests/               vitest unit tests (auth, packages, contracts, ...)
├── apps/api/                Laravel 13 bootstrap — only `GET /api/v1/health` so far (see Known issues)
├── android/                 Capacitor Android project (`capacitor.config.ts` in the root)
├── e2e/                     Playwright specs (API-level auth/package/ticket flows)
├── docker/nginx.conf        nginx config baked into the web image
├── scripts/                 smoke tests for the Laravel API (bash + PowerShell)
├── .figma/make/             Figma Make site/project config, imported by vite.config.ts
└── docker-compose*.yml      dev / demo / prod stacks (postgres, redis, Laravel api+nginx, web)
```

## Requirements

- Node.js `>= 22`
- pnpm `>= 10` (`corepack enable`)
- PostgreSQL 16 (simplest: `docker compose up -d postgres`)

`.mise.toml` pins the toolchain (node 22.19.0, pnpm 10.34.3, postgres 17.7) if you use [mise](https://mise.jdx.dev).

## Quick start

```bash
pnpm install                       # root + packages/shared + apps/server
docker compose up -d postgres      # postgres:16-alpine, db/user/password = adminhub/postgres/postgres

cp apps/server/.env.example apps/server/.env    # optional: everything has dev defaults
pnpm --filter @adminhub/server db:push         # apply src/db/schema.ts to the database
pnpm --filter @adminhub/server db:seed         # demo users, packages, offers, contracts, wallet...

pnpm dev:api      # Hono API on http://localhost:8787
pnpm dev          # SPA on http://localhost:8443 — Vite proxies /api to the API
```

Seeded logins (`apps/server/src/db/seed.ts`):

| Role        | Email                  | Password      |
| ----------- | ---------------------- | ------------- |
| super_admin | superadmin@adminhub.ir | `password123` |
| admin       | admin@adminhub.ir      | `password123` |
| employer    | employer@example.com   | `password123` |

> The seed also contains a personal `s.saeid.sr@gmail.com` super-admin entry — remove it before
> the repository is shared anywhere public.

## Scripts

Root (`package.json`):

| Command                | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `pnpm dev`             | Vite dev server (port `$PORT` or 8443)                           |
| `pnpm dev:api`         | Hono API via `tsx watch` (port 8787)                             |
| `pnpm build`           | Type-aware Vite production build into `dist/`                     |
| `pnpm preview`         | Serve the built SPA                                              |
| `pnpm test:e2e`        | Playwright specs (expects the API on `$API_URL`, default 8787)   |
| `pnpm test:e2e:ui`     | Playwright UI mode                                              |
| `pnpm format`          | `oxfmt .` — see Known issues before running it                   |

API (`apps/server`, run with `pnpm --filter @adminhub/server <script>` or from that folder):

| Script          | What it does                                   |
| --------------- | ---------------------------------------------- |
| `dev`           | `tsx watch src/index.ts`                       |
| `start`         | `tsx src/index.ts`                             |
| `typecheck`     | `tsc --noEmit`                                 |
| `test` / `test:watch` | vitest (`tests/**`)                    |
| `db:generate`   | drizzle-kit diff → SQL migration                |
| `db:migrate`    | apply `drizzle/*.sql`                           |
| `db:push`       | push `src/db/schema.ts` straight to the database |
| `db:seed`       | truncate + reseed demo data                     |

## Environment

Frontend (build-time, `import.meta.env`):

| Variable              | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | API origin for `/api/*` clients. Unset → relative paths (Vite proxy in dev). |
| `VITE_DEV_API_PROXY`  | Dev-only proxy target used by `vite.config.ts` (default `http://localhost:8787`). |
| `VITE_AUTH_TOKEN`     | Dev-only fallback bearer token when nothing is in `localStorage`.          |

API (`apps/server/src/env.ts`, all optional with dev defaults):

`NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`,
and the optional provider keys `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY` (without
a key the AI module answers in mock mode).

## API surface

Hono, versionless `/api/*`, JWT bearer access tokens plus refresh:

`auth` · `admin-profiles` · `packages` · `offers` · `contracts` · `public/contracts` · `favorites` ·
`tickets` · `stories` · `blogs` · `comments` · `ai` · `cases` · `tasks` · `events` · `time-logs` ·
`portfolio` · `reviews` · `wallets` · `payouts` · catalogue (`tools`, `editors`, `vibe-coders`) ·
`affiliate` · `admin/dashboard` · `admin/users` · `admin/tickets` · `admin/content`

Roles are `employer`, `admin`, `super_admin` (see `apps/server/src/modules/policies/` and
`packages/shared`). Most list endpoints return `{ <key>: rows }`; `admin-profiles`, `cases` and
`tasks` return bare arrays — `src/lib/api/core.ts#unwrapList` accepts both, so keep the server
response shape and the matching client parser in sync when adding a module.

## Mobile

`capacitor.config.ts` + `android/` wrap the built SPA:

```bash
pnpm build && npx cap sync android
```

## Docker

| File                      | Build context | Result                                                        |
| ------------------------- | ------------- | ------------------------------------------------------------- |
| `Dockerfile`              | `.`           | SPA bundle served by nginx (`docker/nginx.conf`), used by the `web` service |
| `apps/server/Dockerfile`  | `.`           | Hono API on tsx, port 8787 (not part of the compose stack)    |
| `apps/api/Dockerfile[.nginx]` | `apps/api` | Laravel php-fpm + nginx (`api`, `nginx` services, port 8080) |
| `docker-compose.yml`      |               | dev: postgres, redis, api, nginx, web, mailpit                |
| `docker-compose.demo.yml` / `.prod.yml` |   | trimmed variants without mailpit / with prod settings          |

`scripts/smoke-test.sh` and `scripts/smoke-test.ps1` hit `${BASE_URL}/api/v1/*`, i.e. the Laravel
service — point `BASE_URL` at `http://localhost:8080`. They cover `/api/v1/health` plus whatever
`apps/api/routes/api.php` grows.

## Conventions

- Routing and the page union are centralised in `src/App.tsx`; pages do not reach for the API client directly when a hook or service already covers it.
- Shared types come from `@adminhub/shared` (aliased to source, so no build step is required).
- Theme, spacing and type scale come from `src/design-system` only; components must not re-tune them.
- `src/i18n/en.ts` is the key dictionary — Persian lives in `fa.ts`; both are typed by `src/i18n/types.ts`.
- Figma Make leftovers (`.figma/make/*`, `src/index.css` palette, the `@figma-figma` script in `index.html`) are kept on purpose; see `AGENTS.md`.

## Known issues

- **Migrations lag the schema.** `apps/server/src/db/schema.ts` and `drizzle/meta/0001_snapshot.json`
  declare 29 tables, but the committed SQL (`0000_*`, `0001_*`) creates only 10. On a fresh database
  every endpoint touching tickets, reviews, wallets, tasks, cases, events, portfolio, ai\*, ...
  fails until you `db:push` (or hand-write the missing migration — `db:generate` currently stops on
  an interactive column-conflict prompt).
- **`pnpm format` is destructive.** `oxfmt@0.2.0` rewrites `type` imports and the generated
  `src/i18n/fa.ts` into invalid syntax, so `pnpm format --check` fails in CI. Format selectively and
  re-run `npx tsc --noEmit` afterwards.
- **No `/api/mcp` server module.** `src/lib/mcp-client.ts` and `CommandPalette`/`MCPConnectorStatus`
  call it and silently fall back to local mocks; the components are also not mounted in any page.
- **`apps/api` (Laravel) is a stub.** It carries its own CI (pint/phpstan/phpunit) and the compose
  stack, but exposes only `GET /api/v1/health`, so the containerised `web` service
  (`VITE_API_BASE_URL=http://localhost:8080`) has no backend to talk to. `apps/server` is the real API.
- **CI**: `.github/workflows/ci.yml` uses `pnpm/action-setup@v4` without a `packageManager` field in
  `package.json`, which makes the setup step fail until one is pinned.

## Related docs

- `AGENTS.md` — Figma Make handoff notes (styling, routing, layout rules)
- `apps/api/README.md`, `apps/api/AGENTS.md` — Laravel bootstrap notes (upstream framework defaults)
- `apps/server/src/modules/<name>/` — one self-contained folder per feature: `<name>.routes.ts`, `<name>.service.ts`, `<name>.schema.ts`
