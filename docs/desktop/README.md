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

## 5. The assistant is the home screen

The app opens **straight into the conversation**: `/` renders the MCP assistant full height, with the composer,
suggestion cards and the greeting. The dashboard moved to `/dashboard` and is one click away in the sidebar.

The same surface is available as a floating panel on every other screen — identical transport, identical tools,
only the chrome differs.

| | |
| --- | --- |
| Home | `/` — full-height assistant |
| Dashboard | `/dashboard` — the previous landing page |
| Floating panel | `Ctrl+K` anywhere except `/`, the pill at the bottom, or the topbar "Ask the assistant…" button |
| Focus the composer | `Ctrl+K` on `/` |
| Send | `Enter` · newline `Shift+Enter` · previous prompts `↑` |
| Settings | the gear icon, or `Ctrl+,` from the desktop menu |
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

## 7. Signing

The workflow ships **unsigned** binaries by default: the build succeeds, Windows warns once
(*More info → Run anyway*), and a `SHA256SUMS.txt` is published next to each exe so a download can be verified.
That is the intended state for a demo, not an oversight.

### Verify a download

```powershell
Get-FileHash .\AdminHub21-Demo-1.0.0-portable.exe -Algorithm SHA256
Get-AuthenticodeSignature .\AdminHub21-Demo-1.0.0-portable.exe | Format-List Status, SignerCertificate
```

`Status: NotSigned` is expected. Compare the hash with `SHA256SUMS.txt` from the same workflow run — the two
artifacts are produced together, so a mismatch means the file was altered or truncated.

### Which certificate gets rid of the warning

| Option | Cost | Clears SmartScreen for other people? |
| --- | --- | --- |
| Unsigned | €0 | No |
| Self-signed | €0 | **No** — only on machines where you install it as trusted |
| Azure Trusted Signing | ~$10/month | Yes, once identity verification completes |
| OV code-signing (DigiCert/Sectigo/SSL.com) | ~€250–400/yr | Yes, gradually, as reputation builds |
| EV code-signing | ~€400–600/yr | Yes, immediately |

Since 2023, OV/EV private keys may not live in a plain downloadable `.pfx`; CAs keep them in FIPS 140-2 hardware or
a cloud service (DigiCert KeyLocker, SSL.com eSigner, Azure Trusted Signing). Those flows sign through
`win.azureSignOptions` / KeyLocker options in `electron-builder.yml`, not `CSC_LINK`.

CAs run KYC with restricted-party screening. For an Iranian-registered entity, expect a decline — which is why the
default here is unsigned plus checksums.

### Self-signed: for machines you control

`scripts/sign-self-signed.ps1` creates the certificate, exports it, and puts the base64 for `CSC_LINK` on your
clipboard.

```powershell
# 1. create + export (writes adminhub21-demo.pfx / .cer, prints CSC_LINK)
.\scripts\sign-self-signed.ps1

# 2. trust it on this machine (elevated; Root AND TrustedPublisher)
.\scripts\sign-self-signed.ps1 -InstallTrust

# 3. or sign an existing binary immediately
.\scripts\sign-self-signed.ps1 -Sign ".\apps\desktop\release\AdminHub21 Demo.exe"
```

Then add the two repository secrets — **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `CSC_LINK` | the base64 string the script copies to your clipboard |
| `CSC_KEY_PASSWORD` | the `.pfx` password you chose |

`desktop.yml` already passes both to electron-builder, so the next run produces signed binaries. Locally, export
both and run `pnpm desktop:dist`.

Trust is per machine: `Import-Certificate` into `Cert:\LocalMachine\Root` **and**
`Cert:\LocalMachine\TrustedPublisher` (or push both by GPO). Root alone is not enough — Authenticode checks the
signer against TrustedPublisher.

Two things that still bite after trusting the certificate:

- **Mark-of-the-Web.** A browser download is tagged, so SmartScreen still blocks it on a trusted machine. Run
  `Unblock-File .\AdminHub21-Demo-1.0.0-portable.exe`, or copy the file over a share/USB.
- **Reputation is per certificate.** Even a paid OV certificate warns until enough installs accumulate. A
  self-signed one never accrues reputation at all.

### Release notes template

> **Unsigned build.** Windows shows "Windows protected your PC" the first time you run this —
> click *More info* → *Run anyway*. Verify your download against `SHA256SUMS.txt`:
> `Get-FileHash .\AdminHub21-Demo-1.0.0-portable.exe -Algorithm SHA256`

## 8. Security posture

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

## 9. What this demo is not

It is a **walkthrough build**: data lives in memory and resets on launch, there is no auth server, and nothing is
written to Postgres. Contracts, invoices and payments are shown as UI only — the real flows stay in `apps/api`.
