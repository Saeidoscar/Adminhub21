import type { ContractRow } from "@adminhub/shared"
import { contractStatusColor, contractStatusLabel } from "../../domain/contract"
import { contractAmountDisplay } from "../../services/contractService"
import { Button } from "../ui/Button"

interface ContractDetailViewProps {
  contract: ContractRow
  lang: "en" | "fa"
  tr: Record<string, string>
  onBack: () => void
  onStatusChange?: (status: string) => void
  updatingId?: string | null
}

export default function ContractDetailView({
  contract,
  lang,
  tr,
  onBack,
  onStatusChange,
  updatingId,
}: ContractDetailViewProps) {
  const isFa = lang === "fa"
  const statusOptions = ["active", "pending", "completed", "disputed"] as const

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4"
        >
          <span className="rtl:rotate-180">←</span>
          {tr.common?.back || "Back"}
        </button>
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {contract.code}
        </h1>
        <p className="text-[#64748b] mt-1">
          {isFa ? "جزئیات قرارداد" : "Contract Details"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-[#64748b]">
              {isFa ? "وضعیت" : "Status"}
            </div>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${contractStatusColor(contract.status)}`}
            >
              {contractStatusLabel(contract.status, lang)}
            </span>
          </div>
          <div className="text-left">
            <div className="text-sm text-[#64748b]">
              {isFa ? "مبلغ" : "Amount"}
            </div>
            <div className="text-base font-bold text-[#1e3a5f]">
              {contractAmountDisplay(contract.amountToman, contract.amountUSD, lang)}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "کارفرما" : "Employer"}
            </div>
            <div className="text-sm font-semibold text-[#0f172a]">
              {contract.employerName}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "ادمین" : "Admin"}
            </div>
            <div className="text-sm font-semibold text-[#0f172a]">
              {contract.adminNameEn}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "پلتفرم" : "Platform"}
            </div>
            <div className="text-sm font-semibold text-[#0f172a] capitalize">
              {contract.platform}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "بیمه" : "Insurance"}
            </div>
            <div className="text-sm font-semibold text-[#0f172a]">
              {contract.hasInsurance
                ? isFa ? "بله" : "Yes"
                : isFa ? "خیر" : "No"}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "جایگزین" : "Substitute"}
            </div>
            <div className="text-sm font-semibold text-[#0f172a]">
              {contract.hasSubstitute
                ? isFa ? "بله" : "خیر"
                : isFa ? "خیر" : "No"}
            </div>
          </div>
          {contract.startDate && (
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "تاریخ شروع" : "Start Date"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {contract.startDate}
              </div>
            </div>
          )}
          {contract.endDate && (
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "تاریخ پایان" : "End Date"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {contract.endDate}
              </div>
            </div>
          )}
        </div>

        {contract.termClause && (
          <div className="mb-4">
            <div className="text-xs text-[#64748b] mb-1">
              {tr.contract?.termClause || "Termination"}
            </div>
            <p className="text-sm text-[#0f172a] bg-[#f8fafc] rounded-lg p-3">
              {contract.termClause}
            </p>
          </div>
        )}

        {contract.substituteClause && (
          <div className="mb-4">
            <div className="text-xs text-[#64748b] mb-1">
              {tr.contract?.subClause || "Substitution"}
            </div>
            <p className="text-sm text-[#0f172a] bg-emerald-50 rounded-lg p-3">
              {contract.substituteClause}
            </p>
          </div>
        )}

        {onStatusChange && (
          <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              {isFa ? "تغییر وضعیت" : "Update Status"}
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  disabled={updatingId === contract.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all btn-press disabled:opacity-50 ${
                    contract.status === status
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-[#f2f5fa] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {contractStatusLabel(status, lang)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
