# Changelog

All notable changes to AdminHub21 are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-10-19

The first release that is safe to point a paying customer at: the API is green
in CI against PostgreSQL, the release version is discoverable, and the pipeline
that ships it is the same one that tests it.

### Added

- `GET /api/v1/health` now returns the release version alongside the API version.
- Continuous integration on three lanes: frontend formatting, frontend build,
  and the Laravel API suite against a PostgreSQL 16 service container.
- JUnit-based failure reporting on the API lane: every failing test appears as
  its own check annotation.
- `apps/api/.env.example`, complete enough to boot the API from a clean checkout.
- An architecture record for the public-surface and rendering strategy in
  `docs/architecture/dadline-parity.md`.

### Changed

- The API test suite runs on PostgreSQL in CI while staying on in-memory SQLite
  locally; the CI job overrides the connection through real environment
  variables, which take precedence over `phpunit.xml`.
- Deployment builds `apps/api` instead of the archived Hono server, tags the web
  and API images separately, and passes the Laravel secrets.
- `pnpm format` applied across the repository (106 files had drifted).
- PHPUnit configuration migrated to the PHPUnit 12 schema.

### Fixed

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
