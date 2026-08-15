import { PiCalculatorDuotone, PiChartLineDownDuotone, PiChartLineUpDuotone, PiPercentDuotone } from 'react-icons/pi'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import Pagination from '@/components/admin/Pagination'
import Panel from '@/components/admin/Panel'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import TableEmpty from '@/components/admin/TableEmpty'
import { getAdminFinancials } from '@/server/admin/adminData'
import { formatDateTime, formatMoney, formatNumber, toQueryString } from '@/utils/adminFormat'

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams
    const query = toQueryString(params)
    const result = await getAdminFinancials(query)
    if (!result.data) return <ErrorState message={result.error ?? 'دفتر مالی قابل دریافت نیست.'} />

    const { data: rows, meta, summary, filters } = result.data
    const paginationParams = new URLSearchParams(query)

    return (
        <div>
            <AdminPageHeader title="دفتر درآمد و هزینه" description="گزارش مبالغ ناخالص، مالیات، خالص درآمد و هزینه‌های ثبت‌شده در Laravel" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="درآمد" value={formatMoney(summary.income)} icon={<PiChartLineUpDuotone />} />
                <StatCard title="هزینه" value={formatMoney(summary.expense)} icon={<PiChartLineDownDuotone />} />
                <StatCard title="خالص" value={formatMoney(summary.net)} icon={<PiCalculatorDuotone />} />
                <StatCard title="مالیات ثبت‌شده" value={formatMoney(summary.vat)} icon={<PiPercentDuotone />} />
            </div>

            <Panel title="فیلتر دفتر مالی" className="mt-6">
                <form action="/finance/ledger" method="get" className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
                    <select className="input" name="direction" defaultValue={typeof params.direction === 'string' ? params.direction : ''}>
                        <option value="">همه جهت‌ها</option>
                        {Object.entries(filters.directions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select className="input" name="status" defaultValue={typeof params.status === 'string' ? params.status : ''}>
                        <option value="">همه وضعیت‌ها</option>
                        {Object.entries(filters.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <input className="input" type="date" name="date_from" defaultValue={typeof params.date_from === 'string' ? params.date_from : ''} />
                    <input className="input" type="date" name="date_to" defaultValue={typeof params.date_to === 'string' ? params.date_to : ''} />
                    <div className="flex gap-2"><button className="button bg-primary text-white" type="submit">اعمال</button><a className="button border border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" href="/finance/ledger">پاک کردن</a></div>
                </form>
            </Panel>

            <Panel title={`ردیف‌های مالی (${formatNumber(meta.total)})`} className="mt-6">
                {rows.length === 0 ? <TableEmpty /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr>
                                <th className="px-5 py-3">شناسه</th><th className="px-5 py-3">جهت</th><th className="px-5 py-3">ناخالص</th><th className="px-5 py-3">مالیات</th><th className="px-5 py-3">خالص</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">آیتم مرجع</th><th className="px-5 py-3">تاریخ</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.map((row) => <tr key={row.id}>
                                    <td className="px-5 py-4 font-mono text-xs">#{row.id}</td><td className="px-5 py-4">{row.directionLabel}</td>
                                    <td className="px-5 py-4">{formatMoney(row.grossAmount)}</td><td className="px-5 py-4">{formatMoney(row.vatAmount)}</td>
                                    <td className="px-5 py-4 font-black">{formatMoney(row.netAmount)}</td><td className="px-5 py-4"><StatusBadge status={row.status} label={row.statusLabel} /></td>
                                    <td className="px-5 py-4">{row.itemId ? `#${row.itemId}` : '—'}</td><td className="px-5 py-4 text-gray-500">{formatDateTime(row.occurredAt)}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination meta={meta} pathname="/finance/ledger" params={paginationParams} />
            </Panel>
        </div>
    )
}

export default Page
