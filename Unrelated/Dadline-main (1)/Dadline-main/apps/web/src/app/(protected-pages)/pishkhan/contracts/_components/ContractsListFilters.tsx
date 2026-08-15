"use client"

import Button from "@/components/ui/Button"
import DatePicker from "@/components/ui/DatePicker"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { contractStatusOptions } from "./contract-ui"
import { TbSearch, TbX } from "react-icons/tb"
import { useRouter } from "next/navigation"
import { useState } from "react"
import dayjs from "dayjs"
import type { ContractStatus } from "@/@types/contracts"

type Props = {
  initial: {
    q?: string
    status?: ContractStatus | "all"
    dateFrom?: string
    dateTo?: string
  }
}

const ContractsListFilters = ({ initial }: Props) => {
  const router = useRouter()
  const [q, setQ] = useState(initial.q ?? "")
  const [status, setStatus] = useState(initial.status ?? "all")
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    initial.dateFrom ? new Date(initial.dateFrom) : null,
    initial.dateTo ? new Date(initial.dateTo) : null,
  ])

  const applyFilters = () => {
    const query = new URLSearchParams()
    if (q.trim()) query.set("q", q.trim())
    if (status !== "all") query.set("status", status)
    if (dateRange[0])
      query.set("dateFrom", dayjs(dateRange[0]).format("YYYY-MM-DD"))
    if (dateRange[1])
      query.set("dateTo", dayjs(dateRange[1]).format("YYYY-MM-DD"))
    router.push(`/pishkhan/contracts${query.toString() ? `?${query}` : ""}`)
  }

  const resetFilters = () => {
    setQ("")
    setStatus("all")
    setDateRange([null, null])
    router.push("/pishkhan/contracts")
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_340px_auto]">
      <Input
        value={q}
        prefix={<TbSearch className="text-lg" />}
        placeholder="جستجو در عنوان یا نام طرفین"
        onChange={(event) => setQ(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") applyFilters()
        }}
      />
      <Select
        instanceId="contract-status-filter"
        isSearchable={false}
        value={contractStatusOptions.find((item) => item.value === status)}
        options={[...contractStatusOptions]}
        onChange={(option) =>
          setStatus((option?.value ?? "all") as ContractStatus | "all")
        }
      />
      <DatePicker.DatePickerRange
        inputFormat="jYYYY/jMM/jDD"
        separator="تا"
        placeholder="بازه تاریخ قرارداد"
        value={dateRange}
        onChange={setDateRange}
      />
      <div className="flex gap-2">
        <Button variant="solid" onClick={applyFilters}>
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

export default ContractsListFilters
