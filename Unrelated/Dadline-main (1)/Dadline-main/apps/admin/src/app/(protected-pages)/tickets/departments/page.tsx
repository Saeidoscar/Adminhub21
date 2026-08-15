import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import { getAdminTicketDepartments, getAdminTicketMeta } from '@/server/admin/adminData'
import Link from 'next/link'
import TicketDepartmentsManager from '../_components/TicketDepartmentsManager'

export default async function TicketDepartmentsPage() {
    const [departments, metadata] = await Promise.all([
        getAdminTicketDepartments(),
        getAdminTicketMeta(),
    ])
    if (!departments.data || !metadata.data) {
        return <ErrorState message={departments.error ?? metadata.error ?? 'دپارتمان‌ها قابل دریافت نیستند.'} />
    }

    return (
        <div>
            <AdminPageHeader
                title="دپارتمان‌های تیکت"
                description="فعال‌سازی، ترتیب نمایش، تعیین واحد پیش‌فرض و تخصیص پشتیبان‌های هر واحد"
                action={<Link className="button border border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" href="/tickets">بازگشت به تیکت‌ها</Link>}
            />
            <TicketDepartmentsManager departments={departments.data.data} meta={metadata.data} />
        </div>
    )
}
