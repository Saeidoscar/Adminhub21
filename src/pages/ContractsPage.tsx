import { useState, useEffect } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Badge } from "../components/ui/Badge"
import {
  listContracts,
  getContract,
  updateContractStatus,
  type Contract,
} from "../lib/api"
import { ListSkeleton } from "../components/ui/Skeleton"

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  disputed: "bg-red-100 text-red-700",
}

const STATUS_OPTIONS = ["active", "pending", "completed", "disputed"] as const

export default function ContractsPage({
  tr,
  lang,
}: {
  tr: typeof t["en"]
  lang: Lang
}) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  const isFa = lang === "fa"

  const loadContracts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listContracts()
      setContracts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contracts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [])

  const handleStatusChange = async (contractId: string, status: string) => {
    setUpdatingId(contractId)
    try {
      const updated = await updateContractStatus(contractId, { status })
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c)),
      )
      if (selectedContract?.id === contractId) {
        setSelectedContract(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const viewContract = async (id: string) => {
    try {
      const contract = await getContract(id)
      if (contract) {
        setSelectedContract(contract)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contract")
    }
  }

  if (selectedContract) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
        <div className="mb-6">
          <button
            onClick={() => setSelectedContract(null)}
            className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4"
          >
            <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
            {tr.common.back}
          </button>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            {selectedContract.code}
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
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedContract.status] || "bg-gray-100 text-gray-700"}`}
              >
                {isFa
                  ? {
                      active: "فعال",
                      pending: "در انتظار",
                      completed: "تکمیل شده",
                      disputed: "در حال رسیدگی",
                    }[selectedContract.status] || selectedContract.status
                  : selectedContract.status}
              </span>
            </div>
            <div className="text-left">
              <div className="text-sm text-[#64748b]">
                {isFa ? "مبلغ" : "Amount"}
              </div>
              <div className="text-base font-bold text-[#1e3a5f]">
                {isFa
                  ? `${(selectedContract.amountToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                  : `$${selectedContract.amountUSD}`}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "کارفرما" : "Employer"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {selectedContract.employerName}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "ادمین" : "Admin"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {selectedContract.adminNameEn}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "پلتفرم" : "Platform"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a] capitalize">
                {selectedContract.platform}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "بیمه" : "Insurance"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {selectedContract.hasInsurance
                  ? isFa ? "بله" : "Yes"
                  : isFa ? "خیر" : "No"}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {isFa ? "جایگزین" : "Substitute"}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {selectedContract.hasSubstitute
                  ? isFa ? "بله" : "Yes"
                  : isFa ? "خیر" : "No"}
              </div>
            </div>
            {selectedContract.startDate && (
              <div>
                <div className="text-xs text-[#64748b] mb-1">
                  {isFa ? "تاریخ شروع" : "Start Date"}
                </div>
                <div className="text-sm font-semibold text-[#0f172a]">
                  {selectedContract.startDate}
                </div>
              </div>
            )}
            {selectedContract.endDate && (
              <div>
                <div className="text-xs text-[#64748b] mb-1">
                  {isFa ? "تاریخ پایان" : "End Date"}
                </div>
                <div className="text-sm font-semibold text-[#0f172a]">
                  {selectedContract.endDate}
                </div>
              </div>
            )}
          </div>

          {selectedContract.termClause && (
            <div className="mb-4">
              <div className="text-xs text-[#64748b] mb-1">
                {tr.contract.termClause}
              </div>
              <p className="text-sm text-[#0f172a] bg-[#f8fafc] rounded-lg p-3">
                {selectedContract.termClause}
              </p>
            </div>
          )}

          {selectedContract.substituteClause && (
            <div className="mb-4">
              <div className="text-xs text-[#64748b] mb-1">
                {tr.contract.subClause}
              </div>
              <p className="text-sm text-[#0f172a] bg-emerald-50 rounded-lg p-3">
                {selectedContract.substituteClause}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              {isFa ? "تغییر وضعیت" : "Update Status"}
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    handleStatusChange(selectedContract.id, status)
                  }
                  disabled={updatingId === selectedContract.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all btn-press disabled:opacity-50 ${
                    selectedContract.status === status
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-[#f2f5fa] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {isFa
                    ? {
                        active: "فعال",
                        pending: "در انتظار",
                        completed: "تکمیل شده",
                        disputed: "در حال رسیدگی",
                      }[status]
                    : status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {isFa ? "قراردادهای من" : "My Contracts"}
        </h1>
        <p className="text-[#64748b] mt-1">
          {isFa
            ? "مشاهده و مدیریت قراردادهای خود"
            : "View and manage your contracts"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[#64748b]">
          <ListSkeleton count={4} />
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16 text-[#64748b]">
          <div className="text-4xl mb-3">📄</div>
          <div className="font-semibold">
            {isFa ? "هنوز قراردادی ندارید" : "No contracts yet"}
          </div>
          <div className="text-sm mt-1">
            {isFa
              ? "قرارداد خود را ایجاد کنید"
              : "Create a contract to get started"}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="text-start px-4 py-3 font-semibold text-[#64748b] text-xs uppercase tracking-wide">
                    {isFa ? "کد" : "Code"}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-[#64748b] text-xs uppercase tracking-wide">
                    {isFa ? "ادمین" : "Admin"}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-[#64748b] text-xs uppercase tracking-wide">
                    {isFa ? "پلتفرم" : "Platform"}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-[#64748b] text-xs uppercase tracking-wide">
                    {isFa ? "مبلغ" : "Amount"}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-[#64748b] text-xs uppercase tracking-wide">
                    {isFa ? "وضعیت" : "Status"}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-[#64748b] text-xs uppercase tracking-wide">
                    {isFa ? "تاریخ" : "Date"}
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-[#f2f5fa] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#0f172a]">
                        {contract.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#0f172a]">
                      {contract.adminNameEn}
                    </td>
                    <td className="px-4 py-3 capitalize text-[#0f172a]">
                      {contract.platform}
                    </td>
                    <td className="px-4 py-3 text-[#0f172a]">
                      {isFa
                        ? `${(contract.amountToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                        : `$${contract.amountUSD}`}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={contract.status}
                        onChange={(e) =>
                          handleStatusChange(contract.id, e.target.value)
                        }
                        disabled={updatingId === contract.id}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer disabled:cursor-wait ${STATUS_COLORS[contract.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {isFa
                              ? {
                                  active: "فعال",
                                  pending: "در انتظار",
                                  completed: "تکمیل شده",
                                  disputed: "در حال رسیدگی",
                                }[status]
                              : status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-start">
                      <button
                        onClick={() => viewContract(contract.id)}
                        className="text-xs text-[#1e3a5f] font-semibold hover:underline"
                      >
                        {tr.common.viewDetails}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
