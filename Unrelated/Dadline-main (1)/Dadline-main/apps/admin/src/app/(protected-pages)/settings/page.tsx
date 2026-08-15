import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import Pagination from '@/components/admin/Pagination'
import Panel from '@/components/admin/Panel'
import TableEmpty from '@/components/admin/TableEmpty'
import { getAdminOptions } from '@/server/admin/adminData'
import { updateAdminOption } from '@/server/admin/updateOption'
import type { AdminOption } from '@/server/admin/admin.schemas'
import { formatDateTime, toQueryString } from '@/utils/adminFormat'

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const displayValue = (option: AdminOption) => {
    if (option.isSensitive) return ''
    if (option.valueType === 'string') return String(option.value ?? '')
    if (option.valueType === 'null') return ''
    if (option.valueType === 'number' || option.valueType === 'boolean') return String(option.value)
    return JSON.stringify(option.value, null, 2)
}

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams
    const query = toQueryString({ q: params.q, group: params.group, page: params.page })
    const result = await getAdminOptions(query)
    if (!result.data) return <ErrorState message={result.error ?? 'تنظیمات قابل دریافت نیست.'} />

    const { data: options, groups, meta } = result.data
    const paginationParams = new URLSearchParams(query)
    const updated = typeof params.updated === 'string' ? params.updated : null
    const error = typeof params.error === 'string' ? params.error : null

    return (
        <div>
            <AdminPageHeader
                title="تنظیمات سامانه"
                description="مدیریت امن optionهای Laravel؛ مقادیر محرمانه هرگز از API بازگردانده یا در مرورگر نمایش داده نمی‌شوند."
            />

            {updated && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">تنظیم «{updated}» ذخیره شد.</div>}
            {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

            <Panel title="جست‌وجوی تنظیمات">
                <form action="/settings" method="get" className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_240px_auto]">
                    <input className="input" name="q" defaultValue={typeof params.q === 'string' ? params.q : ''} placeholder="جست‌وجو در کلید تنظیم" />
                    <select className="input" name="group" defaultValue={typeof params.group === 'string' ? params.group : ''}>
                        <option value="">همه گروه‌ها</option>
                        {groups.map((group) => <option key={group} value={group}>{group}</option>)}
                    </select>
                    <div className="flex gap-2"><button className="button bg-primary text-white" type="submit">جست‌وجو</button><a className="button border border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" href="/settings">پاک کردن</a></div>
                </form>
            </Panel>

            <div className="mt-6 space-y-4">
                {options.length === 0 ? <Panel title="نتیجه"><TableEmpty /></Panel> : options.map((option) => {
                    const action = updateAdminOption.bind(null, option.id)
                    return (
                        <form key={option.id} id={`option-${option.id}`} action={action} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <input type="hidden" name="key" value={option.key} />
                            <input type="hidden" name="valueType" value={option.valueType} />
                            <input type="hidden" name="isSensitive" value={option.isSensitive ? '1' : '0'} />
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <code className="break-all rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-100">{option.key}</code>
                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{option.group}</span>
                                        {option.isSensitive && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">محرمانه {option.hasValue ? 'و تنظیم‌شده' : 'و خالی'}</span>}
                                        {option.autoload && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">autoload</span>}
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">آخرین تغییر: {formatDateTime(option.updatedAt)} — نوع مقدار: {option.valueType}</p>
                                </div>
                                <button type="submit" className="button bg-primary text-white">ذخیره تغییر</button>
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_140px]">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                    گروه
                                    <input className="input mt-2 w-full" name="group" defaultValue={option.group} required />
                                </label>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                    مقدار
                                    {option.valueType === 'array' || option.valueType === 'object' ? (
                                        <textarea className="input mt-2 min-h-36 w-full font-mono text-xs" name="value" defaultValue={displayValue(option)} placeholder={option.isSensitive ? 'برای حفظ مقدار فعلی خالی بگذارید' : 'JSON معتبر وارد کنید'} />
                                    ) : (
                                        <input className="input mt-2 w-full" type={option.isSensitive ? 'password' : 'text'} name="value" defaultValue={displayValue(option)} placeholder={option.isSensitive ? 'برای حفظ مقدار فعلی خالی بگذارید' : ''} />
                                    )}
                                </label>
                                <label className="flex items-center gap-3 self-end rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold dark:border-gray-700">
                                    <input type="checkbox" name="autoload" defaultChecked={option.autoload} />
                                    بارگذاری خودکار
                                </label>
                            </div>
                        </form>
                    )
                })}
                <Pagination meta={meta} pathname="/settings" params={paginationParams} />
            </div>
        </div>
    )
}

export default Page
