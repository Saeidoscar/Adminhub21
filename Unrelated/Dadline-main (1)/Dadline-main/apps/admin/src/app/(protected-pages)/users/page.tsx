import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import Pagination from '@/components/admin/Pagination'
import Panel from '@/components/admin/Panel'
import StatusBadge from '@/components/admin/StatusBadge'
import TableEmpty from '@/components/admin/TableEmpty'
import { getAdminUsers } from '@/server/admin/adminData'
import { formatDateTime, formatMoney, toQueryString } from '@/utils/adminFormat'

type PageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams
    const query = toQueryString(params)
    const result = await getAdminUsers(query)

    if (!result.data) return <ErrorState message={result.error ?? 'لیست کاربران قابل دریافت نیست.'} />

    const { data: users, meta, filters } = result.data
    const paginationParams = new URLSearchParams(query)

    return (
        <div>
            <AdminPageHeader
                title="مدیریت کاربران"
                description="جست‌وجو و گزارش کاربران، ارائه‌دهندگان خدمات، نقش‌ها و وضعیت کیف پول"
            />

            <Panel title="فیلتر کاربران">
                <form action="/users" method="get" className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
                    <input
                        className="input"
                        name="q"
                        defaultValue={typeof params.q === 'string' ? params.q : ''}
                        placeholder="نام، موبایل یا ایمیل"
                    />
                    <select className="input" name="role" defaultValue={typeof params.role === 'string' ? params.role : ''}>
                        <option value="">همه نقش‌ها</option>
                        {Object.entries(filters.roles).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <select className="input" name="is_vendor" defaultValue={typeof params.is_vendor === 'string' ? params.is_vendor : ''}>
                        <option value="">همه کاربران</option>
                        <option value="1">فقط ارائه‌دهندگان</option>
                        <option value="0">فقط کاربران عادی</option>
                    </select>
                    <input className="input" type="date" name="date_from" defaultValue={typeof params.date_from === 'string' ? params.date_from : ''} />
                    <div className="flex gap-2">
                        <button className="button bg-primary text-white" type="submit">اعمال فیلتر</button>
                        <a className="button border border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" href="/users">پاک کردن</a>
                    </div>
                </form>
            </Panel>

            <Panel title={`کاربران (${new Intl.NumberFormat('fa-IR').format(meta.total)})`} className="mt-6">
                {users.length === 0 ? (
                    <TableEmpty message="کاربری مطابق فیلترها پیدا نشد." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-right text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950/50">
                                <tr>
                                    <th className="px-5 py-3">شناسه</th>
                                    <th className="px-5 py-3">کاربر</th>
                                    <th className="px-5 py-3">نقش</th>
                                    <th className="px-5 py-3">نوع حساب</th>
                                    <th className="px-5 py-3">موجودی کیف پول</th>
                                    <th className="px-5 py-3">آخرین ورود</th>
                                    <th className="px-5 py-3">تاریخ ثبت‌نام</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-5 py-4 font-mono text-xs">#{user.id}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-black text-gray-900 dark:text-white">{user.fullName}</div>
                                            <div className="mt-1 flex gap-3 text-xs text-gray-500">
                                                <span dir="ltr">{user.mobile}</span>
                                                <span>{user.email ?? 'بدون ایمیل'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">{user.roleLabel}</td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={user.isVendor ? 'active' : 'default'} label={user.isVendor ? 'ارائه‌دهنده' : 'کاربر'} />
                                        </td>
                                        <td className="px-5 py-4 font-black">{formatMoney(user.walletBalance)}</td>
                                        <td className="px-5 py-4 text-gray-500">{formatDateTime(user.lastLoginAt)}</td>
                                        <td className="px-5 py-4 text-gray-500">{formatDateTime(user.registeredAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination meta={meta} pathname="/users" params={paginationParams} />
            </Panel>
        </div>
    )
}

export default Page
