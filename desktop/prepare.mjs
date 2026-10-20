/**
 * Builds everything the Electron shell serves:
 *
 *   1. a self-contained copy of `apps/web` with a plain npm install — pnpm's
 *      symlinked store produces absolute links in the standalone output, which
 *      would break on a machine that only has the packaged folder
 *   2. the Next.js build with `output: "standalone"`, compiled against the
 *      local demo API (the base URL is inlined at build time)
 *   3. the demo API bundled to a single CommonJS file
 *   4. `runtime/` — the standalone server, its static assets and the demo API
 *
 * The output directory is deliberately *not* called `app/`: electron-builder
 * treats a sibling `app/` folder with a package.json as the two-package.json
 * application root, would look for `app/index.js` and refuse to package.
 *
 * Run from `desktop/`:  node prepare.mjs
 */
import { execFileSync } from "node:child_process"
import { cp, mkdir, rm, stat, writeFile, readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "..")
const web = path.join(repo, "apps", "web")
const buildDir = path.join(here, ".build", "web")
const runtimeDir = path.join(here, "runtime")

const WEB_PORT = 41730
const API_PORT = 41731

const BUILD_ENV = {
  NEXT_STANDALONE: "1",
  NEXT_TRACING_ROOT: buildDir,
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${API_PORT}`,
  NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${WEB_PORT}`,
  NEXT_PUBLIC_DESKTOP_DEMO: "1",
}

const shell = process.platform === "win32"
const npm = shell ? "npm.cmd" : "npm"

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
  await rm(runtimeDir, { recursive: true, force: true })
  await rm(path.join(here, ".build"), { recursive: true, force: true })
  await mkdir(runtimeDir, { recursive: true })
  await mkdir(buildDir, { recursive: true })

  console.log("[prepare] staging the web app")
  for (const entry of [
    "src",
    "public",
    "package.json",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "icon.png",
    "apple-icon.png",
  ]) {
    await cp(path.join(web, entry), path.join(buildDir, entry), { recursive: true })
  }

  // The only workspace dependency is the CSS token package; a relative file
  // dependency keeps the staged tree installable on its own.
  await cp(
    path.join(repo, "packages", "design-tokens"),
    path.join(buildDir, "design-tokens"),
    { recursive: true },
  )

  const manifest = JSON.parse(await readFile(path.join(buildDir, "package.json"), "utf8"))
  manifest.dependencies["@adminhub/design-tokens"] = "file:./design-tokens"
  await writeFile(path.join(buildDir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`)

  console.log("[prepare] npm install (staged)")
  execFileSync(npm, ["install", "--no-audit", "--no-fund"], {
    cwd: buildDir,
    stdio: "inherit",
    shell,
  })

  console.log("[prepare] next build (standalone)")
  execFileSync(npm, ["exec", "--", "next", "build"], {
    cwd: buildDir,
    stdio: "inherit",
    shell,
    env: { ...process.env, ...BUILD_ENV },
  })

  console.log("[prepare] bundling the demo API")
  const esbuild = require("esbuild")
  await esbuild.build({
    entryPoints: [path.join(repo, "dev", "preview-gateway.mjs")],
    outfile: path.join(runtimeDir, "demo-api.cjs"),
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    legalComments: "none",
    logLevel: "warning",
  })

  console.log("[prepare] assembling runtime/")
  const standalone = path.join(buildDir, ".next", "standalone")
  if (!(await exists(path.join(standalone, "server.js")))) {
    throw new Error("standalone output missing — did next build run with NEXT_STANDALONE=1?")
  }

  await cp(standalone, runtimeDir, { recursive: true, dereference: true })
  await cp(
    path.join(buildDir, ".next", "static"),
    path.join(runtimeDir, ".next", "static"),
    { recursive: true },
  )
  await cp(path.join(buildDir, "public"), path.join(runtimeDir, "public"), {
    recursive: true,
  })

  if (!(await exists(path.join(runtimeDir, "server.js")))) {
    throw new Error("runtime/server.js missing after assembly")
  }

  console.log("[prepare] done")
}

main().catch((error) => {
  console.error("[prepare] failed:", error)
  process.exit(1)
})
