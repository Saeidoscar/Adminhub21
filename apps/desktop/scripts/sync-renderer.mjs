#!/usr/bin/env node
/**
 * Copies the built SPA (`/dist`) into the desktop package and makes it
 * offline-safe.
 *
 * The web build pulls three webfonts from Google Fonts. A desktop demo has to
 * work on a plane, so those `@import` lines are stripped here and the font
 * stacks in `theme.css` already fall back to `system-ui` (Segoe UI on Windows,
 * which also renders Persian acceptably). Nothing else in the CSS references a
 * remote asset.
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const desktopRoot = resolve(here, "..")
const sourceDist = resolve(desktopRoot, "..", "..", "dist")
const target = join(desktopRoot, "renderer")

await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(sourceDist, target, { recursive: true })

const assetsDir = join(target, "assets")
let strippedImports = 0

for (const file of await readdir(assetsDir)) {
  if (!file.endsWith(".css")) continue

  const path = join(assetsDir, file)
  const css = await readFile(path, "utf8")

  // Vite may emit either `@import url("…")` or the minified `@import "…"`, and the
  // URL itself contains `;` inside its weight list — match to the closing quote.
  const cleaned = css.replace(
    /@import\s*(?:url\()?\s*["']?https:\/\/fonts\.googleapis\.com[^"')\s]*["']?\s*\)?\s*;?/g,
    () => {
      strippedImports += 1
      return ""
    },
  )

  await writeFile(path, cleaned, "utf8")
}

// Belt and braces: the HTML shell should not pre-connect either.
const indexPath = join(target, "index.html")

if (
  await readFile(indexPath, "utf8")
    .then(() => true)
    .catch(() => false)
) {
  const html = await readFile(indexPath, "utf8")
  await writeFile(
    indexPath,
    html.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/g, ""),
    "utf8",
  )
}

console.log(
  `✔ renderer synced → apps/desktop/renderer (${strippedImports} remote font import(s) stripped)`,
)
