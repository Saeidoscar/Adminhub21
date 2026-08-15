import type { Metadata } from "next"
import parse from "html-react-parser"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  TbArrowRight,
  TbClock,
  TbDownload,
  TbEye,
  TbFileText,
  TbShieldCheck,
} from "react-icons/tb"
import sanitizeHtml from "sanitize-html"
import {
  getProductBySlug,
  getProducts,
} from "@/server/actions/products/getProducts"
import {
  productTypeLabel,
  type ProductListItem,
} from "@/server/actions/products/products.types"
import PublicViewTracker from "../../_shared/PublicViewTracker"
import VendorAvatar from "../_components/VendorAvatar"
import DocumentCard from "../_components/DocumentCard"
import ShareButton from "./_components/ShareButton"

type Props = { params: Promise<{ slug: string }> }

const formatPrice = (price: number): string =>
  `${price.toLocaleString("fa-IR")} تومان`

const formatDate = (date: string | null): string =>
  date
    ? new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date))
    : "—"

const documentListHref = (product: ProductListItem): string => {
  const query = new URLSearchParams({ type: product.type })
  if (product.category) query.set("category", product.category.slug)

  return `/document?${query.toString()}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductBySlug(slug)

  if (!result.product) {
    return { title: "سند یافت نشد | دادلاین" }
  }

  return {
    title: `${result.product.title} | بانک مستندات حقوقی دادلاین`,
    description: result.product.description
      ? sanitizeHtml(result.product.description, {
          allowedTags: [],
          allowedAttributes: {},
        })
      : result.product.title,
  }
}

const DocumentDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const result = await getProductBySlug(slug)

  if (result.notFound) notFound()
  if (!result.product) {
    throw new Error(result.error ?? "دریافت اطلاعات محصول ناموفق بود.")
  }

  const product = result.product
  const sanitizedDescription = product.description
    ? sanitizeHtml(product.description, {
        allowedTags: [
          ...sanitizeHtml.defaults.allowedTags,
          "figure",
          "figcaption",
          "img",
        ],
        allowedAttributes: {
          "*": ["dir", "lang", "title"],
          a: ["href", "target", "rel"],
          img: ["src", "alt", "title", "width", "height", "loading"],
          td: ["colspan", "rowspan"],
          th: ["colspan", "rowspan", "scope"],
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        transformTags: {
          a: sanitizeHtml.simpleTransform("a", {
            rel: "nofollow noopener noreferrer",
          }),
          img: sanitizeHtml.simpleTransform("img", {
            loading: "lazy",
          }),
        },
      }).trim()
    : ""
  const typeLabel = productTypeLabel(product.type)
  const vendorName = product.vendor?.name || "دادلاین"
  const vendorHref =
    product.vendor?.slug &&
    (product.vendor.type === "lawyer" || product.vendor.type === "expert")
      ? `/${product.vendor.type}/${product.vendor.slug}`
      : null
  const checkoutHref = `/pishkhan/documents/checkout?item_id=${encodeURIComponent(product.slug)}`
  const relatedResult = await getProducts({
    category: product.category?.slug,
    type: product.category ? undefined : product.type,
    perPage: 5,
  })
  const relatedProducts = relatedResult.products
    .filter((relatedProduct) => relatedProduct.slug !== product.slug)
    .slice(0, 4)

  const vendorIdentity = (
    <>
      <VendorAvatar
        name={vendorName}
        avatarUrl={product.vendor?.avatarUrl}
        size={48}
        className="bg-primary/10 text-primary shrink-0"
      />
      <div className="min-w-0">
        <p className="group-hover:text-primary truncate text-sm font-semibold text-gray-900 transition-colors dark:text-white">
          {vendorName}
        </p>
        <p className="truncate text-xs text-gray-400">
          {product.vendor?.role ?? "ناشر حقوقی"}
        </p>
      </div>
    </>
  )

  return (
    <main className="min-h-screen px-4 pt-24 pb-16">
      <PublicViewTracker resource="products" slug={product.slug} />
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            دادلاین
          </Link>
          <TbArrowRight size={13} className="shrink-0 rotate-180" />
          <Link
            href="/document"
            className="hover:text-primary transition-colors"
          >
            بانک مستندات
          </Link>
          <TbArrowRight size={13} className="shrink-0 rotate-180" />
          <Link
            href={documentListHref(product)}
            className="hover:text-primary transition-colors"
          >
            {typeLabel}
          </Link>
          <TbArrowRight size={13} className="shrink-0 rotate-180" />
          <span className="max-w-xs truncate text-gray-900 dark:text-white">
            {product.title}
          </span>
        </nav>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1 text-xs font-medium">
                {typeLabel}
              </span>
              {product.category && (
                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {product.category.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
              {product.title}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </div>
          </div>
          <ShareButton title={product.title} />
        </div>

        <Link
          href={checkoutHref}
          className="bg-primary hover:bg-primary/90 mb-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors lg:hidden"
        >
          <TbDownload size={17} />
          خرید و دانلود سند
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <TbFileText size={18} className="text-primary" />
                  توضیحات
                </h2>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <TbClock size={13} />
                  {formatDate(product.publishedAt)}
                </span>
              </div>

              <div className="wrap-break-word text-[15px] leading-9 text-gray-700 dark:text-gray-300 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-5 [&_blockquote]:border-s-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-gray-50 [&_blockquote]:px-5 [&_blockquote]:py-3 dark:[&_blockquote]:bg-gray-950/70 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-gray-500 [&_figure]:my-6 [&_h1]:my-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-4 [&_h3]:text-lg [&_h3]:font-bold [&_hr]:my-7 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pe-6 [&_p]:my-4 [&_strong]:font-bold [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 dark:[&_td]:border-gray-700 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-3 dark:[&_th]:border-gray-700 dark:[&_th]:bg-gray-800 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pe-6">
                {sanitizedDescription ? (
                  parse(sanitizedDescription)
                ) : (
                  <p className="text-gray-500">
                    توضیحاتی برای این سند ثبت نشده است.
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center gap-5 border-t border-gray-100 pt-5 text-xs text-gray-400 dark:border-gray-800">
                <span className="flex items-center gap-1.5">
                  <TbEye size={15} />
                  {product.viewsCount.toLocaleString("fa-IR")} بازدید
                </span>
                <span className="flex items-center gap-1.5">
                  <TbDownload size={15} />
                  {product.salesCount.toLocaleString("fa-IR")} فروش
                </span>
                <span className="flex items-center gap-1.5">
                  <TbClock size={15} />
                  بروزرسانی: {formatDate(product.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  قیمت سند
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
              </div>
              <Link
                href={checkoutHref}
                className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors"
              >
                <TbDownload size={17} />
                خرید و دانلود سند
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <TbShieldCheck size={14} />
                تحویل آنی پس از پرداخت
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
                ناشر محصول
              </h3>
              {vendorHref ? (
                <Link
                  href={vendorHref}
                  className="group flex items-center gap-3"
                >
                  {vendorIdentity}
                </Link>
              ) : (
                <div className="flex items-center gap-3">{vendorIdentity}</div>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  محصولات مرتبط
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  مستندات مشابه در همین حوزه حقوقی
                </p>
              </div>
              <Link
                href={documentListHref(product)}
                className="text-primary text-sm hover:underline"
              >
                مشاهده همه
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <DocumentCard
                  key={relatedProduct.slug}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default DocumentDetailPage
