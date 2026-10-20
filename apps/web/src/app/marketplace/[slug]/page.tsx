import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getPackage, listPackages } from "@/lib/api"
import { SITE } from "@/lib/site"

type Params = Promise<{ slug: string }>

export const revalidate = 60

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackage(slug)

  if (!pkg) {
    return { title: "بسته پیدا نشد", robots: { index: false, follow: false } }
  }

  const title = pkg.title
  const description = pkg.description?.slice(0, 155) ?? `${pkg.title} در ${SITE.name}`

  return {
    title,
    description,
    alternates: { canonical: `/marketplace/${pkg.slug ?? pkg.id}` },
    openGraph: { title, description, type: "website", locale: SITE.locale },
  }
}

export default async function PackagePage({ params }: { params: Params }) {
  const { slug } = await params
  const pkg = await getPackage(slug)

  if (!pkg) notFound()

  const related = (await listPackages({ sort: "popular" })).data
    .filter((item) => item.id !== pkg.id)
    .slice(0, 3)

  const price = Number(pkg.price)
  const features = pkg.features ?? []

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    description: pkg.description ?? undefined,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: pkg.currency,
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        // Structured data is what lets the product surface be indexed as a product.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="مسیر" className="text-xs text-muted">
        <Link href="/" className="hover:text-foreground">
          خانه
        </Link>{" "}
        /{" "}
        <Link href="/marketplace" className="hover:text-foreground">
          بازار
        </Link>{" "}
        / {pkg.title}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <article>
          <h1 className="text-3xl font-extrabold leading-snug text-foreground">{pkg.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="rounded-md bg-emerald/10 px-2 py-1 text-xs font-bold text-emerald">
              تأییدشده
            </span>
            <span>ارائه‌دهنده: {pkg.user?.name ?? "متخصص"}</span>
            {Number(pkg.sales ?? 0) > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{Number(pkg.sales).toLocaleString("fa-IR")} فروش</span>
              </>
            )}
            {Number(pkg.views ?? 0) > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{Number(pkg.views).toLocaleString("fa-IR")} بازدید</span>
              </>
            )}
          </p>

          <section className="mt-8" aria-labelledby="about">
            <h2 id="about" className="text-lg font-bold text-foreground">
              درباره این بسته
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-8 text-muted">
              {pkg.description ?? "توضیحی ثبت نشده است."}
            </p>
          </section>

          {features.length > 0 && (
            <section className="mt-8" aria-labelledby="features">
              <h2 id="features" className="text-lg font-bold text-foreground">
                این بسته شامل
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground"
                  >
                    <span className="mt-0.5 text-emerald" aria-hidden>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <p className="text-sm text-muted">قیمت</p>
          <p className="mt-1 text-3xl font-extrabold text-navy">
            {price.toLocaleString("fa-IR")}{" "}
            <span className="text-base font-bold">{pkg.currency}</span>
          </p>

          <Link
            href={`/sign-in?redirectUrl=${encodeURIComponent(`/app/marketplace/${pkg.slug ?? pkg.id}`)}`}
            className="mt-6 block rounded-xl bg-navy px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-navy-light"
          >
            سفارش این بسته
          </Link>
          <Link
            href="/marketplace"
            className="mt-2 block rounded-xl border border-border px-5 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-subtle"
          >
            بازگشت به بازار
          </Link>

          <p className="mt-4 text-xs leading-6 text-muted">
            پرداخت از کیف پول انجام می‌شود و پس از تأیید، قرارداد الکترونیکی برای هر دو طرف صادر
            می‌شود.
          </p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-lg font-bold text-foreground">
            بسته‌های مرتبط
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/marketplace/${item.slug ?? item.id}`}
                  className="block rounded-2xl border border-border bg-card p-5 transition hover:border-navy/30"
                >
                  <h3 className="line-clamp-2 font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm font-extrabold text-navy">
                    {Number(item.price).toLocaleString("fa-IR")} {item.currency}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
