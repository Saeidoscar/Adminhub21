import Container from "@/components/shared/Container"
import { getTicketMeta, getTickets } from "@/server/actions/tickets/getTickets"
import { redirect } from "next/navigation"
import TicketsWorkspace from "./_components/TicketsWorkspace"

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    priority?: string
    department?: string
    page?: string
  }>
}

export default async function TicketsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [list, metadata] = await Promise.all([
    getTickets({
      q: params.q,
      status: params.status,
      priority: params.priority,
      department: params.department,
      page: Number(params.page) || 1,
    }),
    getTicketMeta(),
  ])

  if (list.status === 401 || metadata.status === 401)
    redirect("/sign-in?redirectUrl=/pishkhan/tickets")
  if (!metadata.meta) redirect("/pishkhan")

  return (
    <Container>
      <TicketsWorkspace
        tickets={list.items}
        meta={metadata.meta}
        pagination={list.pagination}
        error={list.error ?? metadata.error}
      />
    </Container>
  )
}
