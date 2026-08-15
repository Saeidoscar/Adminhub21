"use client"

// return (
//     <div className="grid gap-3 xl:grid-cols-[170px_190px_190px_minmax(280px,1fr)_auto]">
//         <Select
//             instanceId="wallet-direction-filter"
//             isSearchable={false}
//             value={directionOptions.find((item) => item.value === direction)}
//             options={[...directionOptions]}
//             onChange={(option) =>
//                 setDirection((option?.value ?? 'all') as WalletDirection | 'all')
//             }
//         />
//         <Select
//             instanceId="wallet-type-filter"
//             isSearchable={false}
//             value={typeOptions.find((item) => item.value === type)}
//             options={[...typeOptions]}
//             onChange={(option) =>
//                 setType((option?.value ?? 'all') as WalletTransactionType | 'all')
//             }
//         />
//         <Select
//             instanceId="wallet-status-filter"
//             isSearchable={false}
//             value={statusOptions.find((item) => item.value === status)}
//             options={[...statusOptions]}
//             onChange={(option) =>
//                 setStatus(
//                     (option?.value ?? 'all') as WalletTransactionStatus | 'all',
//                 )
//             }
//         />
//         <DatePicker.DatePickerRange
//             inputFormat="jYYYY/jMM/jDD"
//             separator="تا"
//             placeholder="بازه تاریخ تراکنش"
//             value={dateRange}
//             onChange={setDateRange}
//         />
//         <div className="flex gap-2">
//             <Button variant="solid" icon={<TbFilter />} onClick={applyFilters}>
//                 اعمال
//             </Button>
//             <Button
//                 icon={<TbX />}
//                 onClick={resetFilters}
//                 aria-label="حذف فیلترها"
//             />
//         </div>
//     </div>
// )

import Button from "@/components/ui/Button"
import DatePicker from "@/components/ui/DatePicker"
import Select from "@/components/ui/Select"
import { TbFilter, TbX } from "react-icons/tb"
import { useRouter } from "next/navigation"
import { useState } from "react"
import dayjs from "dayjs"
import { directionOptions, statusOptions } from "./wallet-ui"
import type {
  WalletDirection,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/@types/wallet"

type Props = {
  initial: {
    direction?: WalletDirection | "all"
    type?: WalletTransactionType | "all"
    status?: WalletTransactionStatus | "all"
    dateFrom?: string
    dateTo?: string
  }
}

const typeOptions = [
  { value: "all", label: "همه تراکنش‌ها" },
  { value: "online_charge", label: "شارژ کیف پول" },
  { value: "gift_card", label: "کارت هدیه" },
  { value: "deposit_income", label: "تسویه درآمد" },
  { value: "contract_cost", label: "قرارداد" },
  { value: "contract_ai", label: "تحلیل قرارداد" },
  { value: "verify_cost", label: "احراز هویت" },
  { value: "marketing", label: "همکاری در فروش" },
] as const

const WalletFilters = ({ initial }: Props) => {
  const router = useRouter()
  const [direction, setDirection] = useState(
    initial.direction ??
      "all",
  )
  const [type, setType] = useState(
    initial.type ??
      "all",
  )
  const [status, setStatus] = useState(
    initial.status ??
      "all",
  )
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    initial.dateFrom ? new Date(initial.dateFrom) : null,
    initial.dateTo ? new Date(initial.dateTo) : null,
  ])

  const applyFilters = () => {
    const query = new URLSearchParams()
    if (
      direction !==
      "all"
    )
      query.set("direction", direction)
    if (
      type !==
      "all"
    )
      query.set("type", type)
    if (
      status !==
      "all"
    )
      query.set("status", status)
    if (dateRange[0])
      query.set("dateFrom", dayjs(dateRange[0]).format("YYYY-MM-DD"))
    if (dateRange[1])
      query.set("dateTo", dayjs(dateRange[1]).format("YYYY-MM-DD"))
    router.push(`/pishkhan/wallet${query.toString() ? `?${query}` : ""}`)
  }

  const resetFilters = () => {
    setDirection("all")
    setType("all")
    setStatus("all")
    setDateRange([null, null])
    router.push("/pishkhan/wallet")
  }
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[170px_190px_190px_minmax(280px,1fr)_auto]">
      <div className="min-w-0">
        <Select
          instanceId="wallet-direction-filter"
          isSearchable={false}
          value={directionOptions.find((item) => item.value === direction)}
          options={[...directionOptions]}
          onChange={(option) =>
            setDirection((option?.value ?? "all") as WalletDirection | "all")
          }
        />
      </div>

      <div className="min-w-0">
        <Select
          instanceId="wallet-type-filter"
          isSearchable={false}
          value={typeOptions.find((item) => item.value === type)}
          options={[...typeOptions]}
          onChange={(option) =>
            setType((option?.value ?? "all") as WalletTransactionType | "all")
          }
        />
      </div>

      <div className="min-w-0">
        <Select
          instanceId="wallet-status-filter"
          isSearchable={false}
          value={statusOptions.find((item) => item.value === status)}
          options={[...statusOptions]}
          onChange={(option) =>
            setStatus(
              (option?.value ?? "all") as WalletTransactionStatus | "all",
            )
          }
        />
      </div>

      <div className="min-w-0 sm:col-span-2 xl:col-span-1">
        <DatePicker.DatePickerRange
          className="w-full"
          inputFormat="jYYYY/jMM/jDD"
          separator="تا"
          placeholder="بازه تاریخ تراکنش"
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2 sm:col-span-2 xl:col-span-1">
        <Button
          className="w-full"
          variant="solid"
          icon={<TbFilter />}
          onClick={applyFilters}
        >
          اعمال
        </Button>

        <Button
          icon={<TbX />}
          onClick={resetFilters}
          aria-label="حذف فیلترها"
        />
      </div>
    </div>
  )
}

export default WalletFilters
