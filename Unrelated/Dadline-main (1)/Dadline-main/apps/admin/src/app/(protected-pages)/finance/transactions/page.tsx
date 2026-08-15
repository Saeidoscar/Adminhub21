import {
    PiArrowDownLeftDuotone,
    PiArrowUpRightDuotone,
    PiCheckCircleDuotone,
    PiListChecksDuotone,
} from 'react-icons/pi'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import Pagination from '@/components/admin/Pagination'
import Panel from '@/components/admin/Panel'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import TableEmpty from '@/components/admin/TableEmpty'
import { getAdminTransactions } from '@/server/admin/adminData'
import { formatDateTime, formatMoney, formatNumber, toQueryString } from '@/utils/adminFormat'

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams
    const query = toQueryString(params)
    const result = await getAdminTransactions(query)
    if (!result.data) return <ErrorState message={result.error ?? 'تراکنش‌ها قابل دریافت نیستند.'} />

    const { data: transactions, meta, summary, filters } = result.data
    const paginationParams = new URLSearchParams(query)

    return (
        <div>
            <AdminPageHeader title="تراکنش‌های کیف پول" description="گزارش کامل واریز، برداشت، نوع عملیات، وضعیت تسویه و کاربران مرتبط" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="تعداد تراکنش" value={formatNumber(summary.count)} icon={<PiListChecksDuotone />} />
                <StatCard title="جمع واریز" value={formatMoney(summary.deposits)} icon={<PiArrowDownLeftDuotone />} />
                <StatCard title="جمع برداشت" value={formatMoney(summary.withdrawals)} icon={<PiArrowUpRightDuotone />} />
                <StatCard title="مبلغ تکمیل‌شده" value={formatMoney(summary.completed)} icon={<PiCheckCircleDuotone />} />
            </div>

            <Panel title="فیلتر تراکنش‌ها" className="mt-6">
                <form action="/finance/transactions" method="get" className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-6">
                    <input className="input" name="q" defaultValue={typeof params.q === 'string' ? params.q : ''} placeholder="نام، موبایل یا ایمیل" />
                    <select className="input" name="direction" defaultValue={typeof params.direction === 'string' ? params.direction : ''}>
                        <option value="">همه جهت‌ها</option>
                        {Object.entries(filters.directions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select className="input" name="status" defaultValue={typeof params.status === 'string' ? params.status : ''}>
                        <option value="">همه وضعیت‌ها</option>
                        {Object.entries(filters.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select className="input" name="type" defaultValue={typeof params.type === 'string' ? params.type : ''}>
                        <option value="">همه انواع</option>
                        {Object.entries(filters.types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <input className="input" type="date" name="date_from" defaultValue={typeof params.date_from === 'string' ? params.date_from : ''} />
                    <div className="flex gap-2">
                        <button className="button bg-primary text-white" type="submit">اعمال</button>
                        <a className="button border border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" href="/finance/transactions">پاک کردن</a>
                    </div>
                </form>
            </Panel>

            <Panel title={`فهرست تراکنش‌ها (${formatNumber(meta.total)})`} className="mt-6">
                {transactions.length === 0 ? <TableEmpty /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50">
                                <tr>
                                    <th className="px-5 py-3">شناسه</th><th className="px-5 py-3">کاربر</th><th className="px-5 py-3">نوع</th>
                                    <th className="px-5 py-3">جهت</th><th className="px-5 py-3">مبلغ</th><th className="px-5 py-3">وضعیت</th>
                                    <th className="px-5 py-3">تسویه</th><th className="px-5 py-3">تاریخ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="px-5 py-4 font-mono text-xs">#{transaction.id}</td>
                                        <td className="px-5 py-4"><div className="font-black">{transaction.user.fullName}</div><div className="mt-1 text-xs text-gray-500" dir="ltr">{transaction.user.mobile ?? '—'}</div></td>
                                        <td className="px-5 py-4">{transaction.typeLabel}</td>
                                        <td className="px-5 py-4">{transaction.directionLabel}</td>
                                        <td className="px-5 py-4 font-black">{formatMoney(transaction.amount)}</td>
                                        <td className="px-5 py-4"><StatusBadge status={transaction.status} label={transaction.statusLabel} /></td>
                                        <td className="px-5 py-4">{transaction.settlementStatus ? <StatusBadge status={transaction.settlementStatus} /> : '—'}</td>
                                        <td className="px-5 py-4 text-gray-500">{formatDateTime(transaction.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination meta={meta} pathname="/finance/transactions" params={paginationParams} />
            </Panel>
        </div>
    )
}

export default Page
