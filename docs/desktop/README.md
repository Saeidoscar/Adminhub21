# AdminHub21 Demo — Windows desktop build

A self-contained `.exe` that runs the marketplace UI offline, with an **MCP chat bar** wired to the same
free-tier models the API can use.

- **No database, no PHP, no Docker.** The UI is served from a tiny local server bundled into the app.
- **Works with no internet.** Without an API key the assistant answers from the bundled dataset.
- **Add a key and it goes live.** Same gateway and same free-tier allow-list as `apps/api`.

```
apps/desktop/
├── electron/
│   ├── main.mjs              window, local server bootstrap, menu, security policy
│   └── preload.cjs           the only bridge the renderer gets (no key, ever)
├── server/
│   ├── index.ts              local HTTP server: static files + SPA fallback
│   ├── api.ts                /api/ai/*, /api/mcp/*  (also mounted by the Vite demo)
│   ├── agent.ts              tool loop, streaming, offline fallback planner
│   ├── ai.ts                 OpenAI-dialect SSE client (fetch, no SDK)
│   ├── tools.ts              12 MCP tools over the shared demo dataset
│   ├── config.ts             model catalogue, budget, PII redaction
│   └── store.ts              encrypted settings in %APPDATA%
├── scripts/                  bundle-server.mjs (server + icons), sync-renderer.mjs
├── assets/                   icon.ico / icon.png (window, taskbar, installer)
└── electron-builder.yml      NSIS installer + portable .exe
```

## 1. Get the .exe

**Option A — download it (no toolchain needed).** Run the `Desktop demo` workflow on GitHub
(*Actions → Desktop demo → Run workflow*). It builds on `windows-latest` and attaches both exes to the run:

```
adminhub21-desktop-windows → AdminHub21-Demo-1.0.0-setup.exe
                             AdminHub21-Demo-1.0.0-portable.exe
```

The portable one is a single file: download, double-click, done.

**Option B — build it yourself.**

Prerequisites: **Node 22+** and a Windows machine.

```powershell
pnpm install          # repo root, installs the web app
pnpm desktop:install  # npm install inside apps/desktop (electron + builder, ~300 MB)
pnpm desktop:dist     # builds the SPA, bundles the server, packages the app
```

Output lands in `apps/desktop/release/`:

| Artifact | What it is |
| --- | --- |
| `AdminHub21-Demo-1.0.0-setup.exe` | NSIS installer, per-user, desktop + start-menu shortcuts |
| `AdminHub21-Demo-1.0.0-portable.exe` | single file, no install — double-click and go |

Both are x64. `pnpm desktop:portable` builds only the portable one, `pnpm desktop:pack` produces an unpacked
folder for a fast smoke test.

> The binaries are **unsigned**, so SmartScreen shows "Windows protected your PC" on first run →
> *More info* → *Run anyway*. To sign, add the `CSC_LINK` / `CSC_KEY_PASSWORD` repository secrets (the workflow
> already passes them through) or set the same variables locally before `desktop:dist`.
>
> Building the exe on Linux/macOS also works when Wine is installed, but the Windows runner is the supported path.

## 2. Run it from source

```powershell
pnpm desktop:install
pnpm desktop:start     # builds everything, then opens the window
```

`desktop:start` runs `vite build` → `esbuild server` → copy renderer → `electron .`.

## 3. Run the same app in a browser

Useful for UI work — it is byte-for-byte the same bundle and the same API handlers:

```bash
pnpm dev:demo          # http://localhost:8443
```

`dev/mcp-api-plugin.ts` mounts `apps/desktop/server/api.ts` into the Vite dev server, so the chat bar behaves
identically in the browser and in the packaged app. Settings for the browser run live in
`.cache/desktop-demo/settings.json` (gitignored).

## 4. Connecting a model

Open the assistant (`Ctrl+K`) → gear icon → paste a LayerCloud API key → **Save key** → **Test connection**.

- The key is encrypted with the OS keychain (`safeStorage`) before it is written to
  `%APPDATA%\AdminHub21 Demo\settings.json`. It never crosses the preload bridge, so the renderer cannot read it.
- Only **free-badge** models from the catalogue are selectable (`apps/desktop/server/config.ts`), and
  `:jailbreak` / `:uncensored` ids are rejected outright.
- A daily token budget (200k) plus a per-request `max_tokens` clamp bounds the spend. Counters reset at midnight
  UTC or from the settings sheet.
- Prompts are redacted (emails, IBANs, cards, Iranian mobiles, 10-digit national IDs/postal codes) before they
  leave the process — the same rules as `apps/api`'s `PromptRedactor`.

Without a key, everything still works: the assistant routes the question to the right MCP tool and streams the
answer from the local dataset, labelled **Demo** instead of **Live**.

## 5. The chat bar

| | |
| --- | --- |
| Open / close | `Ctrl+K`, the floating pill at the bottom, or the topbar "Ask the assistant…" button |
| Send | `Enter` · newline `Shift+Enter` · previous prompts `↑` |
| Settings | `Ctrl+,` or the gear icon |
| Stop | the stop button while a reply streams |

Each assistant turn shows *how* it was produced: which MCP tool ran, how long it took, the exact JSON the tool
returned, token counts, estimated cost, and a badge when identifiers were redacted. Tool results also render a
deep link ("Open marketplace") so the chat is a navigation surface, not a dead end.

Twelve tools ship in the demo — `find-admin`, `list-packages`, `compare-packages`, `suggest-pricing`,
`recommend-team`, `build-brief`, `content-calendar`, `analyze-engagement`, `search-marketplace`, `open-tickets`,
`wallet-summary`, `navigate` — all reading the same in-memory dataset the UI renders, so the assistant cannot
quote a number that is not on screen.

## 6. Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/desktop/health` | liveness + version + tool count |
| GET | `/api/ai/status` | key state (masked), model list, budget, last probe |
| POST | `/api/ai/settings` | `{ apiKey }` or `{ model }` |
| POST | `/api/ai/probe` | one cheap round-trip to validate the key |
| POST | `/api/ai/budget/reset` | zero the day counter |
| GET | `/api/mcp/tools` | MCP tool list with JSON schemas |
| POST | `/api/mcp/chat` | **SSE** stream of agent events |
| POST | `/api/mcp/converse` | same thing, buffered into one JSON reply |
| POST | `/api/ai/redact-check` | shows what the PII filter would strip |
| — | everything else | the demo dataset (`dev/demo-api-handler.ts`) and the SPA |

## 7. Security posture

Applies to the packaged build:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- The local server binds `127.0.0.1` on an ephemeral port and rejects any request whose `Host` is not loopback
  (DNS-rebinding guard).
- Navigation and `window.open` to anything outside `http://127.0.0.1:<port>` are blocked and handed to the OS
  browser instead.
- All device permissions (camera, mic, geolocation, clipboard-read…) are denied.
- Single-instance lock; the server is closed on quit.
- No telemetry, no analytics, no remote fonts — the build strips the Google Fonts `@import` from the CSS and falls
  back to `system-ui` (Segoe UI), so the app is fully offline.

## 8. What this demo is not

It is a **walkthrough build**: data lives in memory and resets on launch, there is no auth server, and nothing is
written to Postgres. Contracts, invoices and payments are shown as UI only — the real flows stay in `apps/api`.
