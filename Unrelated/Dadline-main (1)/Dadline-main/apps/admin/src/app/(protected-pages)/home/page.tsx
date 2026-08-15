import Link from 'next/link'
import {
    PiArrowLeftBold,
    PiBriefcaseDuotone,
    PiChartLineUpDuotone,
    PiCoinsDuotone,
    PiHandshakeDuotone,
    PiReceiptDuotone,
    PiUsersThreeDuotone,
    PiWalletDuotone,
} from 'react-icons/pi'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import FinancialTrend from '@/components/admin/FinancialTrend'
import Panel from '@/components/admin/Panel'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import TableEmpty from '@/components/admin/TableEmpty'
import { getAdminDashboard } from '@/server/admin/adminData'
import { formatDateTime, formatMoney, formatNumber } from '@/utils/adminFormat'

const Page = async () => {
    const result = await getAdminDashboard()

    if (!result.data) {
        return <ErrorState message={result.error ?? 'داشبورد قابل دریافت نیست.'} />
    }

    const dashboard = result.data
    const finance = dashboard.summary.finance
    const users = dashboard.summary.users
    const operations = dashboard.summary.operations

    return (
        <div>
            <AdminPageHeader
                title="داشبورد مدیریت دادلاین"
                description={`آخرین به‌روزرسانی: ${formatDateTime(dashboard.generatedAt)} — نمای یکپارچه مالی، کاربران و عملیات سامانه`}
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="درآمد خالص ثبت‌شده"
                    value={formatMoney(finance.income)}
                    hint={`خالص پس از هزینه‌ها: ${formatMoney(finance.net)}`}
                    icon={<PiChartLineUpDuotone />}
                />
                <StatCard
                    title="هزینه‌های ثبت‌شده"
                    value={formatMoney(finance.expense)}
                    hint={`برداشت‌های تکمیل‌شده: ${formatMoney(finance.completedWithdrawals)}`}
                    icon={<PiReceiptDuotone />}
                />
                <StatCard
                    title="موجودی کل کیف پول‌ها"
                    value={formatMoney(finance.walletBalance)}
                    hint={`برداشت در انتظار: ${formatMoney(finance.pendingWithdrawals)}`}
                    icon={<PiWalletDuotone />}
                />
                <StatCard
                    title="کاربران سامانه"
                    value={formatNumber(users.total)}
                    hint={`${formatNumber(users.vendors)} ارائه‌دهنده خدمت، ${formatNumber(users.today)} ثبت‌نام امروز`}
                    icon={<PiUsersThreeDuotone />}
                />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
                <Panel
                    title="روند مالی ۱۴ روز اخیر"
                    description="مبالغ تاییدشده دفتر مالی"
                    action={
                        <Link className="text-sm font-bold text-primary" href="/finance/ledger">
                            مشاهده دفتر مالی
                        </Link>
                    }
                >
                    <FinancialTrend data={dashboard.financialTrend} />
                </Panel>

                <Panel title="وضعیت عملیات" description="موارد نیازمند توجه مدیر">
                    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-1">
                        {[
                            { title: 'درخواست همکاری در انتظار', count: operations.pendingVendorApplications, icon: PiHandshakeDuotone },
                            { title: 'تیکت‌های باز', count: operations.openTickets, icon: PiBriefcaseDuotone },
                            { title: 'درخواست خدمات فعال', count: operations.activeServiceRequests, icon: PiCoinsDuotone },
                            { title: 'سرویس خارجی ناموفق در ۲۴ ساعت', count: operations.failedExternalServices, icon: PiReceiptDuotone },
                        ].map(({ title, count, icon: Icon }) => (
                            <Link
                                key={title}
                                href="/operations"
                                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-primary/30 hover:bg-primary/[0.03] dark:border-gray-800"
                            >
                                <span className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                                    <span className="text-xl text-primary"><Icon /></span>
                                    {title}
                                </span>
                                <span className="text-lg font-black text-gray-950 dark:text-white">
                                    {formatNumber(Number(count))}
                                </span>
                            </Link>
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-2">
                <Panel
                    title="آخرین کاربران"
                    action={
                        <Link className="flex items-center gap-2 text-sm font-bold text-primary" href="/users">
                            همه کاربران <PiArrowLeftBold />
                        </Link>
                    }
                >
                    {dashboard.recentUsers.length === 0 ? (
                        <TableEmpty />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-right text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50">
                                    <tr>
                                        <th className="px-5 py-3">کاربر</th>
                                        <th className="px-5 py-3">نقش</th>
                                        <th className="px-5 py-3">موجودی</th>
                                        <th className="px-5 py-3">ثبت‌نام</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {dashboard.recentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{user.fullName}</div>
                                                <div className="mt-1 text-xs text-gray-500" dir="ltr">{user.mobile}</div>
                                            </td>
                                            <td className="px-5 py-4">{user.roleLabel}</td>
                                            <td className="px-5 py-4 font-bold">{formatMoney(user.walletBalance)}</td>
                                            <td className="px-5 py-4 text-gray-500">{formatDateTime(user.registeredAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>

                <Panel
                    title="آخرین تراکنش‌ها"
                    action={
                        <Link className="flex items-center gap-2 text-sm font-bold text-primary" href="/finance/transactions">
                            همه تراکنش‌ها <PiArrowLeftBold />
                        </Link>
                    }
                >
                    {dashboard.recentTransactions.length === 0 ? (
                        <TableEmpty />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-right text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50">
                                    <tr>
                                        <th className="px-5 py-3">کاربر</th>
                                        <th className="px-5 py-3">نوع</th>
                                        <th className="px-5 py-3">مبلغ</th>
                                        <th className="px-5 py-3">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {dashboard.recentTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{transaction.user.fullName}</div>
                                                <div className="mt-1 text-xs text-gray-500" dir="ltr">{transaction.user.mobile ?? '—'}</div>
                                            </td>
                                            <td className="px-5 py-4">{transaction.typeLabel}</td>
                                            <td className="px-5 py-4 font-black">{formatMoney(transaction.amount)}</td>
                                            <td className="px-5 py-4"><StatusBadge status={transaction.status} label={transaction.statusLabel} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    )
}

export default Page
