"use client"

import { TbPrinter } from "react-icons/tb"

const PrintEvidenceReportButton = () => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-deep"
    >
      <TbPrinter className="text-lg" />
      پرینت گزارش
    </button>
  )
}

export default PrintEvidenceReportButton
