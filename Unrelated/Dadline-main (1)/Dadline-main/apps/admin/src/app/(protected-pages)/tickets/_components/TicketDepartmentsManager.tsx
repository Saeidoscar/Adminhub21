'use client'

import type { AdminTicketDepartment, AdminTicketMeta } from '@/server/admin/admin.schemas'
import { updateAdminTicketDepartment } from '@/server/admin/adminMutations'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { PiCheckCircleDuotone, PiFloppyDiskDuotone, PiUsersThreeDuotone } from 'react-icons/pi'

type Props = { departments: AdminTicketDepartment[]; meta: AdminTicketMeta }

const TicketDepartmentsManager = ({ departments, meta }: Props) => (
    <div className="grid gap-5 xl:grid-cols-2">
        {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} supporters={meta.supporters} />
        ))}
    </div>
)

const DepartmentCard = ({
    department,
    supporters,
}: {
    department: AdminTicketDepartment
    supporters: AdminTicketMeta['supporters']
}) => {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [active, setActive] = useState(department.isActive)
    const [isDefault, setIsDefault] = useState(department.isDefault)
    const [sortOrder, setSortOrder] = useState(department.sortOrder)
    const [selected, setSelected] = useState<number[]>(department.supporters?.map((item) => item.id) ?? [])
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const save = () => {
        setMessage(null)
        setError(null)
        startTransition(async () => {
            const result = await updateAdminTicketDepartment(department.id, {
                is_active: active,
                is_default: isDefault,
                sort_order: sortOrder,
                supporter_ids: selected,
            })
            if (!result.ok) return setError(result.error)
            setMessage('تنظیمات دپارتمان ذخیره شد.')
            router.refresh()
        })
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-black text-gray-950 dark:text-white">{department.label}</h2>
                        {isDefault && <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">پیش‌فرض</span>}
                    </div>
                    <p className="mt-1 font-mono text-xs text-gray-400">{department.slug}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />فعال</label>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />دپارتمان پیش‌فرض</label>
                </div>
            </div>

            <label className="mt-5 block max-w-40">
                <span className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">ترتیب نمایش</span>
                <input className="input" type="number" min={0} max={1000} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
            </label>

            <div className="mt-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800 dark:text-gray-100"><PiUsersThreeDuotone className="text-xl text-primary" />پشتیبان‌های دپارتمان</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    {supporters.map((supporter) => {
                        const checked = selected.includes(supporter.id)
                        return (
                            <label key={supporter.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${checked ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800'}`}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => setSelected((current) => checked ? current.filter((id) => id !== supporter.id) : [...current, supporter.id])}
                                />
                                <span className="min-w-0"><strong className="block truncate">{supporter.name}</strong><small className="text-gray-500">{supporter.roleLabel}</small></span>
                            </label>
                        )
                    })}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    {message && <p className="inline-flex items-center gap-1 text-sm text-emerald-600"><PiCheckCircleDuotone />{message}</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <button type="button" disabled={pending} onClick={save} className="button inline-flex items-center gap-2 bg-primary text-white"><PiFloppyDiskDuotone />{pending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</button>
            </div>
        </section>
    )
}

export default TicketDepartmentsManager
