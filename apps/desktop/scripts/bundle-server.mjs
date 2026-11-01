#!/usr/bin/env node
/**
 * Prepares the Electron main process' dependencies:
 *
 *  1. stages the app icons where electron-builder looks for them
 *     (`build/icon.ico`, `build/icon.png`),
 *  2. bundles the demo server (TypeScript, sharing the web demo dataset) into a
 *     single CommonJS file the main process can `require()`.
 *
 * One file, no node_modules at runtime: the packaged app only ships
 * `build/server.cjs` plus the Electron runtime.
 */
import { copyFile, mkdir } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "..")

await mkdir(join(root, "build"), { recursive: true })

for (const icon of ["icon.ico", "icon.png"]) {
  await copyFile(join(root, "assets", icon), join(root, "build", icon))
}

console.log("✔ icons staged → build/icon.ico, build/icon.png")

let esbuild

try {
  esbuild = await import("esbuild")
} catch {
  console.error(
    [
      "✖ esbuild is not installed.",
      "",
      "  Run this from the repository root first:",
      "    pnpm desktop:install      (or: npm --prefix apps/desktop install)",
      "",
      "  The desktop shell keeps its own npm install because electron and",
      "  electron-builder are ~300 MB and are excluded from the pnpm workspace.",
    ].join("\n"),
  )
  process.exit(1)
}

await esbuild.build({
  entryPoints: [join(root, "server", "index.ts")],
  outfile: join(root, "build", "server.cjs"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: false,
  minify: false,
  legalComments: "none",
  logLevel: "info",
  // Electron provides these at runtime; never bundle them.
  external: ["electron"],
})

console.log("✔ server bundled → build/server.cjs")
