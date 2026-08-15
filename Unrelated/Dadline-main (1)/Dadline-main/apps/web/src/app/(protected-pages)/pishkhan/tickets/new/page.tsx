import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import { getTicketMeta } from "@/server/actions/tickets/getTickets"
import { redirect } from "next/navigation"
import TicketCreateForm from "../_components/TicketCreateForm"

export default async function NewTicketPage() {
  const result = await getTicketMeta()
  if (result.status === 401)
    redirect("/sign-in?redirectUrl=/pishkhan/tickets/new")
  if (!result.meta) redirect("/pishkhan/tickets")

  return (
    <Container className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          ثبت تیکت جدید
        </h1>
        <p className="mt-2 text-sm leading-7 text-gray-500">
          اطلاعات دقیق‌تر باعث ارجاع سریع‌تر درخواست به دپارتمان مسئول می‌شود.
        </p>
      </div>
      <AdaptiveCard bodyClass="p-5 sm:p-8">
        <TicketCreateForm meta={result.meta} />
      </AdaptiveCard>
    </Container>
  )
}
