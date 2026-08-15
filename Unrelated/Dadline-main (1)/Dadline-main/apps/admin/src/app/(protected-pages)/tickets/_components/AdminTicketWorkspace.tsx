'use client'

import type {
    AdminTicket,
    AdminTicketFilters,
    AdminTicketMeta,
} from '@/server/admin/admin.schemas'
import {
    replyAdminTicket,
    updateAdminTicket,
} from '@/server/admin/adminMutations'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, type ReactNode, useEffect, useRef, useState, useTransition } from 'react'
import {
    PiArrowRightDuotone,
    PiBuildingsDuotone,
    PiChatCircleTextDuotone,
    PiClockDuotone,
    PiHeadsetDuotone,
    PiLockKeyDuotone,
    PiPaperPlaneTiltDuotone,
    PiPaperclipDuotone,
    PiXDuotone,
    PiShieldCheckDuotone,
    PiUserCircleGearDuotone,
    PiWarningCircleDuotone,
} from 'react-icons/pi'

type Pagination = { currentPage: number; lastPage: number; perPage: number; total: number }

type Props = {
    tickets: AdminTicket[]
    ticket?: AdminTicket | null
    filters: AdminTicketFilters
    meta: AdminTicketMeta
    pagination: Pagination
    query: string
}

const statusStyle: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    answered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    referred: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

const selectClass = 'input h-10 w-full text-sm'

const AdminTicketWorkspace = ({ tickets, ticket, filters, meta, pagination, query }: Props) => (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className={classNames(
            'grid min-h-[calc(100vh-12rem)]',
            ticket ? 'md:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)_300px]' : 'md:grid-cols-[380px_minmax(0,1fr)]',
        )}>
            <TicketList tickets={tickets} selectedUuid={ticket?.uuid} filters={filters} meta={meta} pagination={pagination} query={query} />
            <section className={classNames('min-w-0', !ticket && 'hidden md:block')}>
                {ticket ? <Conversation ticket={ticket} query={query} /> : <EmptyDetail />}
            </section>
            {ticket && <Management ticket={ticket} meta={meta} />}
        </div>
    </div>
)

const TicketList = ({
    tickets,
    selectedUuid,
    filters,
    meta,
    pagination,
    query,
}: {
    tickets: AdminTicket[]
    selectedUuid?: string
    filters: AdminTicketFilters
    meta: AdminTicketMeta
    pagination: Pagination
    query: string
}) => (
    <aside className={classNames('min-w-0 border-l border-gray-200 dark:border-gray-800', selectedUuid ? 'hidden md:flex md:flex-col' : 'flex flex-col')}>
        <form action="/tickets" method="get" className="space-y-3 border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-black text-gray-950 dark:text-white">صف تیکت‌ها</h2>
                    <p className="mt-1 text-xs text-gray-500">{pagination.total.toLocaleString('fa-IR')} تیکت</p>
                </div>
                <Link href="/tickets/departments" className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">دپارتمان‌ها</Link>
            </div>
            <input className="input" name="q" defaultValue={new URLSearchParams(query).get('q') ?? ''} placeholder="عنوان، کاربر یا موبایل" />
            <div className="grid grid-cols-2 gap-2">
                <select className={selectClass} name="status" defaultValue={new URLSearchParams(query).get('status') ?? ''}>
                    <option value="">همه وضعیت‌ها</option>
                    {Object.entries(filters.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select className={selectClass} name="department_id" defaultValue={new URLSearchParams(query).get('department_id') ?? ''}>
                    <option value="">همه واحدها</option>
                    {filters.departments.map((department) => <option key={department.id} value={department.id}>{department.label}</option>)}
                </select>
                <select className={selectClass} name="priority" defaultValue={new URLSearchParams(query).get('priority') ?? ''}>
                    <option value="">همه اولویت‌ها</option>
                    {Object.entries(filters.priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select className={selectClass} name="assigned_to_id" defaultValue={new URLSearchParams(query).get('assigned_to_id') ?? ''}>
                    <option value="">همه پشتیبان‌ها</option>
                    {filters.supporters.map((supporter) => <option key={supporter.id} value={supporter.id}>{supporter.name}</option>)}
                </select>
                <select className={classNames(selectClass, 'col-span-2')} name="provider_id" defaultValue={new URLSearchParams(query).get('provider_id') ?? ''}>
                    <option value="">همه وکلا و کارشناسان</option>
                    {meta.providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name} — {provider.roleLabel}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
                <button className="button flex-1 bg-primary text-white" type="submit">اعمال فیلتر</button>
                <Link className="button border border-gray-300 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" href="/tickets">پاک‌کردن</Link>
            </div>
        </form>
        <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">تیکتی مطابق فیلترها پیدا نشد.</div>
            ) : tickets.map((item) => (
                <Link
                    key={item.uuid}
                    href={`/tickets/${item.uuid}${query ? `?${query}` : ''}`}
                    className={classNames(
                        'relative block border-b border-gray-100 p-4 transition dark:border-gray-800',
                        item.uuid === selectedUuid ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/70',
                    )}
                >
                    {item.uuid === selectedUuid && <span className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-primary" />}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                {item.hasUnread && item.uuid !== selectedUuid && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                                <h3 className={classNames('truncate text-sm text-gray-900 dark:text-gray-100', item.hasUnread && item.uuid !== selectedUuid && 'font-black')}>{item.title}</h3>
                            </div>
                            <p className="mt-1 truncate text-xs text-gray-500">{item.sender?.name ?? 'کاربر حذف‌شده'} · {item.department.label}</p>
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">{item.lastMessage?.body ?? 'بدون پیام'}</p>
                        </div>
                        <span className={classNames('shrink-0 rounded-full px-2 py-1 text-[10px] font-bold', statusStyle[item.status])}>{item.statusLabel}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
                        <span className={item.priority === 'urgent' ? 'font-bold text-red-600' : ''}>{item.priorityLabel}</span>
                        <span>{formatDate(item.activityAt)}</span>
                    </div>
                </Link>
            ))}
        </div>
        {pagination.lastPage > 1 && <ListPagination pagination={pagination} query={query} />}
    </aside>
)

const Conversation = ({ ticket, query }: { ticket: AdminTicket; query: string }) => {
    const router = useRouter()
    const endRef = useRef<HTMLDivElement>(null)
    const [internal, setInternal] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [pending, startTransition] = useTransition()

    useEffect(() => endRef.current?.scrollIntoView({ block: 'end' }), [ticket.messages?.length])

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const body = formData.get('body')?.toString().trim() ?? ''
        if (body.length < 2) return setError('متن پاسخ را وارد کنید.')
        formData.set('body', body)
        formData.set('is_internal', internal ? '1' : '0')
        setError(null)
        startTransition(async () => {
            const result = await replyAdminTicket(ticket.uuid, formData)
            if (!result.ok) return setError(result.error)
            form.reset()
            setFileName(null)
            setInternal(false)
            router.refresh()
        })
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] min-h-[660px] flex-col">
            <header className="border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-6">
                <div className="flex items-start gap-3">
                    <Link href={`/tickets${query ? `?${query}` : ''}`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"><PiArrowRightDuotone className="text-xl" /></Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg font-black text-gray-950 dark:text-white">{ticket.title}</h1>
                            <span className="rounded-full bg-gray-100 px-2 py-1 font-mono text-[10px] text-gray-500 dark:bg-gray-800">#{ticket.uuid.slice(0, 8)}</span>
                            <span className={classNames('rounded-full px-2.5 py-1 text-xs font-bold', statusStyle[ticket.status])}>{ticket.statusLabel}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1"><PiBuildingsDuotone />{ticket.department.label}</span>
                            <span className="inline-flex items-center gap-1"><PiClockDuotone />{formatDate(ticket.createdAt)}</span>
                            <span className={ticket.priority === 'urgent' ? 'font-bold text-red-600' : ''}>{ticket.priorityLabel}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <PersonPill icon={<PiUserCircleGearDuotone />} label="کاربر" value={ticket.sender?.name ?? 'نامشخص'} />
                    <PersonPill icon={<PiHeadsetDuotone />} label="مسئول" value={ticket.assignedTo?.name ?? 'تخصیص‌نیافته'} />
                    {ticket.provider && <PersonPill icon={<PiShieldCheckDuotone />} label="پراوایدر" value={ticket.provider.name} />}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-gray-50/70 p-4 dark:bg-gray-950/30 sm:p-6">
                <div className="mx-auto max-w-3xl space-y-4">
                    {(ticket.messages ?? []).map((message) => (
                        <div key={message.id} className={classNames('flex', message.actorType === 'support' ? 'justify-start' : 'justify-end')}>
                            <div className={classNames(
                                'max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[76%]',
                                message.isInternal
                                    ? 'border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
                                    : message.actorType === 'support'
                                      ? 'rounded-tr-md bg-primary text-white'
                                      : message.actorType === 'provider'
                                        ? 'rounded-tl-md border border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30'
                                        : 'rounded-tl-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800',
                            )}>
                                <div className={classNames('mb-2 flex items-center gap-2 text-xs font-bold', message.actorType === 'support' && !message.isInternal ? 'text-white/80' : 'text-gray-500 dark:text-gray-300')}>
                                    {message.isInternal && <PiLockKeyDuotone />}
                                    {message.user.name}
                                    <span className="font-normal">{message.isInternal ? 'یادداشت داخلی' : message.user.roleLabel}</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-7">{message.body}</p>
                                {message.attachment?.url && <a href={message.attachment.url} target="_blank" rel="noreferrer" className="mt-3 block rounded-lg bg-black/5 px-3 py-2 text-xs underline">{message.attachment.name ?? 'مشاهده فایل'}</a>}
                                <div className={classNames('mt-2 text-[10px]', message.actorType === 'support' && !message.isInternal ? 'text-white/60' : 'text-gray-400')}>{formatDate(message.createdAt)}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>
            </div>

            <form onSubmit={submit} className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                <textarea className="input min-h-24 w-full resize-y py-3" name="body" maxLength={20000} placeholder={internal ? 'یادداشت فقط برای تیم پشتیبانی...' : 'پاسخ قابل مشاهده برای کاربر و پراوایدر...'} />
                <input
                    ref={fileRef}
                    className="hidden"
                    type="file"
                    name="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.rar,.txt"
                    onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file && file.size > 10 * 1024 * 1024) {
                                    event.target.value = ''
                                    setFileName(null)
                                    setError('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.')
                                    return
                                }
                                setError(null)
                                setFileName(file?.name ?? null)
                            }}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <label className={classNames('inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm', internal ? 'bg-amber-100 font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300')}>
                            <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
                            <PiLockKeyDuotone /> یادداشت داخلی
                        </label>
                        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                            <PiPaperclipDuotone />{fileName ? 'تغییر فایل' : 'پیوست فایل'}
                        </button>
                        {fileName && (
                            <span className="inline-flex max-w-52 items-center gap-1 truncate text-xs text-gray-500">
                                {fileName}
                                <button type="button" aria-label="حذف فایل" onClick={() => { if (fileRef.current) fileRef.current.value = ''; setFileName(null) }}><PiXDuotone /></button>
                            </span>
                        )}
                    </div>
                    <button className="button inline-flex items-center gap-2 bg-primary text-white" disabled={pending} type="submit"><PiPaperPlaneTiltDuotone />{pending ? 'در حال ارسال...' : 'ارسال'}</button>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>
        </div>
    )
}

const Management = ({ ticket, meta }: { ticket: AdminTicket; meta: AdminTicketMeta }) => {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const department = meta.departments.find((item) => item.id === ticket.department.id)
    const supporters = department?.supporters ?? []

    const change = (payload: Record<string, string | number | null>) => {
        setError(null)
        startTransition(async () => {
            const result = await updateAdminTicket(ticket.uuid, payload)
            if (!result.ok) return setError(result.error)
            router.refresh()
        })
    }

    return (
        <aside className="border-t border-gray-200 p-4 dark:border-gray-800 md:col-span-2 xl:col-span-1 xl:border-r xl:border-t-0">
            <h2 className="mb-4 flex items-center gap-2 font-black text-gray-950 dark:text-white"><PiUserCircleGearDuotone className="text-xl text-primary" />مدیریت تیکت</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Control label="دپارتمان">
                    <select disabled={pending} className={selectClass} value={ticket.department.id} onChange={(event) => change({ department_id: Number(event.target.value), status: 'referred' })}>
                        {meta.departments.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                </Control>
                <Control label="پشتیبان مسئول">
                    <select disabled={pending} className={selectClass} value={ticket.assignedTo?.id ?? ''} onChange={(event) => change({ assigned_to_id: event.target.value ? Number(event.target.value) : null })}>
                        <option value="">تخصیص‌نیافته</option>
                        {supporters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </Control>
                <Control label="وکیل یا کارشناس متصل">
                    <select disabled={pending} className={selectClass} value={ticket.provider?.id ?? ''} onChange={(event) => change({ provider_id: event.target.value ? Number(event.target.value) : null })}>
                        <option value="">بدون پراوایدر</option>
                        {meta.providers.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.roleLabel}</option>)}
                    </select>
                </Control>
                <Control label="وضعیت">
                    <select disabled={pending} className={selectClass} value={ticket.status} onChange={(event) => change({ status: event.target.value })}>
                        {Object.entries(meta.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </Control>
                <Control label="اولویت">
                    <select disabled={pending} className={selectClass} value={ticket.priority} onChange={(event) => change({ priority: event.target.value })}>
                        {Object.entries(meta.priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </Control>
            </div>
            {pending && <p className="mt-3 text-xs text-primary">در حال ذخیره تغییرات...</p>}
            {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
            <div className="mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-6 text-gray-500 dark:bg-gray-800/70">
                <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200"><PiWarningCircleDuotone />نکته عملیاتی</div>
                تغییر دپارتمان، مسئول، پراوایدر، وضعیت و اولویت ذخیره و به افراد مرتبط اطلاع‌رسانی می‌شود.
            </div>

        </aside>
    )
}

const Control = ({ label, children }: { label: string; children: ReactNode }) => <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-300">{label}</span>{children}</label>
const PersonPill = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800">{icon}<span className="text-gray-400">{label}:</span><strong>{value}</strong></span>
const EmptyDetail = () => <div className="flex h-full min-h-[660px] flex-col items-center justify-center p-8 text-center"><PiChatCircleTextDuotone className="text-7xl text-primary/50" /><h2 className="mt-5 text-xl font-black">یک تیکت را انتخاب کنید</h2><p className="mt-2 max-w-md text-sm leading-7 text-gray-500">مکالمه و ابزارهای ارجاع و مدیریت در این بخش نمایش داده می‌شوند.</p></div>

const ListPagination = ({ pagination, query }: { pagination: Pagination; query: string }) => {
    const link = (page: number) => {
        const params = new URLSearchParams(query)
        params.set('page', String(page))
        return `/tickets?${params}`
    }
    return <div className="flex items-center justify-between border-t border-gray-200 p-3 text-xs dark:border-gray-800"><Link className={pagination.currentPage <= 1 ? 'pointer-events-none text-gray-300' : 'text-primary'} href={link(Math.max(1, pagination.currentPage - 1))}>قبلی</Link><span>{pagination.currentPage.toLocaleString('fa-IR')} / {pagination.lastPage.toLocaleString('fa-IR')}</span><Link className={pagination.currentPage >= pagination.lastPage ? 'pointer-events-none text-gray-300' : 'text-primary'} href={link(Math.min(pagination.lastPage, pagination.currentPage + 1))}>بعدی</Link></div>
}


const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'

export default AdminTicketWorkspace
