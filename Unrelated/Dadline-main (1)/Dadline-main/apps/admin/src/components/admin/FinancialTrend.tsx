import { formatDate, formatMoney } from '@/utils/adminFormat'

type Point = { date: string; income: number; expense: number }

const FinancialTrend = ({ data }: { data: Point[] }) => {
    const max = Math.max(1, ...data.flatMap((item) => [item.income, item.expense]))

    return (
        <div className="p-5">
            <div className="mb-5 flex gap-5 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-emerald-500" /> درآمد</span>
                <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-red-400" /> هزینه</span>
            </div>
            <div className="flex h-64 items-end gap-2 overflow-x-auto pb-2">
                {data.map((item) => (
                    <div key={item.date} className="flex min-w-12 flex-1 flex-col items-center gap-2">
                        <div className="flex h-48 w-full items-end justify-center gap-1" title={`درآمد: ${formatMoney(item.income)} | هزینه: ${formatMoney(item.expense)}`}>
                            <div className="w-2.5 rounded-t bg-emerald-500" style={{ height: `${Math.max(2, (item.income / max) * 100)}%` }} />
                            <div className="w-2.5 rounded-t bg-red-400" style={{ height: `${Math.max(2, (item.expense / max) * 100)}%` }} />
                        </div>
                        <span className="whitespace-nowrap text-[10px] text-gray-500">{formatDate(item.date)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FinancialTrend
