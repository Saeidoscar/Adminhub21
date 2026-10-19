# Changelog

All notable changes to AdminHub21 are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  parties, amount, clauses, signatures and the actions allowed *in that state*,
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
