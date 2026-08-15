import Link from 'next/link'
import {
    PiBriefcaseDuotone,
    PiHandshakeDuotone,
    PiHeadsetDuotone,
    PiWarningCircleDuotone,
} from 'react-icons/pi'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import Panel from '@/components/admin/Panel'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import TableEmpty from '@/components/admin/TableEmpty'
import { getAdminOperations } from '@/server/admin/adminData'
import { formatDateTime, formatMoney, formatNumber } from '@/utils/adminFormat'

const Page = async () => {
    const result = await getAdminOperations()
    if (!result.data) return <ErrorState message={result.error ?? 'گزارش عملیات قابل دریافت نیست.'} />

    const operations = result.data
    const counts = operations.counts

    return (
        <div>
            <AdminPageHeader
                title="مرکز عملیات سامانه"
                description="نمای یکپارچه درخواست همکاری، تیکت‌ها، قراردادها، سفارش‌ها، خدمات، مشاوره و سرویس‌های خارجی"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="درخواست همکاری در انتظار" value={formatNumber(counts.pendingVendorApplications)} icon={<PiHandshakeDuotone />} />
                <StatCard title="تیکت باز" value={formatNumber(counts.openTickets)} icon={<PiHeadsetDuotone />} />
                <StatCard title="درخواست خدمت فعال" value={formatNumber(counts.activeServiceRequests)} icon={<PiBriefcaseDuotone />} />
                <StatCard title="خطای سرویس خارجی در ۲۴ ساعت" value={formatNumber(counts.failedExternalServices)} icon={<PiWarningCircleDuotone />} />
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-2">
                <Panel title="آخرین درخواست‌های همکاری">
                    {operations.vendorApplications.length === 0 ? <TableEmpty /> : (
                        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">متقاضی</th><th className="px-5 py-3">نقش درخواستی</th><th className="px-5 py-3">هزینه</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">تاریخ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.vendorApplications.map((item) => <tr key={item.id}>
                                <td className="px-5 py-4"><div className="font-black">{item.user}</div><div className="mt-1 text-xs text-gray-500" dir="ltr">{item.mobile ?? '—'}</div></td>
                                <td className="px-5 py-4">{item.targetRoleLabel}</td><td className="px-5 py-4 font-bold">{formatMoney(item.price)}</td>
                                <td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.createdAt)}</td>
                            </tr>)}</tbody>
                        </table></div>
                    )}
                </Panel>

                <Panel title="آخرین تیکت‌ها">
                    {operations.tickets.length === 0 ? <TableEmpty /> : (
                        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">عنوان</th><th className="px-5 py-3">فرستنده</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">آخرین تغییر</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.tickets.map((item) => <tr key={item.uuid}>
                                <td className="px-5 py-4 font-black"><Link className="text-primary hover:underline" href={`/tickets/${item.uuid}`}>{item.title}</Link></td><td className="px-5 py-4"><div>{item.sender}</div><div className="mt-1 text-xs text-gray-500" dir="ltr">{item.mobile ?? '—'}</div></td>
                                <td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.updatedAt)}</td>
                            </tr>)}</tbody>
                        </table></div>
                    )}
                </Panel>

                <Panel title="آخرین قراردادها">
                    {operations.contracts.length === 0 ? <TableEmpty /> : (
                        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">عنوان</th><th className="px-5 py-3">سازنده</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">تاریخ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.contracts.map((item) => <tr key={item.uuid}>
                                <td className="px-5 py-4 font-black">{item.title}</td><td className="px-5 py-4">{item.creator}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.createdAt)}</td>
                            </tr>)}</tbody>
                        </table></div>
                    )}
                </Panel>

                <Panel title="آخرین سفارش‌ها">
                    {operations.orders.length === 0 ? <TableEmpty /> : (
                        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">شناسه</th><th className="px-5 py-3">خریدار</th><th className="px-5 py-3">مبلغ</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">تاریخ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.orders.map((item) => <tr key={item.id}>
                                <td className="px-5 py-4 font-mono text-xs">#{item.id}</td><td className="px-5 py-4"><div className="font-black">{item.buyer}</div><div className="mt-1 text-xs text-gray-500" dir="ltr">{item.mobile ?? '—'}</div></td>
                                <td className="px-5 py-4 font-black">{formatMoney(item.totalPrice)}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.createdAt)}</td>
                            </tr>)}</tbody>
                        </table></div>
                    )}
                </Panel>

                <Panel title="آخرین درخواست‌های خدمات">
                    {operations.serviceRequests.length === 0 ? <TableEmpty /> : (
                        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">عنوان</th><th className="px-5 py-3">درخواست‌کننده</th><th className="px-5 py-3">نوع</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">تاریخ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.serviceRequests.map((item) => <tr key={item.uuid}>
                                <td className="px-5 py-4 font-black">{item.title}</td><td className="px-5 py-4">{item.requester}</td><td className="px-5 py-4">{item.type}</td><td className="px-5 py-4"><StatusBadge status={item.status} label={item.statusLabel} /></td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.createdAt)}</td>
                            </tr>)}</tbody>
                        </table></div>
                    )}
                </Panel>

                <Panel title="آخرین مشاوره‌های تلفنی">
                    {operations.consultations.length === 0 ? <TableEmpty /> : (
                        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">کاربر</th><th className="px-5 py-3">ارائه‌دهنده</th><th className="px-5 py-3">مدت</th><th className="px-5 py-3">مبلغ</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">تاریخ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.consultations.map((item) => <tr key={item.id}>
                                <td className="px-5 py-4 font-black">{item.user}</td><td className="px-5 py-4">{item.vendor ?? 'تخصیص‌نیافته'}</td><td className="px-5 py-4">{formatNumber(item.minutes)} دقیقه</td><td className="px-5 py-4 font-black">{formatMoney(item.price)}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.createdAt)}</td>
                            </tr>)}</tbody>
                        </table></div>
                    )}
                </Panel>
            </div>

            <Panel title="آخرین درخواست‌های سرویس خارجی" description="برای پایش استعلام‌ها، خطاهای provider و هزینه‌های قابل صورتحساب" className="mt-6">
                {operations.externalServices.length === 0 ? <TableEmpty /> : (
                    <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-right text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50"><tr><th className="px-5 py-3">سرویس</th><th className="px-5 py-3">ارائه‌دهنده</th><th className="px-5 py-3">کاربر</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">زمان پاسخ</th><th className="px-5 py-3">صورتحساب</th><th className="px-5 py-3">تاریخ</th></tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{operations.externalServices.map((item) => <tr key={item.uuid}>
                            <td className="px-5 py-4 font-black">{item.service}</td><td className="px-5 py-4">{item.provider}</td><td className="px-5 py-4">{item.user ?? 'مهمان/سیستمی'}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4">{item.durationMs ? `${formatNumber(item.durationMs)} ms` : '—'}</td><td className="px-5 py-4">{item.billable ? formatMoney(item.billedAmount ?? 0) : 'غیرقابل‌صورتحساب'}</td><td className="px-5 py-4 text-gray-500">{formatDateTime(item.createdAt)}</td>
                        </tr>)}</tbody>
                    </table></div>
                )}
            </Panel>
        </div>
    )
}

export default Page
