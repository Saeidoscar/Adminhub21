import LawOfficeHero from "./_components/LawOfficeHero"
import LawOfficeFeatures from "./_components/LawOfficeFeatures"
import LawOfficeSteps from "./_components/LawOfficeSteps"
import LawOfficePricing from "./_components/LawOfficePricing"
import LawOfficeFAQ from "./_components/LawOfficeFAQ"
import LawOfficeDownload from "./_components/LawOfficeDownload"

export const metadata = {
  title: "نرم‌افزار ابری مدیریت دفتر وکالت | دادلاین",
  description:
    "نرم‌افزار تخصصی مدیریت دفتر وکالت با هوش مصنوعی — مدیریت پرونده، موکلین، جلسات، صورت‌حساب و مستندات در یک سامانه ابری امن",
}

const LawOfficePage = () => (
  <>
    <LawOfficeHero />
    <LawOfficeFeatures />
    <LawOfficeSteps />
    <LawOfficePricing />
    <LawOfficeFAQ />
    <LawOfficeDownload />
  </>
)

export default LawOfficePage
