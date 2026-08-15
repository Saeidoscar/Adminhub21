import Container from "@/components/shared/Container"
import {
  getTicket,
  getTicketMeta,
  getTickets,
} from "@/server/actions/tickets/getTickets"
import { notFound, redirect } from "next/navigation"
import TicketsWorkspace from "../_components/TicketsWorkspace"

type PageProps = {
  params: Promise<{ uuid: string }>
  searchParams: Promise<{
    q?: string
    status?: string
    priority?: string
    department?: string
    page?: string
  }>
}

export default async function TicketPage({ params, searchParams }: PageProps) {
  const [{ uuid }, filters] = await Promise.all([params, searchParams])
  const [list, detail, metadata] = await Promise.all([
    getTickets({
      q: filters.q,
      status: filters.status,
      priority: filters.priority,
      department: filters.department,
      page: Number(filters.page) || 1,
    }),
    getTicket(uuid),
    getTicketMeta(),
  ])

  if ([list.status, detail.status, metadata.status].includes(401)) {
    redirect(`/sign-in?redirectUrl=/pishkhan/tickets/${uuid}`)
  }
  if (detail.status === 404 || !detail.ticket) notFound()
  if (!metadata.meta) redirect("/pishkhan/tickets")

  return (
    <Container>
      <TicketsWorkspace
        tickets={list.items}
        selectedTicket={detail.ticket}
        meta={metadata.meta}
        pagination={list.pagination}
        error={detail.error ?? list.error ?? metadata.error}
      />
    </Container>
  )
}
