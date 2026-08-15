"use client"

import type { Contract } from "@/@types/contracts"
import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Button from "@/components/ui/Button"
import { TbExternalLink, TbFileCertificate } from "react-icons/tb"
import { ContractStatusTag, formatPersianDate } from "./contract-ui"

const shortHash = (value?: string | null) =>
  value && value.length > 18
    ? `${value.slice(0, 10)}...${value.slice(-8)}`
    : (value ?? "-")

type ContractEvidenceSummaryBarProps = {
  contract: Contract
}

const ContractEvidenceSummaryBar = ({
  contract,
}: ContractEvidenceSummaryBarProps) => {
  return (
    <AdaptiveCard className="overflow-hidden">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[112px_minmax(0,1fr)_220px] xl:items-stretch">
        {contract.qrUrl ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
            <img
              src={contract.qrUrl}
              alt="QR Code استعلام قرارداد"
              className="h-24 w-24 object-contain"
            />
          </div>
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 px-3 py-3 text-center text-sm text-gray-500 dark:border-gray-700">
            QR Code پس از انعقاد قرارداد صادر می‌شود.
          </div>
        )}

        <div className="grid min-w-0 gap-3 text-sm md:grid-cols-3">
          <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3 text-right dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="text-xs text-gray-500">کد رهگیری</span>
              <strong
                dir="ltr"
                className="min-w-0 truncate text-right font-mono text-sm"
                title={contract.trackingCode ?? undefined}
              >
                {contract.trackingCode ?? "-"}
              </strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">وضعیت</span>
              <ContractStatusTag
                status={contract.status}
                label={contract.statusLabel}
              />
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3 text-right dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="text-xs text-gray-500">تاریخ ایجاد</span>
              <span className="min-w-0 truncate font-medium">
                {formatPersianDate(contract.createdAt)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">تاریخ انعقاد</span>
              <span className="min-w-0 truncate font-medium">
                {formatPersianDate(contract.updatedAt ?? contract.createdAt)}
              </span>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3 text-right dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="text-xs text-gray-500">هش متن</span>
              <span
                dir="ltr"
                title={contract.snapshot?.bodyHash ?? ""}
                className="min-w-0 truncate text-right font-mono text-xs"
              >
                {shortHash(contract.snapshot?.bodyHash)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">هش سند</span>
              <span
                dir="ltr"
                title={contract.snapshot?.payloadHash ?? ""}
                className="min-w-0 truncate text-right font-mono text-xs"
              >
                {shortHash(contract.snapshot?.payloadHash)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 xl:self-center">
          {contract.verificationUrl && (
            <a
              href={contract.verificationUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0"
            >
              <Button block icon={<TbExternalLink />}>
                صفحه استعلام
              </Button>
            </a>
          )}
          <a
            href={`/pishkhan/contracts/${contract.uuid}/evidence-report`}
            className="min-w-0"
          >
            <Button block icon={<TbFileCertificate />}>
              گزارش اصالت
            </Button>
          </a>
        </div>
      </div>
    </AdaptiveCard>
  )
}

export default ContractEvidenceSummaryBar
