import { readFile } from "node:fs/promises"
import path from "node:path"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تغییرات",
  description: "تاریخ انتشار نسخه‌های AdminHub21 و تغییرات هر نسخه.",
  alternates: { canonical: "/changelog" },
}

// Rendered from the repository's CHANGELOG.md so the public release history and
// the engineering record cannot drift apart.
export const dynamic = "force-dynamic"

async function readChangelog(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "..", "..", "CHANGELOG.md"),
    path.join(process.cwd(), "CHANGELOG.md"),
  ]

  for (const candidate of candidates) {
    try {
      // turbopackIgnore: the path is resolved at runtime, outside the bundle.
      return await readFile(/* turbopackIgnore: true */ candidate, "utf8")
    } catch {
      continue
    }
  }

  return "# Changelog\n\nCHANGELOG.md پیدا نشد."
}

function render(lines: string[]) {
  return lines.map((line, index) => {
    const key = `${index}-${line.slice(0, 12)}`

    if (line.startsWith("## ")) {
      return (
        <h2
          key={key}
          className="mt-10 border-b border-border pb-2 text-xl font-extrabold text-foreground"
        >
          {line.replace("## ", "")}
        </h2>
      )
    }

    if (line.startsWith("### ")) {
      return (
        <h3 key={key} className="mt-6 text-base font-bold text-navy">
          {line.replace("### ", "")}
        </h3>
      )
    }

    if (line.startsWith("- ")) {
      return (
        <li key={key} className="ms-5 list-disc text-sm leading-7 text-muted">
          {line.replace("- ", "")}
        </li>
      )
    }

    if (line.trim() === "") return null

    return (
      <p key={key} className="mt-3 text-sm leading-7 text-muted">
        {line}
      </p>
    )
  })
}

export default async function ChangelogPage() {
  const markdown = await readChangelog()
  const lines = markdown
    .split("\n")
    .filter((line) => !line.startsWith("# ") && !line.startsWith("[1.0.0]:"))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-foreground">تغییرات</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        هر نسخه با همین فایل و همان تگ گیت منتشر می‌شود؛ نسخه از{" "}
        <code className="font-mono">/api/v1/health</code> هم قابل خواندن است.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">{render(lines)}</div>
    </div>
  )
}
