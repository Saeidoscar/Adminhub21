import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type Params = Promise<{ rest: string[] }>

/**
 * Any workspace deep link that has not been migrated yet still respects the auth
 * boundary: an anonymous visitor is sent to sign-in and comes back to exactly
 * this path afterwards (the same contract dadline's /pishkhan uses).
 */
export default async function WorkspaceCatchAll({ params }: { params: Params }) {
  const { rest } = await params
  const path = `/app/${(rest ?? []).join("/")}`
  const token = (await cookies()).get("ah_token")?.value

  if (!token) {
    redirect(`/sign-in?redirectUrl=${encodeURIComponent(path)}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-bold text-amber">در حال انتقال</p>
      <h1 className="mt-2 text-2xl font-extrabold text-foreground">
        این بخش هنوز به میزکار جدید منتقل نشده
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        مسیر <code className="font-mono text-xs">{path}</code> در اپ فعلی فعال است. این صفحه پس از
        انتقال همان ماژول جایگزین می‌شود.
      </p>
    </div>
  )
}
