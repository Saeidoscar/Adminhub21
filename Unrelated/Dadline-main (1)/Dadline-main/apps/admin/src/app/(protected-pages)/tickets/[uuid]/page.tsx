import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ErrorState from '@/components/admin/ErrorState'
import { getAdminTicket, getAdminTicketMeta, getAdminTickets } from '@/server/admin/adminData'
import { toQueryString } from '@/utils/adminFormat'
import { notFound } from 'next/navigation'
import AdminTicketWorkspace from '../_components/AdminTicketWorkspace'

type PageProps = {
    params: Promise<{ uuid: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TicketDetailPage({ params, searchParams }: PageProps) {
    const [{ uuid }, values] = await Promise.all([params, searchParams])
    const query = toQueryString(values)
    const [list, detail, metadata] = await Promise.all([
        getAdminTickets(query),
        getAdminTicket(uuid),
        getAdminTicketMeta(),
    ])

    if (detail.status === 404) notFound()
    if (!list.data || !detail.data || !metadata.data) {
        return <ErrorState message={detail.error ?? list.error ?? metadata.error ?? 'تیکت قابل دریافت نیست.'} />
    }

    return (
        <div>
            <AdminPageHeader title="رسیدگی به تیکت" description="مکالمه، یادداشت داخلی، ارجاع و مدیریت اعضای مرتبط با درخواست" />
            <AdminTicketWorkspace
                tickets={list.data.data}
                ticket={detail.data.data}
                filters={list.data.filters}
                meta={metadata.data}
                pagination={list.data.meta}
                query={query}
            />
        </div>
    )
}
