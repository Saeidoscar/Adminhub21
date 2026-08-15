"use client"

import DataTable, { type ColumnDef } from "@/components/shared/DataTable"
import SessionContext from "@/components/auth/AuthProvider/SessionContext"
import Tag from "@/components/ui/Tag"
import Link from "next/link"
import { useContext, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TbUsers } from "react-icons/tb"
import { ContractStatusTag, formatPersianDate } from "./contract-ui"
import type { Contract, ContractPagination } from "@/@types/contracts"

type Props = {
  contracts: Contract[]
  pagination: ContractPagination
}

const ContractsTable = ({ contracts, pagination }: Props) => {
  const router = useRouter()
  const session = useContext(SessionContext)
  const [verificationWarning, setVerificationWarning] = useState(false)

  const getAccessState = (contract: Contract) => {
    const currentUserId =
      contract.currentUser?.id ?? Number(session?.user?.id) ?? null
    const currentUserMobile =
      contract.currentUser?.mobile ?? session?.user?.mobile
    const currentUserSignature = (contract.signatures ?? []).find(
      (signature) =>
        signature.userId === currentUserId ||
        (!!currentUserMobile && signature.mobile === currentUserMobile),
    )
    const isCreator =
      !!currentUserId && Number(contract.creatorId) === Number(currentUserId)
    const isPendingInvitation =
      !isCreator &&
      !!currentUserSignature &&
      !currentUserSignature.userId &&
      !currentUserSignature.viewedAt
    const needsVerification =
      !isCreator &&
      !!currentUserSignature &&
      contract.currentUser?.verification?.isLevelTwoVerified === false

    return { isPendingInvitation, needsVerification }
  }

  const openContract = (contract: Contract) => {
    if (getAccessState(contract).needsVerification) {
      setVerificationWarning(true)
      return
    }

    router.push(`/pishkhan/contracts/${contract.uuid}`)
  }

  const columns: ColumnDef<Contract>[] = useMemo(
    () => [
      {
        header: "قرارداد",
        accessorKey: "title",
        cell: ({ row }) => {
          const contract = row.original
          const { isPendingInvitation, needsVerification } =
            getAccessState(contract)

          return (
            <div className="min-w-57.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={`text-right font-semibold ${
                    needsVerification
                      ? "text-gray-500"
                      : "text-gray-900 hover:text-primary dark:text-gray-100"
                  }`}
                  onClick={() => openContract(contract)}
                >
                  {contract.title}
                </button>
                {isPendingInvitation && (
                  <Tag className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100">
                    دعوت‌شده
                  </Tag>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{contract.trackingCode ?? contract.uuid}</span>
                <span className="inline-flex items-center gap-1">
                  <TbUsers />
                  {(contract.signatures ?? []).length} طرف
                </span>
              </div>
            </div>
          )
        },
      },
      {
        header: "طرفین",
        accessorKey: "signatures",
        cell: ({ row }) => {
          const currentUserId =
            row.original.currentUser?.id ?? Number(session?.user?.id) ?? null
          const currentUserMobile =
            row.original.currentUser?.mobile ?? session?.user?.mobile
          const signatures = row.original.signatures ?? []
          const currentUserParty = signatures.find(
            (item) =>
              item.userId === currentUserId ||
              (!!currentUserMobile && item.mobile === currentUserMobile),
          )
          const parties = signatures
            .filter((item) => item !== currentUserParty)
            .map((item) => item.fullName || item.mobile)
            .filter(Boolean)
            .slice(0, 2)

          return (
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {parties.join("، ") || "-"}
            </span>
          )
        },
      },
      {
        header: "وضعیت",
        accessorKey: "status",
        cell: ({ row }) => (
          <ContractStatusTag
            status={row.original.status}
            label={row.original.statusLabel}
          />
        ),
      },
      {
        header: "تاریخ",
        accessorKey: "createdAt",
        cell: ({ row }) => formatPersianDate(row.original.createdAt),
      },
    ],
    [router, session?.user?.id, session?.user?.mobile],
  )

  return (
    <div className="space-y-3">
      {verificationWarning && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <span>
            برای ورود و مشاهده قرارداد دعوت‌شده، ابتدا احراز هویت سطح ۲ را تکمیل
            کنید.
          </span>
          <Link
            href="/pishkhan/profile/verification"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/40"
          >
            تکمیل احراز هویت
          </Link>
        </div>
      )}
      <DataTable
        columns={columns}
        data={contracts}
        noData={contracts.length === 0}
        pagingData={{
          total: pagination.total,
          pageIndex: pagination.currentPage,
          pageSize: pagination.perPage,
        }}
        onPaginationChange={(page) => {
          const params = new URLSearchParams(window.location.search)
          params.set("page", String(page))
          router.push(`/pishkhan/contracts?${params}`)
        }}
        onSelectChange={(pageSize) => {
          const params = new URLSearchParams(window.location.search)
          params.set("perPage", String(pageSize))
          params.set("page", "1")
          router.push(`/pishkhan/contracts?${params}`)
        }}
      />
    </div>
  )
}

export default ContractsTable
