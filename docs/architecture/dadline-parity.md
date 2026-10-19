# AdminHub21 1.0 — architectural parity with dadline.net

Status: **draft for review** · Owner: platform · Last evidence capture: 2026-10-19

This document records what could be **observed** about dadline.net's engineering
architecture, maps it onto AdminHub21, and defines what "1.0.0" means for this
repository. It deliberately separates *evidence* from *inference* so the parity
claims can be re-checked.

> Scope note: only the public surface was inspected. The private dadline
> repository was **not** available to this analysis (see §7, D1). Nothing here is
> copied source; these are architectural patterns, re-implemented for a different
> product and domain.

---

## 1. Method

1. Enumerated the public route surface from `/sitemap.xml` and its per-entity
   sitemaps.
2. Read the home, catalogue (`/lawyer`), contract and Q&A hubs to recover the
   information architecture and the trust/verification model.
3. Followed the unauthenticated entry to the workspace (`/pishkhan`) to observe
   the auth boundary.
4. Compared the findings against the current AdminHub21 tree, measured directly
   from the repository (counts in §4).

Framework fingerprints (`/_next/image`, `_next` asset paths) establish that
dadline is a Next.js application. Everything else below is inferred from
behaviour and URL structure, not from source.

---

## 2. Observed principles

### P1 — Two surfaces, one backend
The site is split into a **public, crawlable surface** (`/lawyer`, `/questions`,
`/contracts`, `/pricing`, `/knowledge-base`, …) and an **authenticated
workspace** under `/pishkhan/*`. Hitting the workspace unauthenticated redirects
to `/sign-in?redirectUrl=%2Fpishkhan`, i.e. the auth boundary is a route guard that
preserves the intended destination.

### P2 — Server-rendered public pages
Public pages are rendered server-side and image-optimized (`/_next/image?url=…&w=…&q=…`).
This is what makes per-entity pages indexable and fast on first paint.

### P3 — Entity-first URLs, one sitemap per entity
Sitemaps are partitioned by entity type: `pages`, `posts`, `stories`, `taxonomies`,
`lawyers`, `experts`, `products`, `questions`, `knowledge-base`. Detail pages use
human-readable slugs (`/lawyer/seyyede-rezvan-saedi`,
`/questions/category/family`), not numeric ids.

### P4 — Taxonomy is the discovery engine
Catalogue pages expose faceted filtering by **category × province × city** plus an
"online only" toggle. Categories are a first-class, URL-addressable resource
(`/questions/category/:slug`), not a client-side filter.

### P5 — Trust is a product feature
Expert cards carry verification level (e.g. "وکیل پایه یک مرکز وکلای قوه قضائیه"),
rating, review count, city, response recency, and specialty chips. Trust signals are
rendered *on the card*, before the profile is opened.

### P6 — Productized services with public pricing
Capabilities are packaged as named services (`/calls`, `/contracts`, `/case`,
`/my-lawyer`, `/document`, `/judicial-services`) and priced publicly (`/pricing`).
Services can be "آماده ارائه خدمت" (available) or not — availability is modelled, not assumed.

### P7 — Content is inventory
A knowledge base, a contract/document bank (`/document?type=contract`), Q&A threads,
"judicial experiences" stories and a blog are part of the product surface, and each
is an entity in the sitemap. Content is how the public surface earns traffic.

### P8 — Media lives off-origin
User uploads are served from `cdn.dadline.net` with stable, unguessable keys
(`users/1332/avatars/<uuid>.webp`), separate from the application origin.

### P9 — Release hygiene is public
`/changelog` is a public route. Versioning is treated as user-facing information.

---

## 3. Mapping to AdminHub21

AdminHub21 is a different product (editor/tool/vibe-coder marketplace + contracts +
offices/cases) but the same **shape**: two-sided marketplace, expert profiles, priced
packages, contracts with signature, tickets, wallets, and an admin back office.

| # | dadline principle | AdminHub21 today | Verdict |
|---|---|---|---|
| P1 | public surface + `/pishkhan` workspace | all 21 routes sit behind `ProtectedRoute`; no public pages | **missing** |
| P2 | SSR public pages | Vite SPA, client-rendered, `index.html` still carries the scaffold placeholder `lang="<!-- figma:lang -->"` | **missing** |
| P3 | entity slugs + per-entity sitemaps | numeric ids (`/admin/:adminId`), no sitemap, no robots.txt | **missing** |
| P4 | taxonomy facets | categories/levels exist in the data model, but there is no URL-addressable taxonomy or faceted catalogue | **partial** |
| P5 | trust on the card | `AdminProfile.verified_at`, reviews, ratings exist; cards render skills/city | **partial** |
| P6 | productized services + public pricing | `/packages`, `/compare` exist — but behind auth | **partial** |
| P7 | content as inventory | none (no blog, KB, Q&A, document bank) | **missing** |
| P8 | off-origin CDN media | local/`storage` uploads | **partial** |
| P9 | public changelog | none; version is only in `package.json` | **missing** |

### Repository baseline (measured)

| layer | today |
|---|---|
| API routes | 186 across 19 versioned route files |
| Controllers / Actions / Resources / Policies | 22 / 66 / 23 / 9 |
| Models / Migrations | 55 / 47 |
| Frontend pages / components | 18 / 28 |
| API client modules | 16 |
| PHPUnit tests | 7 files, last CI run **24 passed / 10 failed** |
| Playwright specs | 4 |
| CI | `frontend-format` ✅, `frontend-build` ✅, `api-tests` ❌ |

**Conclusion:** AdminHub21 does not lack an application — it already has one. What
it lacks, relative to dadline, is (a) a **public acquisition surface**, and (b) a
**release spine** (green pipeline, version, changelog, deployable artifact).

---

## 4. Definition of "1.0.0"

A version we can point a paying customer at:

1. `api-tests` is green on `main` and the 10 known failures are either fixed or
   explicitly waived with a recorded decision.
2. The public surface exists and is indexable: `/`, service pages, catalogue with
   facets, entity detail pages with slugs, `sitemap.xml`, `robots.txt`, correct
   `<html lang dir>`, per-page title/description/OG tags.
3. The workspace is explicit: authenticated routes live under a single prefix and
   unauthenticated deep links round-trip through sign-in.
4. One command boots the stack against real Postgres/Redis, and one documented
   command seeds a demo tenant.
5. Version is declared once and propagated (`/health` returns it), `CHANGELOG.md`
   has a `1.0.0` entry, and a git tag matches.
6. Media is served from a configurable CDN origin; no user files are served from
   the app container in production.
7. A public `/changelog` route exists.

Explicit non-goals for 1.0: real payment-gateway certification, native mobile
release, multi-region deployment, and full content-team tooling.

---

## 5. Proposed milestones

| milestone | outcome | blocks |
|---|---|---|
| **M0 — release spine** | fix/waive the 10 API failures, green CI, version endpoint, `CHANGELOG.md`, tag | everything |
| **M1 — public shell** | public layout + routing split, SEO head, `sitemap.xml`, `robots.txt` | P1, P2, P3 |
| **M2 — catalogue** | slug-based entity pages, URL-addressable taxonomy facets, trust cards | P3, P4, P5 |
| **M3 — commerce** | public pricing, checkout hand-off into the workspace | P6 |
| **M4 — content** | document bank + KB entities, public changelog | P7, P9 |
| **M5 — ops** | CDN-backed media, seed command, deploy runbook | P8, DoD-4/6 |

M0 is a prerequisite: shipping a 1.0 on a red pipeline is not a 1.0.

---

## 6. Open technical decisions

### D1 — Private dadline repository access
The GitHub connection attached to this workspace can only see three public
repositories under `Saeidoscar`. The private dadline repository is **not** visible,
so P1–P9 above are derived from the public site only. Granting the app access to
that repository would let us verify the backend layering (modules, DTOs, queue and
event conventions, caching) that the public surface cannot reveal.

### D2 — Rendering strategy (the fork in the road)
dadline's SEO advantage comes from server rendering (P2). Options:

- **A. Adopt Next.js** for the public surface only, keep the Vite SPA for the
  workspace. Highest parity, highest migration cost, two build pipelines.
- **B. Migrate the whole frontend to Next.js.** Single framework, but rewrites
  routing, auth state and 18 pages.
- **C. Stay on Vite and pre-render** the public routes at build time (SSG) with a
  small prerender step, server-rendering entity pages later. Lowest cost, weakest
  parity for long-tail entity pages.

Recommendation: **A**, because it preserves the working workspace while matching
dadline's actual split (public SSR + app shell).

### D3 — Taxonomy ownership
Whether the catalogue taxonomy lives in the database (`OfficeTaxonomy`, `Option`)
or in configuration. dadline treats it as a resource with slugs, which argues for
database-backed taxonomy with cached read models.

---

## 7. Next step

M0 is unambiguous and can start immediately. D2 must be decided before M1 because
it determines where the public surface lives.
