# AdminHub21

A bilingual (English / Persian) freelance marketplace connecting employers with verified social media and e-commerce professionals. The platform supports the full hiring lifecycle: discovery, comparison, contracting, and ongoing management.

## What it does

Employers find specialists across Instagram, Telegram, WhatsApp, Torob, Digikala, and LinkedIn. Admins publish packages, receive custom offers, and manage contracts. The platform also includes an MCP-powered AI assistant for hiring intelligence, a contract generator with legally styled clauses, and a full admin panel for user, content, ticket, and workspace management.

The product ships as a responsive web app and an Android build via Capacitor.

## Architecture

The repository is a monorepo with two main surfaces:

- **Frontend** — `src/` is a React 19 single-page application built with Vite 8, React Router 7, and Tailwind CSS v4. It uses React Context for auth and package state, and a custom design system for theming, typography, and icons.
- **Backend** — `apps/server/` is a Hono-based HTTP API. Each domain (auth, contracts, packages, AI, wallets, etc.) lives in its own module with routes, schemas, and services. Zod validates requests; JWT handles authentication; CORS and rate limiting are applied at the edge.

The frontend talks to the backend through a typed `apiFetch` wrapper in `src/lib/api.ts`. Shared types are imported from `@adminhub/shared`.

### Data flow

1. AuthContext manages session state, token storage, and OTP/password login flows.
2. Pages consume translation objects from `src/i18n.ts` and switch direction (`ltr`/`rtl`) based on the selected language.
3. Protected routes enforce role-based access (`employer`, `admin`, `super_admin`).
4. The backend returns normalized payloads; the frontend unwraps lists and items before rendering.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, TypeScript 5.7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Hono, Zod, JWT |
| Database | PostgreSQL (via schema in `apps/server/src/db/`) |
| AI | OpenRouter / OpenAI / Anthropic providers |
| Mobile | Capacitor (Android) |
| Testing | Playwright (E2E) |
| Formatting | `oxfmt` |

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
A five-step wizard (Parties → Scope → Payment → Terms → Review) produces a styled service agreement. It supports termination clauses, substitution and insurance terms, payment schedules, and downloadable contract files.

### AI assistant
An MCP-connected chat interface provides hiring intelligence for employers and career guidance for admins. It supports multiple model providers and conversation management.

### Admin panel
Super admins manage users, moderate stories/blogs/comments, triage support tickets, and oversee workspace cases, tasks, events, and time logs. Admins manage their own portfolios and packages.

### Mobile
The web shell is wrapped with Capacitor for Android. The UI is responsive by default, with a dedicated mobile topbar and collapsible sidebar.

## Prerequisites

- Node.js (see `.mise.toml` for pinned version)
- pnpm
- PostgreSQL (for the backend)
- Optional: Android SDK (for mobile builds)

## Setup

```bash
# Install dependencies
pnpm install

# Start the backend API (port 8787 by default)
pnpm dev:api

# Start the frontend dev server (port 8443 by default)
pnpm dev
```

Open `http://localhost:8443` in your browser.

### Environment variables

Create a `.env` file in the project root for frontend variables:

```
VITE_API_BASE_URL=http://localhost:8787
VITE_AUTH_TOKEN=  # optional; used for demo / CI login
```

Backend variables are defined in `apps/server/src/env.ts` and can be overridden in `apps/server/.env`:

```
NODE_ENV=development
PORT=8787
DATABASE_URL=postgres://postgres:postgres@localhost:5432/adminhub
JWT_ACCESS_SECRET=dev-only-access-secret-change-me
JWT_REFRESH_SECRET=dev-only-refresh-secret-change-me
CORS_ORIGINS=http://localhost:8443,http://localhost:5173
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
```

> **Security note:** The default JWT secrets are for development only. Rotate them before any production deployment.

## Development workflow

- Run `pnpm dev` for the frontend and `pnpm dev:api` for the backend in parallel.
- The frontend reloads on file changes via Vite HMR.
- Use `pnpm format` to format code with `oxfmt`.
- Routes are declared in `src/App.tsx`. Add new pages under `src/pages/` and register them there.
- Backend modules follow the pattern `modules/<name>/<name>.routes.ts`, `<name>.service.ts`, and `<name>.schemas.ts`.

## Testing

End-to-end tests use Playwright:

```bash
pnpm test:e2e
pnpm test:e2e:ui
```

Test specs live alongside the scenarios they cover. The backend does not yet have a dedicated unit-test suite, but each module is small and schema-validated, which keeps behavior predictable.

## Deployment notes

- Build the frontend with `pnpm build`. Output goes to `dist/`.
- The backend is a standard Node.js server. Deploy it behind a reverse proxy with TLS.
- Set production `CORS_ORIGINS` to your actual frontend domain.
- Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values.
- For mobile, run `pnpm build` then `npx cap sync android` before building the APK.

## Project structure

```
src/
  components/
    ai/             — Chat UI, model selector, conversation sidebar
    auth/           — ProtectedRoute
    dashboard/      — EmployerDashboard, AdminDashboard
    layout/         — Sidebar, Topbar, Icon
    platform/       — Stars, MCPConnectorStatus
    ui/             — Badge, Button, Card, Input, Tabs, CommandPalette, ErrorBoundary
  contexts/         — AuthContext, PackageContext, AiContext
  design-system/    — ThemeProvider, tokens
  lib/              — api.ts, mockPackages, types
  pages/            — Marketplace, Contracts, Tickets, AI, Admin pages, etc.
  i18n.ts           — English and Persian translations
  App.tsx           — Routes, layout shell, role-based nav
  main.tsx          — React entrypoint

apps/server/
  src/
    modules/        — auth, contracts, packages, ai, wallets, tickets, etc.
    middleware/     — auth, rate-limit
    lib/            — tokens, sanctum, password, AI providers
    db/             — schema, seed, index
    index.ts        — Hono app bootstrap
```

## Contributing

1. Keep modules small and domain-focused.
2. Add Zod schemas for every new input and response shape.
3. Use `src/i18n.ts` for all user-facing strings; do not hardcode English or Persian text in components.
4. Run `pnpm format` before opening a pull request.
5. If you touch the backend, update or add E2E coverage for the affected flow.

## License

AdminHub21
