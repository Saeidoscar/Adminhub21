"use client"

import type { PublicContractPreview } from "@/@types/contracts"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { verifyPublicContractPin } from "@/server/actions/contracts/getContracts"
import { useState, useTransition } from "react"
import { TbFile, TbPrinter, TbUserCheck, TbX } from "react-icons/tb"

type Props = {
  initialPreview: PublicContractPreview
}

const formatFileSize = (size?: number | null) => {
  if (!size) return "حجم نامشخص"
  const unit = size >= 1024 * 1024 ? "MB" : "KB"
  const value = size >= 1024 * 1024 ? size / 1024 / 1024 : size / 1024

  return `${value.toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  })} ${unit}`
}

const ContractPreviewClient = ({ initialPreview }: Props) => {
  const [preview, setPreview] = useState(initialPreview)
  const [pinCode, setPinCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showDraftNotice, setShowDraftNotice] = useState(true)
  const [pending, startTransition] = useTransition()

  const verify = () => {
    setError(null)
    startTransition(async () => {
      const result = await verifyPublicContractPin(preview.uuid, pinCode)
      if (result.error || !result.preview) {
        setError(result.error ?? "کد واردشده صحیح نیست.")
        return
      }
      setPreview(result.preview)
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-6 print:bg-white dark:bg-gray-950 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5 print:max-w-none print:space-y-4">
        <section className="rounded-lg border border-gray-200 bg-white p-5 print:border-0 print:p-0 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                <strong>پیش‌نویس</strong> {preview.title}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                ایجادکننده: {preview.creator?.name || "دادلاین"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              {preview.verified && (
                <Button icon={<TbPrinter />} onClick={() => window.print()}>
                  پرینت
                </Button>
              )}
            </div>
          </div>
        </section>

        {showDraftNotice && (
          <div className="relative rounded-lg border border-amber-200 bg-amber-50 px-10 py-3 text-center text-sm leading-7 text-amber-900 print:hidden dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
            <button
              type="button"
              className="absolute left-3 top-3 rounded p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40"
              onClick={() => setShowDraftNotice(false)}
              aria-label="بستن پیام"
            >
              <TbX />
            </button>
            این قرارداد/سند در سامانه حقوقی دادلاین [DADLINE.net] به صورت
            پیش‌نویس ثبت شده است و تا زمان امضای طرفین و انعقاد نهایی، فاقد ارزش
            و اعتبار قانونی است
          </div>
        )}

        {!preview.verified ? (
          <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="max-w-md space-y-4">
              <div>
                <h2 className="text-lg font-semibold">ورود PIN مشاهده</h2>
                <p className="mt-1 text-sm leading-7 text-gray-500">
                  برای مشاهده متن قرارداد، طرفین و پیوست‌ها، کد PIN دریافت‌شده از
                  ایجادکننده قرارداد را وارد کنید.
                </p>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  value={pinCode}
                  maxLength={4}
                  placeholder="کد ۴ رقمی"
                  onChange={(event) => setPinCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") verify()
                  }}
                />
                <Button variant="solid" loading={pending} onClick={verify}>
                  مشاهده
                </Button>
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
                  {error}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-lg border border-gray-200 bg-white p-6 print:border-0 print:p-0 dark:border-gray-800 dark:bg-gray-900">
              <div
                className="prose max-w-none leading-8 dark:prose-invert print:text-black"
                dangerouslySetInnerHTML={{
                  __html: preview.body ?? "",
                }}
              />
            </section>

            <section className="grid gap-5 print:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-5 print:border print:border-gray-300 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold">طرفین قرارداد</h2>
                <div className="grid grid-cols-2 gap-3">
                  {preview.signatures.map((signature, index) => (
                    <div
                      key={`${signature.mobile}-${index}`}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <TbUserCheck className="text-xl text-primary print:hidden" />
                      <div>
                        <div className="font-semibold">
                          {signature.fullName || signature.mobile}
                        </div>
                        <div className="text-xs text-gray-500">
                          {signature.mobile}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5 print:border print:border-gray-300 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold">پیوست‌ها</h2>
                <div className="space-y-3">
                  {preview.attachments.length === 0 && (
                    <div className="text-sm text-gray-500">
                      پیوستی ثبت نشده است.
                    </div>
                  )}
                  {preview.attachments.map((attachment) => (
                    <div
                      key={attachment.attachmentId}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <TbFile className="text-xl text-primary print:hidden" />
                      <div>
                        <div className="font-semibold">
                          {attachment.originalName || "فایل پیوست"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attachment.mimeType ?? "نوع فایل نامشخص"} ·{" "}
                          {formatFileSize(attachment.sizeBytes)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <footer className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm leading-7 text-gray-600 print:border-0 print:p-0 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <p>
                این قرارداد/سند در سامانه حقوقی دادلاین [DADLINE.net] به صورت
                پیش‌نویس ثبت شده است و تا زمان امضای طرفین و انعقاد نهایی، فاقد
                ارزش و اعتبار قانونی است.
              </p>
              <p className="mt-2">
                چنانچه تغییرات یا اصلاحاتی در مفاد قرارداد دارید، آن را برای
                آقای / خانم {preview.creator?.name || "ایجادکننده قرارداد"}{" "}
                ارسال کنید تا پیش از پرداخت و فعال‌سازی قرارداد بررسی و اعمال
                شود.
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}

export default ContractPreviewClient
