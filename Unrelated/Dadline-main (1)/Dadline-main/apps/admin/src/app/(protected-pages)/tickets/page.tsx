import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import { getAdminTicketMeta, getAdminTickets } from '@/server/admin/adminData'
import { toQueryString } from '@/utils/adminFormat'
import AdminTicketWorkspace from './_components/AdminTicketWorkspace'

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function TicketsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const query = toQueryString(params)
    const [list, metadata] = await Promise.all([getAdminTickets(query), getAdminTicketMeta()])

    if (!list.data || !metadata.data) {
        return <ErrorState message={list.error ?? metadata.error ?? 'اطلاعات تیکت‌ها قابل دریافت نیست.'} />
    }

    return (
        <div>
            <AdminPageHeader title="مدیریت تیکت‌ها" description="پاسخ‌گویی، ارجاع میان دپارتمان‌ها، تعیین مسئول و اتصال وکیل یا کارشناس حقوقی" />
            <AdminTicketWorkspace
                tickets={list.data.data}
                filters={list.data.filters}
                meta={metadata.data}
                pagination={list.data.meta}
                query={query}
            />
        </div>
    )
}
