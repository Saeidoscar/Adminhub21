"use client"
// donutTitle="خالص"

import Chart from "@/components/shared/Chart"
import { COLORS } from "@/constants/chart.constant"
import type { ReactNode } from "react"
import { TbArrowDownRight, TbArrowUpRight, TbChartPie } from "react-icons/tb"
import { formatMoney } from "./wallet-ui"
import type { WalletStats } from "@/@types/wallet"

type Props = {
  stats: WalletStats
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-base text-primary">{icon}</span>
        {label}
      </div>
      <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  )
}

const WalletStatsSidebar = ({ stats }: Props) => {
  const totalByType = stats.byType.reduce(
    (sum, item) =>
      sum +
      item.amount,
    0,
  )
  const chartItems =
    stats.byType.length >
    0
      ? stats.byType
      : [
          {
            type: "empty",
            typeLabel: "بدون تراکنش",
            amount: 1,
            count: 0,
          },
        ]
  const chartSeries = chartItems.map((item) => item.amount)
  const chartLabels = chartItems.map((item) => item.typeLabel)

  return (
    <aside className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              در یک نگاه
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              گزارش عملکرد مالی شما
            </p>
          </div>
          <span className="rounded-lg bg-primary/10 p-2 text-xl text-primary">
            <TbChartPie />
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <StatRow
            icon={<TbArrowDownRight />}
            label="کل واریزی‌ها"
            value={formatMoney(stats.totalDeposits)}
          />
          <StatRow
            icon={<TbArrowUpRight />}
            label="کل پرداختی‌ها"
            value={formatMoney(stats.totalWithdrawals)}
          />
          <StatRow
            icon={<TbChartPie />}
            label="تعداد تراکنش"
            value={stats.transactionCount.toLocaleString("fa-IR")}
          />
        </div>

        <div className="mt-4 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
          <Chart
            type="donut"
            height={220}
            series={chartSeries}
            donutText={formatMoney(stats.netAmount)}
            customOptions={{
              colors: COLORS,
              labels: chartLabels,
              tooltip: {
                y: {
                  formatter: (value) =>
                    totalByType > 0
                      ? formatMoney(Number(value))
                      : "بدون تراکنش",
                },
              },
              responsive: [
                {
                  breakpoint: 480,
                  options: {
                    chart: {
                      width: 220,
                    },
                    legend: {
                      position: "bottom",
                    },
                  },
                },
              ],
            }}
          />
        </div>

        <div className="mt-4 space-y-2">
          {stats.byType.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-500 dark:border-gray-700">
              برای فیلتر انتخاب‌شده تراکنشی وجود ندارد.
            </div>
          ) : (
            stats.byType.map((item, index) => {
              const percent =
                totalByType > 0 ? (item.amount / totalByType) * 100 : 0

              return (
                <div
                  key={item.type ?? "unknown"}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="truncate text-gray-700 dark:text-gray-200">
                      {item.typeLabel}
                    </span>
                  </div>
                  <div className="shrink-0 text-left leading-5 text-gray-500">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {formatMoney(item.amount)}
                    </span>
                    <span className="ms-1">
                      {percent.toLocaleString("fa-IR", {
                        maximumFractionDigits: 1,
                      })}
                      ٪
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}

export default WalletStatsSidebar
