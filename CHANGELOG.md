# Changelog

All notable changes to AdminHub21 are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`docs/operations/docker-demo.md`** — a Persian walkthrough for running the
  whole product locally with Docker: services and ports, demo accounts, the
  seeded dataset, reseeding, rebuilding after a code change, and the fixes for
  the usual problems (port clashes, empty catalogue, permissions, CRLF).
- **A populated Docker demo.** `DemoSeeder` now publishes six marketplace
  listings and generates the PDF for the active contract through
  `GenerateContractPdfAction`, so a fresh `docker compose up` shows a real
  catalogue and a downloadable contract instead of empty states.

### Fixed

- **`docker compose up --build` failed at the SPA image.** The root `Dockerfile`
  ran `npm ci` against a repository that only has a pnpm lockfile; it now uses
  pnpm and copies every workspace manifest, like the Next image does.
- **The SPA's nginx proxied `/api` to the retired Hono backend on `:8787`.**
  Relative API calls now go to the Laravel nginx service.
- **The production compose gave nginx no application code.** It now mounts the
  Laravel tree and the storage volume read-only, so `/api` is not a 404.
- **Shell scripts could be checked out with CRLF on Windows**, which makes the
  PHP entrypoint fail with "exec format error"; `.gitattributes` now forces LF
  for `*.sh`.
- **The Next workspace had no canonical site URL in compose**, so sitemap and
  Open Graph tags pointed at the default. `NEXT_PUBLIC_SITE_URL` is set for the
  local and production stacks.

- **A Windows desktop demo of the whole product.** `desktop/` wraps the
  standalone Next.js build in an Electron shell and starts a bundled demo API
  on `127.0.0.1:41731`; the shell opens the Next server on `:41730`. Every
  surface works offline on seeded data — catalogue, sign-in, contracts (with a
  downloadable PDF), wallet and tickets. `desktop/smoke.mjs` exercises the built
  bundle, and `.github/workflows/desktop.yml` produces the NSIS installer and a
  portable `.exe` on `windows-latest`.
- **`dev/demo-contract.ts`** — translates the seeded dataset to the Laravel API
  contract, so both the desktop build and the local preview serve the same
  shapes the app expects (marketplace, auth, contracts, wallet, tickets).
- **A public company surface.** `/about`, `/roadmap`, `/terms` and `/privacy`
  are new pages on the Next.js site: what we sell, how we earn, the phases R0–R5
  with an exit criterion each, the ArvanCloud starting proposal, the operating
  principles and the legal text a buyer expects before paying.
- **`docs/company/`** — the company book: profile, organisation chart, RACI,
  approval gates, one job description per operating role, and a print-ready
  one-pager (`one-pager.html`).
- **`docs/roadmap.md`** — R0 through R5, each with measurable exit criteria, the
  hosting proposal (≈4.48M Toman/month to start), and an explicit non-goals list.
- **`.opencompany/skills/`** — seven importable skills (ticket triage, listing
  review, release checklist, wallet reconciliation, growth report, competitor
  scan, daily brief) plus `docs/operations/opencompany.md` and
  `docs/company/hiring-briefs.md` for standing up an AI back office under human
  approval gates.
- **Identity assets.** `icon.svg`, `icon.png`, `apple-icon.png`,
  `manifest.webmanifest`, a generated `og.png`, and Organization + WebSite
  JSON-LD in the root layout.
- **`dev/preview-gateway.mjs`** — adapts the seeded demo dataset to the Laravel
  marketplace contract so the public site can be presented without a backend.

### Changed

- The header and footer now link About, Roadmap and the legal pages; the sitemap
  lists them with their own priorities.
- Package cards say "بسته‌ی جدید" instead of "۰ فروش", and the package page
  hides empty sales/views counters.
- Demo package titles, descriptions and delivery times are Persian, and the
  marketplace preview shows named specialists instead of a single owner.
- `dev/demo-api-handler.ts` imports `./demo-data.ts` explicitly so the handler
  also runs under Node's type stripping outside Vite.
- The sign-in page pre-fills demo credentials only when the desktop build sets
  `NEXT_PUBLIC_DESKTOP_DEMO=1`, and only marks the cookie `Secure` on https
  deployments — `http://127.0.0.1` would otherwise drop it.

## [1.0.0] — 2026-10-19

The first release that is safe to point a paying customer at: the API is green
in CI against PostgreSQL, the release version is discoverable, and the pipeline
that ships it is the same one that tests it.

### Added

- **A one-command stack.** `docker compose up --build` now waits for
  PostgreSQL, applies the migrations, links the media directory and seeds the
  demo dataset before php-fpm starts. `DemoSeeder` creates an employer with a
  funded wallet, two contracts and a support thread, plus two active payment
  gateways; every seeder is idempotent, so restarts do not duplicate rows.
- **A Next.js workspace image** (`apps/web/Dockerfile`) and a `workspace`
  compose service on `:3000`, so the surface that owns `/app/*` is part of the
  stack rather than a separate `pnpm dev` command.
- `MediaService` and `config/media.php`: `MEDIA_DISK` chooses where uploads are
  written and `MEDIA_URL` chooses the origin they are served from. Avatars,
  portfolio files, attachments and contract PDFs all go through it, and nginx
  serves `/storage` locally.
- **Contracts in the new workspace shell.** `/app/contracts` lists the caller's
  contracts with status filters and pagination, `/app/contracts/{id}` shows the
  parties, amount, clauses, signatures and the actions allowed _in that state_,
  and `/app/contracts/new` creates a draft by resolving the counterparty from an
  exact email address.
- Contract lifecycle over HTTP: `POST /contracts/{id}/{sign,activate,complete,cancel,review}`.
  These methods existed in the controller with no routes, so a contract could
  never leave `draft`. A `ContractLifecycle` service owns the transitions and
  refuses invalid ones with `422` and a reason.
- `GET /api/v1/users/lookup?email=` resolves a counterparty by exact address (no
  directory, no listing).
- **Wallet in the workspace shell.** `/app/wallet` shows the three balances
  (total, withdrawable, blocked), the statement with pagination, and separate
  tabs for topping up through a payment gateway, withdrawing, and transferring to
  another user by exact email address.
- **Tickets in the workspace shell.** `/app/tickets` lists the caller's requests
  with status filters, `/app/tickets/{id}` renders the thread and accepts a
  reply, and `/app/tickets/new` opens a ticket with a priority. Support agents
  additionally see internal notes and their author; requesters never receive
  them from the API at all.
- `GET /api/v1/health` now returns the release version alongside the API version.
- Continuous integration on three lanes: frontend formatting, frontend build,
  and the Laravel API suite against a PostgreSQL 16 service container.
- JUnit-based failure reporting on the API lane: every failing test appears as
  its own check annotation.
- `apps/api/.env.example`, complete enough to boot the API from a clean checkout.
- An architecture record for the public-surface and rendering strategy in
  `docs/architecture/dadline-parity.md`.

### Changed

- **The Vite workspace no longer implements contracts, wallet or tickets.**
  `/contracts` and `/tickets` render a hand-off component that forwards to
  `/app/contracts` and `/app/tickets` on the Next.js surface, so there is one
  authenticated prefix and one implementation per module. The contract
  generator, contract detail view, wallet page and their domain helpers were
  removed with the routes.
- The API image builds on PHP 8.4 (matching CI) and installs its own Composer
  dependencies, so a fresh clone no longer needs a host `vendor/` directory.
- The API test suite runs on PostgreSQL in CI while staying on in-memory SQLite
  locally; the CI job overrides the connection through real environment
  variables, which take precedence over `phpunit.xml`.
- Deployment builds `apps/api` instead of the archived Hono server, tags the web
  and API images separately, and passes the Laravel secrets.
- `pnpm format` applied across the repository (106 files had drifted).
- PHPUnit configuration migrated to the PHPUnit 12 schema.

### Fixed

- The first signature did not move a contract out of `draft`, and the contracts
  index grouped its ownership check ambiguously (`where(...)->orWhere(...)`), so a
  later scope could have widened it.

- **Every detail endpoint bound no model.** 48 routes declared `{id}` while the
  controllers asked for a type-hinted model, so Laravel's implicit binding never
  ran: a blank model reached the action and authorization was evaluated against
  nothing. Contracts, offers, cases, tickets, packages, reviews, portfolio items
  and content moderation were all affected.
- **Tickets could not be created.** `TicketPriority` used `normal` while the
  database check constraint, the frontend types and the validation schema all use
  `medium`; no value satisfied both.
- **Reviews could not be created.** The controller authorized `create` against
  the `Contract` instance, resolving `ContractPolicy`, which has no `create()`
  method — every submission returned 403.
- **Ticket creators could not read their own tickets.** `TicketPolicy::view`
  admitted admins only while `update` already allowed the participants.
- **Replying to any ticket failed with a 500.** `TicketService` wrote
  `tickets.last_message_at` on every message, but no migration ever created that
  column.
- **The ticket status enum disagreed with the schema.** `answered`, `referred`
  and `pending` existed only in PHP; the database constraint, the TypeScript
  types and the filters all use `open`, `in_progress`, `resolved` and `closed`.
- **`POST /wallet/deposit` credited the balance synchronously**, so anyone who
  could reach the endpoint could mint money without paying. It now starts a
  pending gateway payment, and only the signed callback settles it.
- **`App\Models\PaymentGateway` did not exist**, though two classes referenced
  it, so every `/payments` request was a fatal error. The gateway list also
  serialised each row's `config`, including credentials; the API now returns
  only `id`, `code`, `name` and `provider`.
- **Insufficient funds returned 500** instead of a client error. Withdrawals and
  transfers now answer `422` with a readable message.
- **A ticket's requester could see internal notes** and could set `priority` and
  `assigned_to`. Internal notes are filtered out server-side for non-staff, and
  staff-only fields are rejected for requesters, who may still close their own
  ticket.
- **The tickets index was not scoped to a group.** `where(...)->orWhere(...)`
  evaluated without grouping, so a status filter could widen it.
- **The wallet transfer endpoint crashed with a 500.** It called
  `$request->validated()`, which only exists on a `FormRequest`.
- **Reply timestamps were silently discarded.** `Ticket::last_message_at` was
  missing from `$fillable`, so the column never moved.
- **`UserSeeder` could not run twice.** It used `create()` on a unique email;
  the seeders now use `updateOrCreate()` throughout.
- Migrations failed on PostgreSQL: `affiliate_commissions.referral_id` inferred a
  `referrals` table that does not exist, and `admin_profiles` was created before
  the `attachments` table it references.
- `bootstrap/cache` was missing from fresh checkouts (git does not store empty
  directories), aborting `composer install` in its `post-autoload-dump` script.
- `OfficeCase` rows were inserted without the non-null `uuid` column.
- Several test fixtures referenced users that were never inserted, reused a
  single phone number across a unique column, and passed header names as server
  variables so the payment-callback middleware never saw them.

### Removed

- The duplicated `ci-cd.yml` workflow, whose PHP version, static analysis and
  deploy steps contradicted `ci.yml` and `deploy.yml`.

[1.0.0]: https://github.com/Saeidoscar/Adminhub21/releases/tag/v1.0.0
