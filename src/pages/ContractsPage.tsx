import { useState } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Badge } from "../components/ui/Badge"
import { ListSkeleton } from "../components/ui/Skeleton"
import { contractStatusLabel, contractStatusColor } from "../domain/contract"
import { contractAmountDisplay } from "../services/contractService"
import { useContracts } from "../hooks/useMarketplace"
import type { Contract } from "@adminhub/shared"
import ContractDetailView from "../components/contracts/ContractDetailView"

const STATUS_OPTIONS = ["active", "pending", "completed", "disputed"] as const

export default function ContractsPage({
  tr,
  lang,
}: {
  tr: typeof t["en"]
  lang: Lang
}) {
  const { contracts, loading, error, updateStatus, viewContract } = useContracts()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  const isFa = lang === "fa"

  const handleStatusChange = async (contractId: string, status: string) => {
    setUpdatingId(contractId)
    try {
      const updated = await updateStatus(contractId, status)
      if (selectedContract?.id === contractId) {
        setSelectedContract(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleViewContract = async (id: string) => {
    const contract = await viewContract(id)
    if (contract) {
      setSelectedContract(contract)
    }
  }

  if (selectedContract) {
    return (
      <ContractDetailView
        contract={selectedContract}
        lang={lang}
        tr={tr}
        onBack={() => setSelectedContract(null)}
        onStatusChange={handleStatusChange}
        updatingId={updatingId}
      />
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
                      {contractAmountDisplay(contract.amountToman, contract.amountUSD, lang)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={contract.status}
                        onChange={(e) =>
                          handleStatusChange(contract.id, e.target.value)
                        }
                        disabled={updatingId === contract.id}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer disabled:cursor-wait ${contractStatusColor(contract.status)}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {contractStatusLabel(status, lang)}
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
