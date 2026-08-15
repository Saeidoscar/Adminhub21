"use client"

import type { ContractSignature } from "@/@types/contracts"
import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Tag from "@/components/ui/Tag"
import { formatPersianDateTime } from "./contract-ui"

type CompletedSignaturesCardProps = {
  signatures: ContractSignature[]
}

const CompletedSignaturesCard = ({
  signatures,
}: CompletedSignaturesCardProps) => {
  return (
    <AdaptiveCard className="order-1">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">اطلاعات امضاکنندگان</h3>
        <div className="space-y-3">
          {signatures.map((signature, index) => (
            <div
              key={signature.id}
              className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {signature.fullName ||
                      `امضاکننده ${(index + 1).toLocaleString("fa-IR")}`}
                  </div>
                  <div
                    dir="ltr"
                    className="mt-1 text-right text-xs text-gray-500"
                  >
                    {signature.mobile ?? "-"}
                  </div>
                </div>
                <Tag
                  className={
                    signature.signatureStatus === "signed"
                      ? "shrink-0 bg-emerald-100 text-emerald-700"
                      : "shrink-0 bg-gray-100 text-gray-700"
                  }
                >
                  {signature.signatureStatusLabel}
                </Tag>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-2 text-xs dark:border-gray-800">
                <span className="text-gray-500">تاریخ امضا</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {signature.signedAt
                    ? formatPersianDateTime(signature.signedAt)
                    : "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdaptiveCard>
  )
}

export default CompletedSignaturesCard
