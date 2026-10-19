import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { apiBaseUrl } from "@/lib/api"

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به حساب AdminHub21",
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{ redirectUrl?: string; error?: string }>

export const dynamic = "force-dynamic"

async function signIn(formData: FormData) {
  "use server"

  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const redirectUrl = String(formData.get("redirectUrl") ?? "/app")
  const safeRedirect = redirectUrl.startsWith("/") ? redirectUrl : "/app"

  try {
    const response = await fetch(`${apiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    })

    if (!response.ok) {
      redirect(`/sign-in?error=credentials&redirectUrl=${encodeURIComponent(safeRedirect)}`)
    }

    const payload = (await response.json()) as {
      token?: string
      access_token?: string
    }
    const token = payload.token ?? payload.access_token

    if (!token) {
      redirect(`/sign-in?error=credentials&redirectUrl=${encodeURIComponent(safeRedirect)}`)
    }

    const { cookies } = await import("next/headers")
    ;(await cookies()).set("ah_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error
    redirect(`/sign-in?error=unreachable&redirectUrl=${encodeURIComponent(safeRedirect)}`)
  }

  redirect(safeRedirect)
}

const ERRORS: Record<string, string> = {
  credentials: "ایمیل یا گذرواژه درست نیست.",
  unreachable: "ارتباط با سرویس برقرار نشد. کمی بعد دوباره تلاش کنید.",
}

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { redirectUrl = "/app", error } = await searchParams
  const message = error ? ERRORS[error] : undefined

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">ورود به AdminHub21</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          برای ادامه، وارد حساب خود شوید. پس از ورود به همان صفحه‌ای برمی‌گردید که قصدش را داشتید.
        </p>

        {message && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-rose/30 bg-rose/10 p-3 text-sm text-rose"
          >
            {message}
          </p>
        )}

        <form action={signIn} className="mt-8 space-y-4">
          <input type="hidden" name="redirectUrl" value={redirectUrl} />

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              گذرواژه
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-navy"
            />
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-navy text-sm font-bold text-white transition hover:bg-navy-light"
          >
            ورود
          </button>
        </form>

        <p className="mt-4 text-xs text-muted">
          حساب ندارید؟{" "}
          <Link href="/marketplace" className="font-semibold text-navy hover:underline">
            بازار را ببینید
          </Link>{" "}
          و از همان‌جا شروع کنید.
        </p>
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-bold text-foreground">بعد از ورود</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted">
          {[
            "سفارش‌ها و قراردادها را پیگیری کنید",
            "کیف پول و تسویه‌ها را ببینید",
            "بسته‌های خودتان را منتشر کنید",
            "با تیم‌تان در میزکار مشترک کار کنید",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-6 text-muted">
          ورود از مسیر امن انجام می‌شود و توکن فقط در کوکی httpOnly ذخیره می‌شود، نه در localStorage.
        </p>
      </aside>
    </div>
  )
}
