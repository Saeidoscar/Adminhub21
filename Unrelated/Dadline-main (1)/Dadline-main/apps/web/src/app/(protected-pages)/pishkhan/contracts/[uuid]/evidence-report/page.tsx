import { auth } from "@/auth"
import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import Link from "next/link"
import PrintEvidenceReportButton from "./PrintEvidenceReportButton"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

type PageProps = {
  params: Promise<{ uuid: string }>
}

const bodyContent = (html: string) => {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

  return match?.[1] ?? html
}

export default async function Page({ params }: PageProps) {
  const session = await auth()
  const { uuid } = await params

  if (!session?.accessToken) {
    return (
      <Container>
        <AdaptiveCard>
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
            برای مشاهده گزارش اصالت وارد شوید.
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  const response = await fetch(
    `${API_INTERNAL_URL}/v1/contracts/${encodeURIComponent(uuid)}/evidence-report`,
    {
      headers: {
        Accept: "text/html",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    },
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)

    return (
      <Container>
        <AdaptiveCard>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
              {body?.message ?? "دریافت گزارش ممکن نیست."}
            </div>
            <Link
              href={`/pishkhan/contracts/${uuid}`}
              className="text-sm font-semibold text-primary"
            >
              بازگشت به قرارداد
            </Link>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  const html = await response.text()

  return (
    <Container className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            گزارش اصالت قرارداد
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            جزئیات رهگیری، هش سند، پیوست‌ها، امضاها و رویدادهای ثبت‌شده قرارداد
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintEvidenceReportButton />
          <Link
            href={`/pishkhan/contracts/${uuid}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            بازگشت به قرارداد
          </Link>
        </div>
      </div>

      <AdaptiveCard className="overflow-hidden">
        <div
          className="contract-evidence-report"
          dangerouslySetInnerHTML={{ __html: bodyContent(html) }}
        />
      </AdaptiveCard>

      <style>{`
                .contract-evidence-report {
                    direction: rtl;
                    color: rgb(17 24 39);
                    font-size: 0.875rem;
                    line-height: 1.9;
                }

                .dark .contract-evidence-report {
                    color: rgb(243 244 246);
                }

                .contract-evidence-report h3 {
                    margin: 0 0 0.75rem;
                    font-size: 1.125rem;
                    font-weight: 800;
                }

                .contract-evidence-report h2 {
                    margin: 1.5rem 0 0.75rem;
                    border-right: 4px solid rgb(37 99 235);
                    padding-right: 0.75rem;
                    font-size: 1rem;
                    font-weight: 800;
                }

                .contract-evidence-report p {
                    margin: 0 0 1rem;
                    color: rgb(75 85 99);
                }

                .dark .contract-evidence-report p {
                    color: rgb(209 213 219);
                }

                .contract-evidence-report table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    overflow: hidden;
                    border: 1px solid rgb(229 231 235);
                    border-radius: 0.75rem;
                    background: rgb(255 255 255);
                    margin: 0.75rem 0 1.25rem;
                }

                .dark .contract-evidence-report table {
                    border-color: rgb(55 65 81);
                    background: rgb(17 24 39);
                }

                .contract-evidence-report th,
                .contract-evidence-report td {
                    border: 0;
                    border-bottom: 1px solid rgb(229 231 235);
                    padding: 0.75rem 1rem;
                    text-align: right;
                    vertical-align: top;
                }

                .dark .contract-evidence-report th,
                .dark .contract-evidence-report td {
                    border-bottom-color: rgb(55 65 81);
                }

                .contract-evidence-report tr:last-child th,
                .contract-evidence-report tr:last-child td {
                    border-bottom: 0;
                }

                .contract-evidence-report th {
                    width: 13rem;
                    background: rgb(249 250 251);
                    color: rgb(75 85 99);
                    font-weight: 700;
                }

                .dark .contract-evidence-report th {
                    background: rgb(31 41 55);
                    color: rgb(209 213 219);
                }

                .contract-evidence-report td {
                    color: rgb(17 24 39);
                    word-break: break-word;
                }

                .dark .contract-evidence-report td {
                    color: rgb(243 244 246);
                }

                .contract-evidence-report code {
                    direction: ltr;
                    display: block;
                    max-height: 7.5rem;
                    overflow: auto;
                    border-radius: 0.5rem;
                    background: rgb(17 24 39);
                    color: rgb(243 244 246);
                    padding: 0.75rem;
                    font-family: Consolas, monospace;
                    font-size: 0.75rem;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

                .contract-evidence-report .body {
                    margin-top: 0.75rem;
                    border: 1px solid rgb(229 231 235);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    background: rgb(255 255 255);
                    text-align: justify;
                }

                .dark .contract-evidence-report .body {
                    border-color: rgb(55 65 81);
                    background: rgb(17 24 39);
                }

                .contract-evidence-report .footer {
                    margin-top: 1.5rem;
                    text-align: center;
                    color: rgb(107 114 128);
                    font-size: 0.75rem;
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }

                    body {
                        background: #fff !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .contract-evidence-report,
                    .contract-evidence-report * {
                        visibility: visible !important;
                    }

                    .contract-evidence-report {
                        position: absolute;
                        inset: 0;
                        color: #111827 !important;
                        background: #fff !important;
                        font-size: 9pt;
                        line-height: 1.75;
                    }

                    .contract-evidence-report table,
                    .contract-evidence-report th,
                    .contract-evidence-report td,
                    .contract-evidence-report .body {
                        background: transparent !important;
                    }

                    .contract-evidence-report h2,
                    .contract-evidence-report h3 {
                        break-after: avoid;
                    }

                    .contract-evidence-report table,
                    .contract-evidence-report .body {
                        break-inside: avoid;
                    }
                }
            `}</style>
    </Container>
  )
}
