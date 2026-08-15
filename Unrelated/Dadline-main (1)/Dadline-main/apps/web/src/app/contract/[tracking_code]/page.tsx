import NotFound from "@/components/shared/NotFound"
import { getPublicContractVerification } from "@/server/actions/contracts/getContracts"

type PageProps = {
  params: Promise<{ tracking_code: string }>
}

const formatPersianDate = (value?: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

const shortHash = (value?: string | null) =>
  value && value.length > 24
    ? `${value.slice(0, 14)}...${value.slice(-10)}`
    : (value ?? "-")

export default async function ContractVerificationPage({ params }: PageProps) {
  const { tracking_code: trackingCode } = await params
  const result = await getPublicContractVerification(trackingCode)

  if (result.notFound) return <NotFound />

  if (result.error || !result.verification) {
    return (
      <main className="bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl rounded-lg bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
          {result.error ?? "استعلام قرارداد در دسترس نیست."}
        </div>
      </main>
    )
  }

  const verification = result.verification

  return (
    <main className="bg-gray-50 px-4 py-6 dark:bg-gray-950 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
                  استعلام اصالت قرارداد
                </h1>
                <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                  این صفحه صرفاً جهت استعلام وضعیت، کد رهگیری و داده‌های اصالت‌سنجی
                  سند صادر شده توسط دادلاین است.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="عنوان قرارداد" value={verification.title} />
                <Info label="کد رهگیری" value={verification.trackingCode} ltr />
                <Info label="وضعیت" value={verification.statusLabel} />
                <Info
                  label="تاریخ انعقاد"
                  value={formatPersianDate(verification.completedAt)}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-5 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              {verification.qrUrl ? (
                <img
                  src={verification.qrUrl}
                  alt="QR Code استعلام قرارداد"
                  className="h-40 w-40 object-contain"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-gray-100 text-center text-xs text-gray-500 dark:bg-gray-800">
                  QR Code در دسترس نیست
                </div>
              )}
              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                <span className="text-gray-500 font-bold">انطباق هش</span>
                <span
                  className={`animate-pulse font-bold ${
                    verification.hashMatchesCurrentBody
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {verification.hashMatchesCurrentBody
                    ? "تایید شده"
                    : "عدم انطباق"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-950 dark:text-white">
              داده‌های اصالت‌سنجی
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <HashRow label="الگوریتم هش" value={verification.hashAlgorithm} />
              <HashRow label="هش متن قرارداد" value={verification.bodyHash} />
              <HashRow
                label="هش بسته مستندات"
                value={verification.payloadHash}
              />
              <HashRowBase
                label="زمان ثبت هش"
                value={formatPersianDate(verification.snapshotCreatedAt)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-950 dark:text-white">
              طرفین قرارداد
            </h2>
            <div className="grid gap-5 grid-cols-2">
              {verification.signatures.map((signature, index) => (
                <div
                  key={`${signature.mobile}-${index}`}
                  className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {signature.fullName ?? "امضاکننده"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {signature.mobile ?? "-"}
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
                      {signature.statusLabel}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    زمان امضا: {formatPersianDate(signature.signedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900">
          <p className="text-justify leading-5">
            توضیحات: این سند در سامانه دادلاین به صورت الکترونیکی امضاء گردیده
            است. هویت و اهلیت امضاءکنندگان با استعلام از سامانه‌های شاهکار،
            ثبت‌احوال و تطابق کارت بانکی، احراز شده و امضاء با تأیید پیامکی تصدیق
            گردیده است. اطلاعات امضا شامل نشانی آی پی، تاریخ و مقدار یکتای هش
            سند در سامانه دادلاین ثبت و به مدت نامحدود نگهداری خواهد شد. این سند
            بر مبنای قانون تجارت الکترونیک ایران، از اعتبار حقوقی کامل و قابلیت
            استناد در مراجع قضایی برخوردار است. جهت استعلام اصالت سند QRCODE
            اسکن شود.
          </p>
        </section>
        <section className="text-center">
          <a
            href={verification.verificationUrl ?? "#"}
            className="break-all text-center text-xs"
            dir="ltr"
          >
            {verification.verificationUrl}
          </a>
        </section>
      </div>
    </main>
  )
}

function Info({
  label,
  value,
  ltr = false,
}: {
  label: string
  value?: string | null
  ltr?: boolean
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className="mt-1 font-semibold text-gray-900 dark:text-gray-100"
        dir={ltr ? "ltr" : "rtl"}
      >
        {value ?? "-"}
      </div>
    </div>
  )
}

function HashRow({ label, value }: { label: string value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono text-xs" title={value ?? ""} dir="ltr">
        {shortHash(value)}
      </span>
    </div>
  )
}

function HashRowBase({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-gray-500">{label}</span>
      <span className="text-xs" title={value ?? ""} dir="ltr">
        {shortHash(value)}
      </span>
    </div>
  )
}
