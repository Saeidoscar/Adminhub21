import CallsPage from "./_components/CallsPage"
import type { CallsSearchParams } from "./_components/CallsDirectory"

export const metadata = {
  title: "مشاوره تلفنی حقوقی | دادلاین",
  description:
    "مشاوره تلفنی فوری با بهترین وکلای پایه یک و کارشناسان حقوقی ایران — رزرو آنلاین با دادلاین",
}

type Props = {
  searchParams: Promise<CallsSearchParams>
}

const Page = ({ searchParams }: Props) => (
  <CallsPage searchParams={searchParams} />
)

export default Page
