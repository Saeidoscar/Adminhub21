import MyLawyerPage from "./_components/MyLawyerPage"
import type { MyLawyerSearchParams } from "./_components/MyLawyerDirectory"

export const metadata = {
  title: "وکیل آنلاین | وکیل اختصاصی ۲۴ ساعته | دادلاین",
  description:
    "با سرویس «وکیل مشاور» دادلاین، در هر ساعت از شبانه‌روز به‌صورت برخط تمام سوالات را به‌صورت متنی یا تلفنی از وکیل یا مشاورتان بپرسید.",
}

const Page = ({
  searchParams,
}: {
  searchParams: Promise<MyLawyerSearchParams>
}) => <MyLawyerPage searchParams={searchParams} />

export default Page
