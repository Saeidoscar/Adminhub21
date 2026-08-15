"use client"

import DataTable, { type ColumnDef } from "@/components/shared/DataTable"
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { TbChevronLeft, TbChevronRight, TbReceipt } from "react-icons/tb"
import {
  formatMoney,
  formatPersianDate,
  WalletDirectionTag,
  WalletStatusTag,
} from "./wallet-ui"
import type { WalletPagination, WalletTransaction } from "@/@types/wallet"

type Props = {
  transactions: WalletTransaction[]
  pagination: WalletPagination
}

const WalletTransactionsTable = ({ transactions, pagination }: Props) => {
  const router = useRouter()

  const updatePagination = (key: "page" | "perPage", value: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set(key, String(value))
    if (key === "perPage") params.set("page", "1")
    router.push(`/pishkhan/wallet?${params}`)
  }

  const columns: ColumnDef<WalletTransaction>[] = useMemo(
    () => [
      {
        header: "تراکنش",
        accessorKey: "typeLabel",
        cell: ({ row }) => (
          <div className="min-w-52">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {row.original.typeLabel}
            </div>
            <div className="flex items-center gap-1 align-middle">
              {row.original.settlement ? (
                <div>
                  <Tooltip title="این تراکنش درخواست تسویه دارد">
                    <span className="inline-flex text-xl text-primary">
                      <TbReceipt size={16} />
                    </span>
                  </Tooltip>
                </div>
              ) : null}
              <div className="text-xs text-gray-500">
                شناسه: {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "نوع",
        accessorKey: "direction",
        cell: ({ row }) => (
          <WalletDirectionTag
            direction={row.original.direction}
            label={row.original.directionLabel}
          />
        ),
      },
      {
        header: "مبلغ",
        accessorKey: "amount",
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatMoney(row.original.amount)}
          </span>
        ),
      },
      {
        header: "وضعیت",
        accessorKey: "status",
        cell: ({ row }) => (
          <WalletStatusTag
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
    [],
  )

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-gray-700">
        چیزی پیدا نشد
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <WalletDirectionTag
                    direction={transaction.direction}
                    label={transaction.directionLabel}
                  />
                  {transaction.settlement && (
                    <Tooltip title="این تراکنش درخواست تسویه دارد">
                      <span className="inline-flex shrink-0 text-primary">
                        <TbReceipt size={16} />
                      </span>
                    </Tooltip>
                  )}
                  <h4 className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {transaction.typeLabel}
                  </h4>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500">
                  شناسه: {transaction.id}
                </div>
              </div>
              <div className="shrink-0 text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {formatMoney(transaction.amount)}
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-end gap-1 text-[11px] text-gray-500">
                  <WalletStatusTag
                    status={transaction.status}
                    label={transaction.statusLabel}
                  />
                  <span>{formatPersianDate(transaction.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800">
          <Button
            size="xs"
            icon={<TbChevronRight />}
            disabled={pagination.currentPage <= 1}
            onClick={() => updatePagination("page", pagination.currentPage - 1)}
          >
            قبلی
          </Button>
          <span className="text-xs text-gray-500">
            صفحه {pagination.currentPage.toLocaleString("fa-IR")} از{" "}
            {pagination.lastPage.toLocaleString("fa-IR")}
          </span>
          <Button
            size="xs"
            icon={<TbChevronLeft />}
            iconAlignment="end"
            disabled={pagination.currentPage >= pagination.lastPage}
            onClick={() => updatePagination("page", pagination.currentPage + 1)}
          >
            بعدی
          </Button>
        </div>
      </div>

      <div className="hidden min-w-0 overflow-x-auto md:block">
        <DataTable
          columns={columns}
          data={transactions}
          noData={transactions.length === 0}
          pagingData={{
            total: pagination.total,
            pageIndex: pagination.currentPage,
            pageSize: pagination.perPage,
          }}
          onPaginationChange={(page) => updatePagination("page", page)}
          onSelectChange={(pageSize) => updatePagination("perPage", pageSize)}
        />
      </div>
    </>
  )
}

export default WalletTransactionsTable
