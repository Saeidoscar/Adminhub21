import { useEffect } from "react"

/**
 * Hand-off from the legacy Vite workspace to the Next.js one.
 *
 * The contracts, wallet and tickets modules now live under `/app/*` in
 * `apps/web`. Rather than keeping two implementations, the old URL renders this
 * bridge, which forwards the visitor (deep links included) to the new surface.
 */
export function workspaceUrl(): string {
  const base = import.meta.env.VITE_WORKSPACE_URL?.trim() || "http://localhost:3000"
  return base.replace(/\/+$/, "")
}

export function WorkspaceHandoff({ path, title }: { path: string; title: string }) {
  const target = `${workspaceUrl()}${path}`

  useEffect(() => {
    window.location.replace(target)
  }, [target])

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">AdminHub21</p>
      <h1 className="mt-3 text-2xl font-extrabold text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        این بخش به میزکار جدید منتقل شده است. اگر به‌صورت خودکار منتقل نشدید، از پیوند زیر استفاده
        کنید.
      </p>
      <a
        href={target}
        className="mt-6 inline-block rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white"
      >
        رفتن به میزکار جدید
      </a>
    </div>
  )
}
