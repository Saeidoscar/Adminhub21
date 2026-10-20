/**
 * Builds everything the Electron shell serves:
 *
 *   1. the Next.js app with `output: "standalone"`, compiled against the local
 *      demo API (the base URL is inlined at build time, hence the fixed port)
 *   2. the demo API bundled to a single CommonJS file
 *   3. `app/` — the standalone server plus the static assets it expects
 *
 * Run from `desktop/`:  node prepare.mjs
 */
import { execFileSync } from "node:child_process"
import { cp, mkdir, rm, stat } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "..")
const web = path.join(repo, "apps", "web")

const WEB_PORT = 41730
const API_PORT = 41731

async function exists(target) {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log("[prepare] cleaning")
  await rm(path.join(here, "app"), { recursive: true, force: true })
  await rm(path.join(here, "build"), { recursive: true, force: true })
  await mkdir(path.join(here, "build"), { recursive: true })

  console.log("[prepare] next build (standalone)")
  execFileSync("pnpm", ["--filter", "@adminhub/web", "build"], {
    cwd: repo,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NEXT_STANDALONE: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${WEB_PORT}`,
      NEXT_PUBLIC_DESKTOP_DEMO: "1",
    },
  })

  console.log("[prepare] bundling the demo API")
  const esbuild = require("esbuild")
  await esbuild.build({
    entryPoints: [path.join(repo, "dev", "preview-gateway.mjs")],
    outfile: path.join(here, "build", "demo-api.cjs"),
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    legalComments: "none",
    logLevel: "warning",
  })

  console.log("[prepare] assembling app/")
  const standalone = path.join(web, ".next", "standalone")
  if (!(await exists(standalone))) {
    throw new Error("standalone output missing — did next build run with NEXT_STANDALONE=1?")
  }

  await cp(standalone, path.join(here, "app"), { recursive: true })

  const target = path.join(here, "app", "apps", "web")
  await mkdir(path.join(target, ".next"), { recursive: true })
  await cp(path.join(web, ".next", "static"), path.join(target, ".next", "static"), {
    recursive: true,
  })
  await cp(path.join(web, "public"), path.join(target, "public"), { recursive: true })

  const server = path.join(target, "server.js")
  if (!(await exists(server))) {
    throw new Error(`expected ${server} — the standalone layout changed`)
  }

  console.log("[prepare] done")
}

main().catch((error) => {
  console.error("[prepare] failed:", error)
  process.exit(1)
})
